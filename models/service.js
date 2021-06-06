const mongoose =  require('mongoose');
const schema  = mongoose.Schema;

const serviceSchema  = new schema({
    service:{type:String,required:true},
    type:{type:schema.Types.Mixed}

});

module.exports = mongoose.model("service",serviceSchema);
