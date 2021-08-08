const express = require('express');
const router = express.Router();
const agent = require('../models/agent');
const offer = require('../models/offer');
const institute = require('../models/institute');
const package = require('../models/package');
const requirement = require('../models/requirement');
const {authAgent,generateJWT} = require('../authenticate');
const {checkHash,assignLeads} = require('../utils');
const bcrypt = require('bcryptjs');

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

var randomstring = require("randomstring");
var mongoose = require('mongoose');

router.get("/profile", authAgent, (req,res)=>{
    const id = req.tokenData.id;
    let promise = agent.findOne({_id:id}, {password:0}).exec();
        promise.then((doc)=>{
            if(doc){
                res.json({state:true,msg:"Agent profile",profile:doc});
            }  
            else {
                res.json({state:false,msg:"Agent not found"});
            }
        });
});

router.post("/login", (req,res)=>{
    let promise = agent.findOne({_id:req.body.username}).exec();
    promise.then((doc)=>{
        if(doc){
            if(checkHash(doc.password,req.body.password)){
                let token = generateJWT(doc);
                res.json({state:true,token:token,full_name:doc.fullname});
            } else {
                res.json({state:false, msg:"Invalid credentials. Please try again."});
            }

        } else {
            res.json({state:false,msg:"User not found"});
        }
    });
});

router.post("/register",(req,res)=>{
    const newAgent = new agent({_id:req.body.contact_no, email:req.body.email, password:req.body.password, fullname:req.body.full_name});
    
    agent.register_agent(newAgent,(err,agent)=>{
        if(err){
            res.status(400).json({state:false,msg:"User already exist"});
        }
        if(agent){
            let token = generateJWT(agent,"agent");
            res.status(201).json({state:true,msg:"User created",user:{"contact_no":newAgent._id,"full_name":newAgent.fullname,"email":newAgent.email},token:token});
        }
    });
});


router.put("/profile", authAgent, (req,res)=>{
    const id = req.tokenData.id;
    const data = {institution:req.body.institution, nic:req.body.nic, location:req.body.location};

    agent.findByIdAndUpdate({_id: id},data,{useFindAndModify: false},(err, agent)=> { 
        if(err){
            res.status(400).json({state:false,msg:"user not updated"});
        }
        if(agent){
            res.status(200).json({state:true,msg:"User updated"});
        }
    });
});

router.patch("/profile", authAgent, (req,res)=>{
    const id = req.tokenData.id;
    agent.findByIdAndUpdate({_id: id},req.body,{useFindAndModify: false},(err, agent)=> { 
        if(err){
            res.status(400).json({state:false,msg:"user not updated"});
        }
        if(agent){
            res.status(200).json({state:true,msg:"User updated"});
        }
    });
});

router.get("/service", authAgent, (req,res)=>{
    const id = req.tokenData.id;
    agent.findById({_id:id},(err,agent)=>{
        if(agent){
            institute.findById({_id:agent.institution},(err,institute)=>{
                if(institute){
                    res.status(200).json({state:true,msg:"Offered Services",services:institute.services});
                }else{
                    res.status(404).json({state:false,msg:"Agent Institute Not Found",services:[]});
                }
            });
        } else {
            res.status(404).json({state:false,msg:"Agent Not Found"});
        }
    });
});

router.put("/service",authAgent,(req,res)=>{
    const id = req.tokenData.id;
    const data = {services:req.body.services};

    agent.findByIdAndUpdate({_id: id},data,{useFindAndModify: false},(err, agent)=> { 
        if(err){
            res.status(400).json({state:false,msg:"Services not added"});
        }
        if(agent){
            if (agent.services==null){assignLeads(agent._id, 1);}
            res.status(200).json({state:true,msg:"Services are added",user:id});
        }
    });
});

