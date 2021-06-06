const mongoose =  require('mongoose');
const bcrypt = require('bcryptjs');
const schema  = mongoose.Schema;

const clientSchema  = new schema({
    _id:{type:String,required:true},  //contact_NO
    fullname:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    gender:{type:String},
    location:{type:String}
});

module.exports = mongoose.model("client",clientSchema);

module.exports.saveClient = (client,callback)=>{
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(client.password,salt,(err,hash)=>{
            client.password = hash;

            if (err) throw err;
            client.save(callback);
        })
    })
};