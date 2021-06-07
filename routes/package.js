const express = require('express');
const router = express.Router();
const package = require('../models/package');

router.get("/", (req,res)=>{
    let promise = package.find().exec();
    promise.then((packages)=>{
        console.log(packages);
        res.status(200).json({state:true, msg:"LEAD Packages", packages:packages});
    });
});

module.exports =  router;