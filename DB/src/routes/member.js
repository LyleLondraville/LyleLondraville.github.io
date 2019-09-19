let MemberModel = require('../models/member.model')
let KEYS = require("/Users/lylelondraville/Desktop/Coding/Mountaineers/LyleLondraville.github.io/DB/API_Keys/keys")
//let KEYS = require("/root/LyleLondraville.github.io/DB/API_Keys/keys.js")
let express = require('express')
let request = require('request')
let nodemailer = require('nodemailer')
let fs = require('fs')
let router = express.Router()
let cors = require('cors')

// work through api debiug again 
// only have one error promise function 


//http://localhost:3000/member

// POST
// Create a new customer

router.options('/member', cors())


router.post('/member', cors(), (req, res) => {

  
  //check for all qeary paramiters
  if(!req.query.firstName || !req.query.lastName ||
     !req.query.dotNumber || !req.query.nonOSUemail ||
     !req.query.membershipLength || !req.query.iso2 || req.query.iso2.length != 2) {

    return res.status(400).json({"error": "Missing paramiter"})
  }

  if((req.header("pres-key") && req.header("Stripe-Token")) || (!req.header("pres-key") && !req.header("Stripe-Token"))){

    return res.status(400).json({"error": "Missing key"})
 }
	


  var experation
  var currentDate = new Date()
  var month = currentDate.getMonth()
  if(req.query.membershipLength == "1"){
    if (month >= 0 && month < 4){
      experation = new Date(currentDate.getFullYear(), 4, 15, 0, 0, 0, 0)
    }else{
      experation = new Date(currentDate.getFullYear()+1, 0, 0, 0, 0, 0, 0)
    }
  }else if(req.query.membershipLength == "2"){
    if(month <= 11){
      experation = new Date(currentDate.getFullYear()+1, 4, 15, 0, 0, 0, 0)
    }else{
      experation = new Date(currentDate.getFullYear(), 4, 15, 0, 0, 0, 0)
    }
  }else{
    return res.status(400).json({"error":"Invalid membership length"})
  }

  new Promise(function(resolve, reject){
    request('http://directory.osu.edu/fpjson.php?name_n='+req.query.lastName+"."+req.query.dotNumber, (error, response, body) => {
      if(error){
        reject("Error checking if student")
      }else{
        if (JSON.parse(body)[0] == undefined){
          reject({"error":"not student"})
        }else{
          if (JSON.parse(body)[0].first_name.toLowerCase() != req.query.firstName.toLowerCase()){
            reject({"error":"first name does not match osu records"})
          }else{
            resolve({"succses":"is student"})
          }
        }
      }
    })
  }).then(function(result){   
    return  MemberModel.findOne({username : req.query.lastName.toLowerCase()+"."+req.query.dotNumber.toLowerCase()}).exec() 
  
  }).then(function(result){
    if(result){
      return new Promise(function(resolve, reject){reject({"error":"already member"})})
    }else{

      if(req.header("Stripe-Token")){
        
        const stripe = require('stripe')(KEYS.stripe_private);
        var membershipCost

        if(req.query.membershipLength == "1"){
          membershipCost = 3000
        }else{
          membershipCost = 4000
        }
        return stripe.charges.create({
          amount: membershipCost,
          currency: 'usd',
          description: 'membership',
          source: req.header("Stripe-Token"),
          metadata: {username: `${req.query.lastName}.${req.query.dotNumber}`.toLowerCase()}
        })
      }
      else{
        if (req.header("pres-key") == KEYS.pres_key){
          return true
        }else{
          return new Promise(function(resolve, reject){reject({"error":"Invalid presidnet key"})})
        } 
      }
    }
  }).then(function(result){
    if(result.error){
      fs.appendFileSync("stripe-log.txt", "Error charging "+req.query.lastName+"."+req.query.dotNumber+"@osu.edu\n"+result.error)
      return new Promise(function(resolve, reject){reject(result.error)})
    }else{
      
      var modelJSON = {
        firstName: req.query.firstName.toLowerCase(),
  
        username: (req.query.lastName+'.'+req.query.dotNumber).toLowerCase(),
  
        insurance: false,

        country : req.query.iso2.toLowerCase(),
        
        membershipExperation: experation,
        
        membershipCreation: new Date() 
      }


      return new MemberModel(modelJSON).save()
    }
   
  }).then(function(result){
    res.status(200).json({"succses": "Member created!"})

  }).then(function(result){

    var transporter =  nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mountaineers.membership@gmail.com',
        pass: KEYS.gmail
        //user: "kixify1140@gmail.com",
        //pass: ""
      }
    })

    var mailOptions = {
      //from: 'osumountaineering@gmail.com',
      from: "mountaineers.membership@gmail.com",
      to: req.query.nonOSUemail,
      text: 'Plaintext version of the message',
      subject: "Membership Payment",
      text: "Your payment has succsesfully been recived, however you are not a member yet.\
       You MUST fill out an insurance waiver to be a member. You can fill out an \
       insurance waiver at any meeting."
    }
    
    return transporter.sendMail(mailOptions)

  }).then(function(result){
    fs.appendFileSync("email-log.txt", "Succsess sending email to "+req.query.lastName+"."+req.query.dotNumber+"@osu.edu\n")
  },function(error){
    if(res.finished){
      fs.appendFileSync("email-log.txt", "Error sending email to "+req.query.lastName+"."+req.query.dotNumber+"@osu.edu\n\t"+error+"\n")
    }else{
      res.status(400).json(error)
    }
  })
})


