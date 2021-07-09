const express = require('express');
const router = express.Router();
const requirement = require('../models/requirement');

router.post("/requirement", (req,res)=>{
    const newRequirement = new requirement({
        client:req.body.name,
        contact:req.body.contact,
        service:req.body.service,
        amount:req.body.amount,
        notes:req.body.notes,
        type:req.body.types,
        date:new Date(),
        status:"OPEN"
    });

    requirement.saveRequirement(newRequirement,(err,requirement)=>{
        if(err){
            console.log(err);
            res.status(400).json({state:false,msg:"Requirement Not Created"});
        }
        if(requirement){
            res.status(201).json({state:true,msg:"Your Requirement Created"});
        }
    });
});

module.exports =  router;