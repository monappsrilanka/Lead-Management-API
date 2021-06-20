const express = require('express');
const router = express.Router();
const client = require('../models/client');
const offer = require('../models/offer');
const requirement = require('../models/requirement');
const bcrypt = require('bcryptjs');
const {authorizeClient, generateJWT} = require('../authenticate');


router.get("/profile", authorizeClient, (req,res)=>{
    const id = req.tokenData.id;

    let promise1 = client.findOne({_id:id}, {password:0}).exec();
        promise1.then((doc)=>{
            if(doc){
                res.json({state:true,msg:"Client profile",profile:doc});
            }  
            else {
                res.json({state:false,msg:"Cient not found"});
            }
        });
});

router.post("/login", (req,res)=>{
    let promise = client.findOne({_id:req.body.username}).exec();
    promise.then((doc)=>{
        if(doc){
            if(checkPassword(doc.password,req.body.password)){
                let token = generateJWT(doc,"client");
                res.json({state:true,token:token,full_name:doc.fullname});
            } else {
                res.json({state:false, msg:"Invalid credentials. Please try again."});
            }

        } else {
            res.json({state:false,msg:"Client not found"});
        }
    });
});

router.post("/register",(req,res)=>{
    const newClient = new client({
        _id:req.body.contact_no,
        email:req.body.email,
        fullname:req.body.full_name,
        gender:req.body.gender,
        password:req.body.password,
        location:req.body.location
    });
    
    client.saveClient(newClient,(err,client)=>{
        if(err){
            res.status(400).json({state:false,msg:"User already exist"});
        }
        if(client){
            let token = generateJWT(client,"client");
            res.status(201).json({state:true,msg:"User created",full_name:newClient.fullname,token:token});
        }
    });
});

router.post("/requirement", authorizeClient, (req,res)=>{
    const newRequirement = new requirement({
        client:req.tokenData.id,
        service:req.body.service,
        amount:req.body.amount,
        notes:req.body.notes,
        type:req.body.types,
        date:new Date(),
        status:"OPEN"
    });

    requirement.saveRequirement(newRequirement,(err,requirement)=>{
        if(err){
            res.status(400).json({state:false,msg:"Requirement Not Created"});
        }
        if(requirement){
            res.status(201).json({state:true,msg:"Your Requirement Created"});
        }
    });
    
});

// client wants to view the requirements he has made.
router.get("/requirement",authorizeClient,(req,res)=>{
    // client id is set by the middleware.
    const id = req.tokenData.id;

    // get requirements corresponds to the client
    requirement.find({client:id}, (err, requirements)=>{

        requirements_id_list = [];

        // store respective requirement id for requirements.
        requirements.map(_requirement=>{
            requirements_id_list.push(_requirement._id);
        });

        requirement_with_details = [];

        // get offers with respect to the each requirement
        offer.find({ requirementid: { $in: requirements_id_list } }, (err, offers)=>{

            requirements_dic = {};

            // Manage a dictionary for each requirement as the key and list of offers with REQUESTED status as the value.
            offers.map(_offer=>{
                var requirement_id = _offer.requirementid;

                    if (requirement_id in requirements_dic){
                        requirements_dic[requirement_id].push(_offer);
                    } else {
                        requirements_dic[requirement_id] = [];
                        requirements_dic[requirement_id].push(_offer);
                    }
            });

            // Enrich the requirements list with adding the list of offers attached to each one.
            requirements.map(requirement=>{
                requirement_with_details.push({
                    "requirementid": requirement._id,
                    "client" : requirement.client,
                    "service" : requirement.service,
                    "date" : requirement.date,
                    "amount" : requirement.amount,
                    "notes" : requirement.notes,
                    "type" : requirement.type,
                    "status" : requirement.status,
                    "offers" : requirements_dic[requirement._id]
                });
            });

            res.json({state:true, msg: "All Requirements", requirements:requirement_with_details});
        });
    });
});

// update the requirement attributed
router.put("/requirement",authorizeClient,(req,res)=>{
    const amount = req.body.amount;
    const notes = req.body.notes;

    requirement.findByIdAndUpdate(req.body.id, {amount:amount, notes:notes}, (err, _requirement) => { 
    if (err){ 
        res.json({state:false, msg:"Requirement update failed"});
    } 
    else{ 
        res.json({state:true, msg:"Requirement updated"});
    } 
    });
});

// delete the requirement
router.delete("/requirement/:id",authorizeClient,(req,res)=>{

    // find and delete the requirement
    requirement.findByIdAndDelete(req.params['id'], (err, _requirement) => { 
    if (err){ 
        res.json({state:false, msg:"Requirement delete failed"});
    } 
    else{ 
        // after successfully deleting the requirement, delete all the attached offers to that requirement.
        offer.deleteMany({ "requirementid" : req.params['id']}, ()=>{
            res.json({state:true, msg:"Requirement deleted"});
        });  
    } 
    });
});

// client need to update the status of a requirement
router.patch("/requirement",authorizeClient,(req,res)=>{
    const requirementid = req.body.requirementid;
    const status = req.body.status;

    requirement.findOneAndUpdate({_id:requirementid} , {status:status} , ()=>{

        if (status=="CLOSED"){
            offer.updateMany({requirementid:requirementid}, {status:"ABORT"}, ()=>{
                res.json({state:true, msg: "Requirement is Closed"});
            });
        } else{
            res.json({state:true, msg: "Requirement is Opened"});
        }
    });
    
});

// client need to update the status of an offer related to his requirement
router.patch("/offer",authorizeClient,(req,res)=>{
    const offerid = req.body.offerid;
    const status = req.body.status;

    offer.findOneAndUpdate({_id:offerid} , {status:status} , ()=>{
        res.json({state:true, msg: "Send notification to agent"});
    });
    
});

const checkPassword = (hash,password)=>{
    return bcrypt.compareSync(password,hash);
 };

module.exports =  router;