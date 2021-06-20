const express = require('express');
const router = express.Router();
const package = require('../models/package');
const {authenticateJWT} = require('../authenticate');

router.get("/", authenticateJWT, (req,res)=>{
    let promise = package.find().exec();
    promise.then((packages)=>{
        res.status(200).json({state:true, msg:"LEAD Packages", packages:packages});
    });
});

router.post("/", authenticateJWT, (req,res)=>{
    const newPackage = new package({name:req.body.name, amount:req.body.amount, leads:req.body.leads});
    package.savePackage(newPackage,(err,package)=>{
        if(err){
            res.status(400).json({state:false,msg:"Package Already Exists"});
        }
        if(institute){
            res.status(201).json({state:true,msg:"Package created",package:package});
        }
    });
});

module.exports =  router;