const express = require('express');
const router = express.Router();
const service = require('../models/service');
const {authenticateJWT, authorizeAdmin} = require('../authenticate');

router.get("/", authenticateJWT, (req,res)=>{
    let promise = service.find({},{_id: 0, service:1, type:1}).exec();
    promise.then((services)=>{
        res.status(200).json({state:true, msg:"Offered Services" , services:services});
    });
});

router.post("/", authenticateJWT,  (req,res)=>{
    const newService = new service({service:req.body.service,type:req.body.type});
    
    service.saveService(newService,(err,service)=>{
        if(err){
            res.status(400).json({state:false,msg:"Service Already exist"});
        }
        if(service){
            res.status(201).json({state:true,msg:"Service created"});
        }
    });
});

module.exports =  router;