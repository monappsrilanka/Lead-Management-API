const express = require('express');
const router = express.Router();
const agent = require('../models/agent');
const client = require('../models/client');
const bcrypt = require('bcryptjs');
const {generateJWT} = require('../authenticate');

router.post("/", (req,res)=>{
    let promise = client.findOne({_id:req.body.username}).exec();
    promise.then((doc)=>{
        if(doc){
            if(checkPassword(doc.password,req.body.password)){
                let token = generateJWT(doc,"client");
                res.json({state:true,type:"client",token:token,full_name:doc.fullname});
            } else {
                res.json({state:false, msg:"Invalid credentials. Please try again."});
            }

        } else {
            let promise1 = agent.findOne({_id:req.body.username}).exec();
            promise1.then((doc)=>{
                if(doc){
                    if(checkPassword(doc.password,req.body.password)){
                        let token = generateJWT(doc, "agent");
                        res.json({state:true,type:"agent",token:token,full_name:doc.fullname});
                    } else {
                        res.json({state:false,msg:"Invalid credentials. Please try again."});
                    }
                } else {
                    res.json({state:false,msg:"User not found"});
                }
            });
        }
    });
});

const checkPassword = (hash,password)=>{
   return bcrypt.compareSync(password,hash);
};

module.exports =  router;

//bcrypt.compareSync(); 