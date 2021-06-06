const express = require('express');
const router = express.Router();
const agent = require('../models/agent');
const client = require('../models/client');
const {authenticateJWT} = require('../authenticate');

router.get("/", authenticateJWT, (req,res)=>{
    const id = req.tokenData.id;
    const type = req.tokenData.type;

    if (type=="client"){
        let promise = client.findOne({_id:id}, {password:0}).exec();   // user profile except password data
        promise.then((doc)=>{
            if(doc){res.json({state:true,type:"client",msg:"Client profile",profile:doc});
            } else{res.json({state:false,msg:"Client not found"});}
         });
    }
    else {
        let promise1 = agent.findOne({_id:id}, {password:0}).exec();
        promise1.then((doc)=>{
            if(doc){res.json({state:true,type:"agent",msg:"Agent profile",profile:doc});}  
            else {res.json({state:false,msg:"Agent not found"});}
        });
    }
});

router.put("/", authenticateJWT, (req,res)=>{
    const id = req.tokenData.id;
    const type = req.tokenData.type;

    if (type=="client"){
        client.findByIdAndUpdate(id, req.body, (err, profile) => { 
            if (err){ res.json({state:false, msg:"Profile update failed"});} 
            else{ res.json({state:true, msg:"Profile updated", profile:profile});} 
        });
    }
    else {
        agent.findByIdAndUpdate(id, req.body, (err, profile) => { 
            if (err){ es.json({state:false, msg:"Profile update failed"});} 
            else{ res.json({state:true, msg:"Profile updated", profile:profile});} 
        });
    }
});

module.exports =  router;

//bcrypt.compareSync(); 