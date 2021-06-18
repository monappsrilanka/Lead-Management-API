const mongoose =  require('mongoose');
const bcrypt = require('bcryptjs');
const schema  = mongoose.Schema;

const agentSchema  = new schema({
    _id:{type:String,required:true},  //Contact NO
    fullname:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    nic:{type:String},
    institution:{type:String},
    location:{type:String},
    services:{type:schema.Types.Mixed},
    package:{type:String, default:"NORMAL"},
});

module.exports = mongoose.model("agent",agentSchema);

// first agent registration
module.exports.register_agent = (agent,callback)=>{
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(agent.password,salt,(err,hash)=>{
            agent.password = hash;

            if (err) throw err;
            agent.save(callback);
        })
    })    
};
