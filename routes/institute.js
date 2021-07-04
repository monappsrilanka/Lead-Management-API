const express = require('express');
const router = express.Router();
const institute = require('../models/institute');
const {authenticateJWT, authorizeAdmin} = require('../authenticate');

router.get("/", authenticateJWT, (req,res)=>{
    institute.find({},(err,institutes)=>{
        res.status(200).json({state:true, msg:"Service Providers", institutes:institutes});
    });
});

router.post("/", authorizeAdmin, (req,res)=>{
    const newInstitute = new institute({name:req.body.name, services:req.body.services, type:req.body.type});
    institute.saveInstitute(newInstitute,(err,institute)=>{
        if(err){
            console.log(err);
            res.status(400).json({state:false,msg:"Institue Already Exists"});
        }
        if(institute){
            res.status(201).json({state:true,msg:"Institute created",institute:institute});
        }
    });
});

router.patch("/", authorizeAdmin, (req,res)=>{
    institute.findByIdAndUpdate({_id: req.body._id}, req.body, {new: true}, (err,institute)=>{
        if(err){
            res.status(400).json({state:false,msg:"Bad Request"});
        }
        if(institute){
            res.status(201).json({state:true,msg:"Institute Updated",institute:institute});
        }
    });
});

router.delete("/", authorizeAdmin, (req,res)=>{
    institute.findByIdAndDelete({_id: req.body._id}, (err)=>{
        if(err){
            res.status(400).json({state:false,msg:"Bad Request"});
        } else {
            res.status(200).json({state:true,msg:"Institute Deleted"});
        }
    });
});

module.exports =  router;