router.get("/offer",authAgent,(req,res)=>{
    const id = req.tokenData.id;
    const valid_status = ["OPEN","CONVERTED","FAILED"];
    const fav = req.query.fav;
    var fav_status = [true, false];
    if (fav=="true"){
        fav_status = [true];
    }

    offer.find({agent:id, status:{ $in: valid_status }, fav:{$in:fav_status}}, (err, offers)=>{
        offer_details_list = [];
        requirement_id_list = [];

        // store the corresponding requirement ids for each offer
        offers.map(_offer=>{
            requirement_id_list.push(mongoose.Types.ObjectId(_offer.requirementid));
        });

        // get the initial requirements related to the ofers.
        requirement.find({ _id: { $in: requirement_id_list } }, {status:0, __v:0}, (err, requirements)=>{
            requirement_details = {};
            offer_details = [];
            // store the corresponding clients who made the requirement
            requirements.map(req=>{
                requirement_details[req._id] = {
                    "client":req.client,
                    "contact":req.contact,
                    "service":req.service,
                    "date":req.date,
                    "amount":req.amount,
                    "service":req.service,
                    "type":req.type,
                    "notes":req.notes
                };
            });
            offers.map((offer)=>{
                offer_details.push({
                    "offerid" : offer._id,
                    "status":offer.status,
                    "favourite":offer.fav,
                    "clientname" : requirement_details[offer.requirementid].client,
                    "requirement":{
                        "client" : requirement_details[offer.requirementid].contact,
                        "date" : requirement_details[offer.requirementid].date,
                        "service" : requirement_details[offer.requirementid].service,
                        "amount":requirement_details[offer.requirementid].amount,
                        "notes":requirement_details[offer.requirementid].notes,
                        "type":requirement_details[offer.requirementid].type
                    }
                });
            });
                res.json({state:true, msg:"All Offers", offers:offer_details});
            });
        });
});

router.patch("/offer",authAgent,(req,res)=>{
    const offerid = req.body.offerid;
    var status = req.body.status;
    if (status=="REQUESTED"){
        status="CONVERTED";
    }
    offer.findOneAndUpdate({_id:offerid} , {status:status}, ()=>{
        res.json({state:true,msg:"State of the Offer is changed to ".concat(status)});
    });
    
});

router.patch("/password",authAgent,(req,res)=>{
    const id = req.tokenData.id;
    var password = req.body.password;

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,(err,hash)=>{
            password = hash;
            if (err) throw err;
            agent.findByIdAndUpdate({_id: id},{password:password},{useFindAndModify: false},(err, agent)=> {
                if (agent){
                    res.json({state:true,msg:"Password Chnaged Successfully"});
                }else{
                    res.json({state:false,msg:"Password Chnaged Failed"});
                }
            });
        })
    })   
});

router.patch("/password-reset",(req,res)=>{
    var transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SENDGRID_USERNAME, 
          pass: process.env.SENDGRID_PASSWORD,
        },
    });
    
    var id = req.body.username;
    var password = randomstring.generate(8);
    console.log(password);
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,(err,hash)=>{
            password = hash;
            if (err) throw err;
            agent.findByIdAndUpdate({_id: id},{password:password},{useFindAndModify: false},(err, agent)=> {
                if (agent){
                    const msg = {
                        to: 'sadilchamishka.16@cse.mrt.ac.lk',
                        from: 'sadilchamishka.16@cse.mrt.ac.lk',
                        subject: 'Sending with SendGrid is Fun',
                        text: 'and easy to do anywhere, even with Node.js',
                        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
                      }
                      sgMail.send(msg).then(() => {
                          console.log('Email sent')
                        })
                        .catch((error) => {
                          console.error(error)
                        });
                    res.json({state:true,msg:"Password Reset Successfully"});
                }
            });   
        });
    });
});

router.patch("/offer/fav",authAgent,(req,res)=>{
    const offerid = req.body.offerid;
    const fav = req.body.fav;

    offer.findOneAndUpdate({_id:offerid} , {fav:fav}, ()=>{
        res.json({state:true,msg:"Update favourite state"});
    });
    
});

router.get("/package", authAgent, (req,res)=>{
    const id = req.tokenData.id;
    package_list = [];

    agent.findById(id,(err,agent)=>{
        if (agent){
            package.findById(agent.package,(err,_package)=>{
                if (_package){
                    package_list.push({"_id":_package._id,"name" : _package.name,"amount":_package.amount,"leads":_package.leads, "exp":agent.package_exp, "active":true});
                }
                package.find({ _id: {$ne: agent.package}},(err,packages)=>{
                    packages.map(_package=>{
                        package_list.push({"_id" : _package._id ,"name" : _package.name,"amount":_package.amount,"leads":_package.leads,"exp":"" ,"active":false});
                    });
                    res.status(200).json({state:true, msg:"LEAD Packages", packages:package_list});
                });
            });
        }
    });
});

module.exports =  router;