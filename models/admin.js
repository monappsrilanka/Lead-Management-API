const mongoose =  require('mongoose');
const schema  = mongoose.Schema;

const adminSchema  = new schema({
    _id:{type:String,required:true},  //admin name
    password:{type:String,required:true}
});

module.exports = mongoose.model("admin",adminSchema);