// GET
// Get a users membership info, only callable by the president
router.get('/member', cors(), (req, res) => {
  
  //check that there is a username and key query
  if(!req.query.username) {
    return res.status(400).send('Missing one or more URL parameter')
  }

  if(!req.header("pres-key")){
    return res.status(400).send('invalid credentials')
  }

  // get pres key from key file
  
  // make sure key is correct
  if(req.header("pres-key") != KEYS.pres_key){
    return res.status(400).send('Invalid API key')
  }

  //find the user
  MemberModel.findOne({username: req.query.username.toLowerCase()}, (err, response)=>{
    if(err){
      return res.status(500).json(err)
    }
    if(response){
      return res.status(200).json(response)
    }else{
      return res.status(400).json("not a user")
    }
  })
})


// PUT
// Update a members membership info, only callable by the president
router.put('/member', cors(), (req, res)=>{
   //check that there is a username and key query
  if(!req.query.username ) {
    return res.status(400).send('Missing one or more URL parameter')
  }

  if(!req.header("pres-key")){
    return res.status(400).send('invalid credentials')
  }
  
  // make sure key is correct
  if(req.header("pres-key") != KEYS.pres_key){
    return res.status(400).send('Invalid API key')
  }
  
  MemberModel.findOne({username: req.query.username.toLowerCase()}).exec().then(
    function(response){
      if (response){
        var updateJSON = {}
        updateJSON.address = response.address
        if (req.query.insurance){
          updateJSON.insurance = req.query.insurance
        }

        if(req.query.country){
          updateJSON.address.country = req.query.country.toLowerCase()  
        }

        if(req.query.state){
          updateJSON.address.state = req.query.state.toLowerCase()
        } 
        if(req.query.city){
          updateJSON.address.city = req.query.city.toLowerCase()
        }
        if(req.query.street){
          updateJSON.address.street = req.query.street.toLowerCase()  
        }
        if(req.query.zip){
          updateJSON.address.zip = req.query.zip
        }
        if(req.query.phone){
          updateJSON.phone = req.query.phone
        }
        if(req.query.membershipLength){ 
          var experation
          var currentDate = new Date()
          var month = currentDate.getMonth()
          if(req.query.membershipLength == "1"){
            if (month >= 0 && month < 4){
              experation = new Date(currentDate.getFullYear(), 4, 15, 0, 0, 0, 0)
            }else{
              experation = new Date(currentDate.getFullYear()+1, 0, 0, 0, 0, 0, 0)
            }
          }else if(req.query.membershipLength == "2"){
            if(month >= 4 && month <= 11){
              experation = new Date(currentDate.getFullYear()+1, 4, 15, 0, 0, 0, 0)
            }else{
              return new Promise(function(resolve, reject){reject("Year memberships are only offered during the fall semester")})
            }
          }else{
            return new Promise(function(resolve, reject){reject("Invalid membership length")})
          }
          updateJSON.membershipExperation = experation
        }  

        //return MemberModel.updateOne({username: req.query.username.toLowerCase()}, updateJSON).exec()
        return true
      }else{
        return new Promise(function(resolve, reject){reject("Not a member")})
      }
  }).then(function(response){
    res.status(200).send(response)
  },function(error){
    res.status(400).send(error)
  })
})


// DELETE
// Deletes a member, only callable by the president
router.delete('/member', cors(),  (req, res) => {
 
  //check that there is a username and key query
  if(!req.query.username) {
    return res.status(400).send('Missing one or more URL parameter')
  }
  if(!req.header("pres-key")){
    return res.status(400).send('invalid credentials')
  }
  
  // make sure key is correct
  if(req.header("pres-key") != KEYS.pres_key){
    return res.status(400).send('Invalid API key')
  }

  MemberModel.findOne({username: req.query.username.toLowerCase()}).exec()
    .then(function(response){
      if(response){
        return MemberModel.findOneAndRemove({username: req.query.username.toLowerCase()}).exec()
      }else{
        return new Promise(function(resolve, reject){reject("Not a member")})
      }
  }).then(function(result){
    res.status(200).send(result)
  },function(error){
    res.status(400).send(error)
  })

})

  
module.exports = router




