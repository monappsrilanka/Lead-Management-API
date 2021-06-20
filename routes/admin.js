const express = require('express');
const router = express.Router();
const admin = require('../models/admin');
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

module.exports =  router;