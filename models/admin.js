const mongoose =  require('mongoose');
const schema  = mongoose.Schema;
const {hashText} = require('../utils');

const adminSchema  = new schema({
    _id:{type:String,required:true},
    password:{type:String,required:true},
    name:{type:String}
});

module.exports = mongoose.model("admin",adminSchema);

module.exports.saveAdmin = (admin,callback)=>{
    admin.password = hashText(admin.password);
    admin.save(callback);
};