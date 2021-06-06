const express = require('express');
const router = express.Router();
const agent = require('../models/agent');
const client = require('../models/client');
const offer = require('../models/offer');
const requirement = require('../models/requirement');
const jwt = require('jsonwebtoken');
const {authenticateJWT} = require('../authenticate');
var mongoose = require('mongoose');

router.post("/register_agent",(req,res)=>{
    const newAgent = new agent({
        _id:req.body.contact_no,
        email:req.body.email,
        password:req.body.password,
        fullname:req.body.full_name
    });
    
    agent.register_agent(newAgent,(err,agent)=>{
        if(err){
            res.status(400).json({state:false,msg:"User already exist"});
        }
        if(agent){
            res.status(201).json({state:true,msg:"User created",user:{"contact_no":newAgent._id,"full_name":newAgent.fullname,"email":newAgent.email}});
        }
    });
});


router.post("/update_agent",(req,res)=>{
    const contact_no = req.body.contact_no;
    const data = {institution:req.body.institution, nic:req.body.nic, location:req.body.location};

    agent.update_agent(contact_no,data, (err, agent)=> { 
        if(err){
            res.status(400).json({state:false,msg:"user not updated"});
        }
        if(agent){
            res.status(200).json({state:true,msg:"User updated"});
        }
    });
});

router.post("/update_services",(req,res)=>{
    const contact_no = req.body.contact_no;
    const data = {services:req.body.services};

    agent.update_services(contact_no, data, (err, agent)=> { 
        if(err){
            res.status(400).json({state:false,msg:"Services not added"});
        }
        if(agent){
            let token = jwt.sign({username:contact_no},'secret',{expiresIn : '168h'});
            res.status(200).json({state:true,msg:"Services are added",token:token,user:contact_no,type:"agent"});
        }
    });
});

// Agent need to get the offers he has recieved with details.
router.get("/offer",authenticateJWT,(req,res)=>{

    // id is put to the request body by the authentication middleware after authentication.
    const id = req.tokenData.id;
    const valid_status = ["OPEN","REQUESTED", "ACCEPTED", "DECLINED"];
    const fav = req.query.fav;
    var fav_status = [true, false];
    if (fav=="true"){
        fav_status = [true];
    }
    // get the offers done by agent.
    offer.find({agent:id, status:{ $in: valid_status }, fav:{$in:fav_status}}, (err, offers)=>{
        offer_details_list = [];
        requirement_id_list = [];

        console.log(offers);
        // store the corresponding requirement ids for each offer
        offers.map(_offer=>{
            requirement_id_list.push(mongoose.Types.ObjectId(_offer.requirementid));
        });

        // get the initial requirements related to the ofers.
        requirement.find({ _id: { $in: requirement_id_list } }, {status:0, _id:0, __v:0}, (err, requirements)=>{
            client_name_array = [];

            // store the corresponding clients who made the requirement
            requirements.map(req=>{
                // clinet name array can have redundant values as 2 or more requiremnets may have been created by the same client.
                client_name_array.push(req.client);
            });

            // get the details of respective clients (the retrevied clients can be less than or equal to client_name_array as the above explained reason)
            client.find({ _id: { $in: client_name_array } }, (err, clients)=>{
                name_dic = {};

                // store the client names in a dictionary
                clients.map(client=>{
                    name_dic[client._id] = client.fullname;
                });

                const package = req.tokenData.package;
                const num_of_offers = offers.length;

                var max_view_offers = 2;
                if (package=="PREMIUM"){
                    max_view_offers = 5;
                }

                // store the full offer details with its corresponding clients name who made the requirement.
                offers.map((_offer,i)=>{
                    var view_status = false;
                    if (num_of_offers-max_view_offers<=i){
                        view_status = true;
                    }

                    offer_details_list.push({
                        "offerid" : offers[i]._id,
                        "status":offers[i].status,
                        "favourite":offers[i].fav,
                        "clientname" : name_dic[client_name_array[i]],
                        "requirement":requirements[i],
                        "view":view_status
                    });
                });
                res.json({state:true, msg:"Open Offers", offers:offer_details_list});
            });
        })
    });
});

router.patch("/offer",authenticateJWT,(req,res)=>{
    const offerid = req.body.offerid;
    const status = req.body.status;

    offer.findOneAndUpdate({_id:offerid} , {status:status}, ()=>{
        res.json({state:true,msg:"State of the Offer is changed to ".concat(status)});
    });
    
});

router.patch("/offer/fav",authenticateJWT,(req,res)=>{
    const offerid = req.body.offerid;
    const fav = req.body.fav;

    offer.findOneAndUpdate({_id:offerid} , {fav:fav}, ()=>{
        res.json({state:true,msg:"Update favourite state"});
    });
    
});

router.post("/upgrade",authenticateJWT,(req,res)=>{
    const id = req.tokenData.id;
    const package = req.body.package;

    agent.findOneAndUpdate({_id:id} , {package:package}, ()=>{
        res.json({state:true,msg:"Update package"});
    });
    
});

module.exports =  router;