const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const requirement = require('../models/requirement');
const offer = require('../models/offer');
const package = require('../models/package');
const agent = require('../models/agent');

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

    console.log("merchant_id" + merchant_id);
    console.log("order_id" + order_id);
    console.log("payhere_amount" + payhere_amount);
    console.log("payhere_currency" + payhere_currency);
    console.log("status_code" + status_code);
    console.log("**************************************");

    var local_md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret).toUpperCase());
    
    if (local_md5sig.toUpperCase() == md5sig && status_code == 2){
        console.log("Suceess");
        package.findOne({_id:package_id},(err,package)=>{
            if (err){
                console.log("ERROR occured during seearching package");
            } else{
                agent.findOneAndUpdate({_id:agent_id} , {package:package.name}, (err,agent)=>{
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

const md5 = (string)=>{
    return crypto.createHash('md5').update(string).digest("hex");; 
};

const assignLeads = (id,count)=>{
    requirement.find({count: {$lte: 4}}, (err, requirements)=>{
        requirements.map(_req=>{
            const newoffer = new offer({requirementid:_req._id, agent:id, date:new Date()});
            offer.saveOffer(newoffer,(err,_offer)=>{
                if(err){
                    console.log("ERROR Occured durinng creating Offers");
                } else {
                    requirement.findOneAndUpdate({_id :_req._id}, {$inc : {count : 1}},()=>{
                        console.log("Incremented the counter");
                    });
                }
            });
        });
    }).limit(count); 
}

module.exports =  router;
