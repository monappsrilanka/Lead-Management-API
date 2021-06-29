const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const requirement = require('./models/requirement');
const offer = require('./models/offer');
const agent = require('./models/agent');

module.exports.assignLeads = (id,count)=>{

    agent.findOne({_id:id},(err,agent)=>{
        if (agent){
            offer.find({agent:agent}, (err,prev_requirements)=>{
                if (prev_requirements){
                    var req_ids = [];
                    prev_requirements.map(prev_requirement=>{
                        req_ids.push(prev_requirement.requirementid);
                    });
        
                    requirement.find({service:{$in:agent.services}, count: {$lte: 4}, _id:{$nin:req_ids}}, (err, requirements)=>{
                        requirements.map(_req=>{
                            const newoffer = new offer({requirementid:_req._id, agent:id, date:new Date()});
                            offer.saveOffer(newoffer,(err,_offer)=>{
                                if(err){
                                    console.log("ERROR Occured durinng creating Offers");
                                } else {
                                    requirement.findOneAndUpdate({_id :_req._id}, {$inc : {count : 1}},()=>{
                                        console.log("Incremented the counter");
                                    });
                                }
                            });
                        });
                    }).sort({date: 1}).limit(count); 
                }
            });
        }
    });
    
}

module.exports.checkHash = (hash,password)=>{ 
    return bcrypt.compareSync(password,hash);
};

module.exports.md5 = (string)=>{ 
    return crypto.createHash('md5').update(string).digest("hex");
};