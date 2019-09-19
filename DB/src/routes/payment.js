//let MemberModel = require('../models/member.model')
let KEYS = require("/Users/lylelondraville/Desktop/Coding/Mountaineers/LyleLondraville.github.io/DB/API_Keys/keys")
//let KEYS = require("/root/LyleLondraville.github.io/DB/API_Keys/keys.js")
let express = require('express')
let request = require('request')
//let nodemailer = require('nodemailer')
let fs = require('fs')
let router = express.Router()
let cors = require('cors')

// work through api debiug again 
// only have one error promise function 


//http://localhost:3000/member

// POST
// Create a new customer

router.options('/payment', cors())


router.post('/payment', cors(), (req, res) => {

  
  //check for all qeary paramiters
  if(!req.query.firstName || !req.query.lastName ||
     !req.query.dotNumber || !req.query.paymentType || !req.query.paymentAmount ||
     !req.query.paymentDescription || !req.query.iso2 || req.query.iso2.length != 2) {

    return res.status(400).json({"error": "Missing paramiter"})
  }

  if(!req.header("Stripe-Token")){

    return res.status(400).json({"error": "Stripe key"})
 }
	

  var paymentAmount

  if(req.query.paymentType == "Membership-semester"){
    paymentAmount = 30
  }else if(req.query.paymentType == "Membership-year"){
    paymentAmount = 40
  }else if(req.query.paymentType == "other"){
    paymentAmount = req.query.paymentAmount
  }else{
      res.status(400).json({"error":"invalid payment type"})
  }

    const stripe = require('stripe')(KEYS.stripe_private);

    stripe.charges.create({
        amount: paymentAmount*100,
        currency: 'usd',
        description: 'membership',
        source: req.header("Stripe-Token"),
        metadata: {name: `${req.query.firstName} ${req.query.lastName}.${req.query.dotNumber}`.toLowerCase()}
    
    }).then(function(result){
      res.status(200).json({"succses": "Payment proccesed!"})
    }, function(error){
        fs.appendFileSync("stripe-log.txt", "Error charging "+req.query.lastName+"."+req.query.dotNumber+"@osu.edu\n"+result.error)
        return new Promise(function(resolve, reject){reject(result.error)}) 
    })
})
module.exports = router