const mongoose =  require('mongoose');
const schema  = mongoose.Schema;

const packageSchema  = new schema({
    name:{type:String,required:true},
    amount:{type:String,required:true},
    leads:{type:Number}
});

module.exports = mongoose.model("package",packageSchema);

module.exports.savePackage = (package,callback)=>{
    package.save(callback);
};