const express = require('express');
const router = express.Router();
const requirement = require('../models/requirement');
const {authAdmin} = require('../authenticate');

router.get("/lead", (req,res)=>{
    const status = req.query.status;
    var search = {};
    if (status!=null){search = {status:status};}
   
    requirement.find(search,(err,requirements)=>{
        if (requirements){
            res.status(200).json({state:true, msg:"LEADs", leads:requirements});
        } else {
            res.status(200).json({state:false, msg:"Failed", leads:[]});
        }
    });
});

router.patch("/lead",authAdmin,(req,res)=>{
    const requirement_id = req.body.id;
    const status = req.body.status;

    requirement.findOneAndUpdate({_id:requirement_id} , {status:status}, {new: true}, (err,lead)=>{
        if (lead){
            res.json({state:true,lead:lead});
        }
    });
    
});

module.exports =  router;