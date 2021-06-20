const express = require('express');
const router = express.Router();
const package = require('../models/package');
const agent = require('../models/agent');
const {assignLeads,md5} = require('../utils');

const merchant_secret = process.env.MERCHANT_SECRET;

router.post("/", (req,res)=>{
    var merchant_id = req.body.merchant_id;
    var order_id = req.body.order_id;
    var payhere_amount = req.body.payhere_amount;
    var payhere_currency = req.body.payhere_currency;
    var status_code = req.body.status_code;
    var md5sig = req.body.md5sig;
    var agent_id = req.body.custom_1;
    var package_id = req.body.custom_2;

    console.log("package_id =" + package_id + "*****");
   
    var local_md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret).toUpperCase());
    
    if (local_md5sig.toUpperCase() == md5sig && status_code == 2){
        console.log("Suceess");
        package.findById(package_id,(err,package)=>{
            if (err){
                console.log("ERROR occured during seearching package");
            } else{
                var date = new Date(); 
                date.setDate(date.getDate() + 30);
                agent.findOneAndUpdate({_id:agent_id} , {package:package._id, package_exp:date}, (err,agent)=>{
                    if (err){
                        console.log("ERROR occured during change agent package");
                    } else {
                        assignLeads(agent_id,package.leads);
                    }
                }); 
            }
        });
    
        res.sendStatus(200);
    } 
});

module.exports =  router;
