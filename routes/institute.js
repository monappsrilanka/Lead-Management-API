const express = require('express');
const router = express.Router();
const institute = require('../models/institute');
const {authAdmin} = require('../authenticate');

router.get("/", (req,res)=>{
    institute.find({},(err,institutes)=>{
        res.status(200).json({state:true, msg:"Service Providers", institutes:institutes});
    });
});

router.get("/service", (req,res)=>{
    const id = req.query.bank;
    institute.find({_id:id},(err,inst)=>{
        if(inst){
            res.status(200).json({state:true, msg:"Services", services:inst.services});
        } else {
            res.status(400).json({state:false, msg:"Institute Not Found"});
        }
    });
});

router.post("/", authAdmin, (req,res)=>{
    const newInstitute = new institute({_id:req.body.name, services:req.body.services, type:req.body.type});
    institute.saveInstitute(newInstitute,(err,institute)=>{
        if(err){
            res.status(400).json({state:false,msg:"Institue Already Exists"});
        }
        if(institute){
            res.status(201).json({state:true,msg:"Institute created",institute:institute});
        }
    });
});

router.delete("/", authAdmin, (req,res)=>{
    institute.findByIdAndDelete({_id: req.body._id}, (err)=>{
        if(err){
            res.status(400).json({state:false,msg:"Bad Request"});
        } else {
            res.status(200).json({state:true,msg:"Institute Deleted"});
        }
    });
});

module.exports =  router;