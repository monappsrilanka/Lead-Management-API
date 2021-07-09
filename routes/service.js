const express = require('express');
const router = express.Router();
const service = require('../models/service');
const {authAdmin} = require('../authenticate');

router.get("/", (req,res)=>{
    service.find((err,services)=>{
        res.status(200).json({state:true, msg:"Offered Services" , services:services});
    });
});

router.post("/", authAdmin,  (req,res)=>{
    const newService = new service({service:req.body.service, calMethod:req.body.calMethod, type:req.body.type});
    
    service.saveService(newService,(err,service)=>{
        if(err){
            res.status(400).json({state:false,msg:"Service Already exist"});
        }
        if(service){
            res.status(201).json({state:true,msg:"Service Created"});
        }
    });
});

module.exports =  router;