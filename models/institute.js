const mongoose =  require('mongoose');
const schema  = mongoose.Schema;

const instituteSchema  = new schema({
    _id:{type:String,required:true},  //institution name
    services:{type:schema.Types.Mixed,required:true},
    type:{type:String}
});

module.exports = mongoose.model("institute",instituteSchema);

module.exports.saveInstitute = (institute,callback)=>{
    institute.save(callback);
};