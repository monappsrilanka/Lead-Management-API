const mongoose =  require('mongoose');
const {hashText} = require('../utils');
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
    package:{type:String},
    package_exp:{type:Date}
});

module.exports = mongoose.model("agent",agentSchema);

module.exports.register_agent = (agent,callback)=>{
    agent.password = hashText(agent.password);
    agent.save(callback);
};
