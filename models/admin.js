const mongoose =  require('mongoose');
const bcrypt = require('bcryptjs');
const schema  = mongoose.Schema;

const adminSchema  = new schema({
    _id:{type:String,required:true},
    password:{type:String,required:true},
    name:{type:String}
});

module.exports = mongoose.model("admin",adminSchema);

module.exports.saveAdmin = (admin,callback)=>{
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(admin.password,salt,(err,hash)=>{
            admin.password = hash;

            if (err) throw err;
            admin.save(callback);
        })
    })
};