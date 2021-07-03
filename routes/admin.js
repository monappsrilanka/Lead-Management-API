const express = require('express');
const router = express.Router();
const admin = require('../models/admin');
const requirement = require('../models/requirement');

const {authorizeAdmin,generateJWT} = require('../authenticate');
const {checkHash} = require('../utils');

router.get("/profile", authorizeAdmin, (req,res)=>{
    const id = req.tokenData.id;

    let promise = admin.findOne({_id:id}, {password:0}).exec();
        promise.then((doc)=>{
            if(doc){
                res.json({state:true,msg:"Admin profile",profile:doc});
            }  
            else {
                res.json({state:false,msg:"Admin not found"});
            }
        });
});

router.post("/login", (req,res)=>{
    let promise = admin.findOne({_id:req.body.username}).exec();
    promise.then((doc)=>{
        if(doc){
            if(checkHash(doc.password,req.body.password)){
                let token = generateJWT(doc,"admin");
                res.json({state:true,token:token,full_name:doc.fullname});
            } else {
                res.json({state:false, msg:"Invalid credentials. Please try again."});
            }

        } else {
            res.json({state:false,msg:"Admin not found"});
        }
    });
});

router.get("/lead", authorizeAdmin, (req,res)=>{
    requirement.find((err,requirements)=>{
        if (requirements){
            res.status(200).json({state:true, msg:"LEADs", leads:requirements});
        } else {
            res.status(200).json({state:false, msg:"Failed", leads:[]});
        }
    });
});

router.patch("/lead",authorizeAdmin,(req,res)=>{
    const requirement_id = req.body.id;
    const status = req.body.status;

    requirement.findOneAndUpdate({_id:requirement_id} , {status:status}, {new: true}, (err,lead)=>{
        if (lead){
            res.json({state:true,lead:lead});
        }
    });
    
});

module.exports =  router;