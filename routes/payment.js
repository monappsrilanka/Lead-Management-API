const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.post("/", (req,res)=>{
    var merchant_id = req.body.merchant_id;
    var order_id = req.body.order_id;
    var payhere_amount = req.body.payhere_amount;
    var payhere_currency = req.body.payhere_currency;
    var status_code = req.body.status_code;
    var md5sig = req.body.md5sig;
    var merchant_secret = process.env.MERCHANT_SECRET;

    console.log("merchant_id" + merchant_id);
    console.log("order_id" + order_id);
    console.log("payhere_amount" + payhere_amount);
    console.log("payhere_currency" + payhere_currency);
    console.log("status_code" + status_code);
    console.log("**************************************");

    var local_md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret).toUpperCase());
    
    if (local_md5sig.toUpperCase() == md5sig && status_code == 2){
        console.log("Suceess");
    }
    res.sendStatus(200);
});

const md5 = (string)=>{
    
    return crypto.createHash('md5').update(string).digest("hex");; 
};

module.exports =  router;
