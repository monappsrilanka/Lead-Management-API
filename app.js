const express = require('express');
const cors = require('cors');
const bodyParser =  require('body-parser');
const client = require('./routes/client');
const agent = require('./routes/agent');
const admin = require('./routes/admin');
const institute = require('./routes/institute');
const service = require('./routes/service');
const payment = require('./routes/payment');
const package = require('./routes/package');

const config = require('./config.js');
const mongoose = require('mongoose');

const app =  express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

const connection = mongoose.connect(config.database,{ useNewUrlParser: true,useUnifiedTopology: true });
if (connection){
    console.log("Database Connected");
}
else{
    console.log("Error while accessing database");
}

app.use('/admin',admin);
app.use('/client',client);
app.use('/agent',agent);
app.use('/institute',institute);
app.use('/service',service);
app.use('/payment', payment);
app.use('/package', package);

var port = process.env.PORT || 3000 

app.listen(port,()=>{
    console.log("listening on port 3000");
});