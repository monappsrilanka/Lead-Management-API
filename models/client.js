const mongoose =  require('mongoose');
const {hashText} = require('../utils');
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
    client.password = hashText(client.password);
    client.save(callback);
};