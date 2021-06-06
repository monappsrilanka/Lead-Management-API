const express = require('express');
const router = express.Router();
const service = require('../models/service');

router.get("/", (req,res)=>{
    let promise = service.find({},{_id: 0, service:1, type:1}).exec();
    promise.then((services)=>{
        res.status(200).json({state:true, msg:"Offered Services" , services:services});
    });
});

module.exports =  router;