const express = require('express');
const router = express.Router();
const institute = require('../models/institute');
const {authenticateJWT} = require('../authenticate');

router.get("/", authenticateJWT, (req,res)=>{
    let promise = institute.find({},{ _id: 1, services:1}).exec();
    promise.then((institutes)=>{
        res.status(200).json({state:true, msg:"Service Providers", institutes:institutes});
    });
});

router.post("/", authenticateJWT, (req,res)=>{
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

router.patch("/", authenticateJWT, (req,res)=>{
    const data = {services:req.body.services, type:req.body.type};
    institute.findByIdAndUpdate({_id: req.body._id}, data, {new: true}, (err,institute)=>{
        if(err){
            res.status(400).json({state:false,msg:"Bad Request"});
        }
        if(institute){
            res.status(201).json({state:true,msg:"Institute Updated",institute:institute});
        }
    });
});

router.delete("/", authenticateJWT, (req,res)=>{
    institute.findByIdAndDelete({_id: req.body._id}, (err)=>{
        if(err){
            res.status(400).json({state:false,msg:"Bad Request"});
        } else {
            res.status(200).json({state:true,msg:"Institute Deleted"});
        }
    });
});

module.exports =  router;