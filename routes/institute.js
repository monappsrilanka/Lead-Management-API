const express = require('express');
const router = express.Router();
const institute = require('../models/institute');

router.get("/", (req,res)=>{
    let promise = institute.find({},{ _id: 1, services:1}).exec();
    promise.then((institutes)=>{
        res.status(200).json({state:true, msg:"Service Providers", institutes:institutes});
    });
});

module.exports =  router;