const mongoose =  require('mongoose');
const schema  = mongoose.Schema;

const requirementSchema  = new schema({
    client:{type:String,required:true},
    service:{type:String,required:true},
    date:{type:Date},
    amount:{type:String},
    notes:{type:String},
    type:{type:schema.Types.Mixed},
    count:{type:Number,default:0},
    status:{type:String}
});

module.exports = mongoose.model("requirement",requirementSchema);

module.exports.saveRequirement = (requirement,callback)=>{
    requirement.save(callback);
};