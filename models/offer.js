const mongoose =  require('mongoose');
const schema  = mongoose.Schema;

const offerSchema  = new schema({
    requirementid:{type:String,required:true},
    agent:{type:String,required:true},
    status:{type:String,default:"OPEN"},
    fav:{type:Boolean, default:false},
    date:{type:Date}
});

module.exports = mongoose.model("offer",offerSchema);

module.exports.saveOffer = (offer,callback)=>{
    offer.save(callback);
};