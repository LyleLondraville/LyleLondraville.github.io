let mongoose = require('mongoose')
let express = require('express')
var request = require('request')
let router = express.Router()
let KEYS = require("/Users/lylelondraville/Desktop/Coding/Mountaineers/Mountaineers/DB/API Keys/keys.js")
let GearModel = require('../models/gear.model')

// POST
// add a new peice of gear
// POST localhost:3000/gear?title=TITLE&key=KEY&sizes[]=SIZE1[1234, 4563, ...]&sizes[]=SIZE2[4376, 9876, ...]
//                    &description=DESCRIPTION&attributes[]=ATTRIBUTE1_DESCRIPTION1&attributes[]=ATTRIBUTE2_DESCRIPTION2&
//                    images[]=IMAGE1&image[]=IMAGE2
// All caps represents query paramiters, images, attriubutes and descriptions are optional paramiters
router.post('/gear', (req, res) => { 

  var JSONmodel = {}
  
  //check for all qeary paramiters
  if(!req.query.title || !req.query.sizes || !req.query.key) {
    return res.status(400).send('Request body is missing')
  }

  
  // make sure key is correct
  if(req.query.key != KEYS.gear_key){
    return res.status(400).send('Invalid API key')
  }

  GearModel.findOne({title: req.query.title}).exec()
    .then(function(result){
      if(result){
        return new Promise(function(resolve, reject){return reject("Title must be unique")})
      }
  }).then(function(){

    JSONmodel.title = req.query.title
    // Size querys come in the form of ['size1[1234, 3245, ...]', 'size2[....]', ....]
    // Where size1 and size2 are the 2 sizes, and 1234, 3245 are the skus of each gear peice that size 
    
    // Array of SizeModels to add to GearModel
    var sizes = []
  
    // Iterating through the size query paramiter, where each element is a size and 
    // its coresponding gear skus are parsed, turned into a SizeModel object and added to sizes
    for (size_sku of req.qeary.sizes){
      // Find the first occurance of [ which is the start of the sku array and the end of the size
      var seperatorIndex = size_sku.indexOf("[")
  
      // Check that [ exists in the array if not its an invalid qeary
      if (seperatorIndex <= 0){
        return res.status(400).send("Invalid sizes queary format")
      }
      
      // Get the size
      var size = size_sku.substring(0, seperatorIndex)
      
      // Try and parse the array of skus into a json array, if it is not a valid array catch it and respond with a 
      // invalid queary code
      try{
        var skus = JSON.parse(size_sku.substring(seperatorIndex, size_sku.length))
      }catch(err){
        return res.status(400).send("Invalid SKU JSON format")
      }
  
      var goodSKUs = []
  
      // fix loop with promise 
      for (var sku of skus){
        
        var good = true
  
        if (sku.length != 4){
          return res.status(400).send("invalid sku")
          good = false
        }
  
        GearModel.findOne({sizes:{SKUs:{unreserved : sku}}}, (err, doc)=>{
          if (err){
            return res.status(500).send("Error checking if sku is unique")
          }
          if (doc){
            res.status(400).send("nonunique sku")
            good = false
          }
        })
  
        GearModel.findOne({sizes:{SKUs:{reserved : sku}}}, (err, doc)=>{
          if (err){
            return res.status(500).send("Error checking if sku is unique")
          }
          if (!doc){
            res.status(400).send("nonunique sku")
            good = false
          }
        })
  
        if (good){
          goodSKUs.push(sku)
        }
      }
  
      sizes.push({
        size: size,
        SKUs: {
          unreserved: goodSKUs,
          reserved: [] 
        }
      })
    }
  
    JSONmodel.sizes = sizes
  })


  

  // If there was an attributes query parse it and add it to attributes 
  if (req.query.attributes){

    var attributes = []

    // Itterate through each string in the req.query.attributes where each string is of the format 
    // attributeName_attributeDescription, parsing each string and turning it into a AttributeModel 
    // object and adding it to attributes
    for (attributeAndInfo of req.query.attributes){

      // Find the first occurance of _ which is the start of the attribute description and the end of the attribute
      var seperatorIndex = attributeAndInfo.indexOf("_")

      // Check that _ exists in the string if not its an invalid query
      if (seperatorIndex <= 0){
        return res.status(400).send("Invalid sizes queary format")
      }
      
      // Get the attribute and its description
      var attribute = attributeAndInfo.substring(0, seperatorIndex)
      var description = attributeAndInfo.substring(0, attributeAndInfo.length)

      attributes.push({
        attribute : attribute,
        description : description
      })
    }

    JSONmodel.attributes = attributes
  }

  var images = []

  // It is not requiered to provide an image in the query but it is required to suply an array 
  // of images for GearModel. So if the query does not have a image paramiter then we will add a default 
  // image to the image array, if they do supply an array of images our work is already done
  if (!req.query.images){
    JSONmodel.images = ["../default/image/path"]
  }else{
    JSONmodel.images = req.query.image 
  }


  if (req.query.description){
    JSONmodel.description = description
  }

  var model = new GearModel(JSONmodel)
  //save the model
  model.save()
    //if no error send back the data
    .then(doc => {
      if(!doc || doc.length == 0) {
        return res.status(500).send(doc)
      }else{
        return res.status(200).send(doc)
      }
      
    })
    //if error send back internal error message
    .catch(err => {
      return res.status(500).json(err)
    })
})


// GET
// searches gear catalog by either title or sku
// if by title it makes sure every word (string of char seperated by spaces) is in the title of the gear it returns 
// if by sku it returns the product that has that sku corisponded to it 
// if no matches it returns an empty array 
// GET localhost:3000/gear?search=ice_axe (this will return results for all gear with the title that has ice and axe in it)
// GET localhost:3000/gear?sku=1234 (this will return the product that has 1234 regestered as a sku)
router.get('/gear', (req, res) => {
  
  //check that there is a username and key query
  if(!req.query.search && !req.query.sku) {
    return res.status(400).send('Must have a sku or a search query')
  }else if (req.query.search && !req.query.sku){

    GearModel.createIndex({title: "text", description: "text"})
    
    GearModel.find({$text: {$search: req.qeary.search}}, {$caseSensitive: false}, (err, docs)=>{
      if(err){
        return res.status(500).send(err)
      }else{
        return res.status(200).send(docs)
      }
    })


  }else if (!req.query.search && req.query.sku){
    var foundGear = false 
    GearModel.findOne({sizes: { SKUs:{ unreserved: req.query.sku }}}, (err, docs)=>{
      if (!err){
        if (docs){
          foundGear = true
          return res.status(200).json(docs)
        }
      }else{
        return res.status(500).send(err)
      }
    })

    if (!foundGear){
      GearModel.findOne({sizes: { SKUs:{ unreserved: req.query.sku }}}, (err, docs)=>{
        if (!err){
          return res.status(200).json(docs)      
        }else{
          return res.status(500).send(err)
        }
      })
    }
  }else{
    return res.status(400).send('Can not search by sku and title')
  }
})


// PUT
// updates a peice of gear in the gear catalog
router.put('/gear', (req, res)=>{
  
  if(req.queary.gear_key){
    // get pres key from key file
    gear_key = JSON.parse('../API keys/keys.json')
    
    // make sure key is correct
    if(req.query.gear_key != gear_key){
      return res.status(400).send('Invalid API key')
    }    
  }else{
    return res.status(400).send('Gear manager API key requiered to make delete gear')
  }

  if (!req.query.title){
    return res.status(400).send('Missing title paramiter. Must have a tilte paramiter to identify what to update')
  }

  var title = { title: req.query.title };

  GearModel.findOne(title, (err, doc)=>{
    if (err || !doc){
      return res.status(400).send("Not a regestered product")
    }
  })

  if (req.query.description){
    GearModel.updateOne(title, {description : req.qeary.description}, (err, res)=>{
      if(err){
        return res.status(500).send("error updating description")
      }
    })
  }

  if (req.query.images){
    GearModel.updateOne(title, {$push : {images : req.qeary.images}}, (err, res)=>{
      if(err){
        return res.status(500).send("error updating images")
      }
    })     
  }

  if (req.query.attributes){
    
    var attributeArray = []
    
    for (var attributeAndInfo of req.query.attribute){
      var seperatorIndex = attributeAndInfo.indexOf("_")

      if (seperatorIndex <= 0){
        return res.status(400).send("Invalid sizes queary format")
      }

      var attribute = attributeAndInfo.substring(0, seperatorIndex)
      var description = attributeAndInfo.substring(0, attributeAndInfo.length)

      attributeArray.push({
        attribute : attribute,
        description : description
      })
    }

    GearModel.updateOne3(title, {$push : {attributes : attributeArray}}, (err, res)=>{
      if(err){
        return res.status(500).send("error updating attributes")
      }
    })     
  }

  if (req.query.sizes){
    // Size querys come in the form of ['size1[1234, 3245, ...]', 'size2[....]', ....]
    // Where size1 and size2 are the 2 sizes, and 1234, 3245 are the skus of each gear peice that size 

    // Iterating through the size query paramiter, where each element is a size and 
    // its coresponding gear skus are parsed, turned into a SizeModel object and added to sizes
    for (size_sku of req.qeary.sizes){
      // Find the first occurance of [ which is the start of the sku array and the end of the size
      var seperatorIndex = size_sku.indexOf("[")

      // Check that [ exists in the array if not its an invalid qeary
      if (seperatorIndex <= 0){
        return res.status(400).send("Invalid sizes queary format")
      }
      
      // Get the size
      var size = size_sku.substring(0, seperatorIndex)
      
      // Try and parse the array of skus into a json array, if it is not a valid array catch it and respond with a 
      // invalid queary code
      try{
        var skus = JSON.parse(size_sku.substring(seperatorIndex, size_sku.length))
      }catch(err){
        return res.status(400).send("Invalid SKU JSON format")
      }

      var goodSKUs = []

      for (var sku of skus){
        
        var good = true

        if (sku.length != 4){
          return res.status(400).send("invalid sku")
          good = false
        }

        GearModel.findOne({sizes:{SKUs:{unreserved : sku}}}, (err, doc)=>{
          if (err){
            return res.status(500).send("Error checking if sku is unique")
          }
          if (doc){
            res.status(400).send("unique sku")
            good = false
          }
        })

        GearModel.findOne({sizes:{SKUs:{reserved : sku}}}, (err, doc)=>{
          if (err){
            return res.status(500).send("Error checking if sku is unique")
          }
          if (doc){
            res.status(400).send("unique sku")
            good = false
          }
        })

        if (good){
          goodSKUs.push(sku)
        }
      }

      GearModel.findOne({title: req.query.title}, (err, doc)=>{
        if(err){
          res.status(500).send(err)
        }else{
          var hasSize = false
          for (sz of doc.sizes){
            if (sz.size == size){
              hasSize = true
            }
          } 

          if (hasSize){
            GearModel.updateOne(title, {sizes: {size: size, SKUs: {$push: {unreserved: skus}}}}, (err, doc)=>{
              if(err){
                return res.status(500).send(err)
              }
            })
          }else{
            GearModel.updateOne(title, {$push: {sizes: {size: size, SKUs:{unreserved: skus, reserved: []}}}}, (err, doc)=>{
              if(err){
                return res.status(500).send(err)
              }
            })
          }
        }
      })
    }     
  }

  GearModel.findOne(title, (err, doc)=>{
    if(err){
      return res.status(500).send(err)
    }else{
      return res.status(200).send(doc)
    }
  })
})

// DELETE
// Deletes a peice of gear, only callable by the gear manager
// DELETE localhost:300/gear?gear_sku=SKU&title=TITLE&deleteProduct=FALSE&sku[]=1234&sku[]=4321&description=TRUE
//                        &images[]=IMG_URL&attributes[]=ATTR
router.delete('/gear', (req, res) => {

  if(req.queary.gear_key){
    // get pres key from key file
    gear_key = JSON.parse('../API keys/keys.json')
    
    // make sure key is correct
    if(req.query.gear_key != gear_key){
      return res.status(400).send('Invalid API key')
    }    
  }else{
    return res.status(400).send('Gear manager API key requiered to make delete gear')
  }

  if(req.qeary.title){
    GearModel.findOne({title: req.qeary.title}, (err, doc)=>{
      if(err ){
        return res.status(500).send(err)
      }else if (doc){
        return res.status(400).send("Invalid title")
      }
    })
  }

  if(req.query.title && req.qeary.deleteProduct == "TRUE"){
    GearModel.findOneAndRemove({title: req.query.title}, (err, doc)=>{
      if (err){
        return res.status(500).json(err)
      }else{
        return res.status(200).json(doc)
      }
    })    
  }else{
    if(req.query.sku){
      GearModel.updateOne({title: req.query.title}, {sizes: {SKUs: {$pull: {unreserved: req.query.sku}}}}, (err, doc)=>{
        if(err){
          return res.status(500).send(err)
        }
      })
    }
   
    if(req.query.description == 'true'){
      GearModel.updateOne({title: req.qeary.title}, {$unset: {description: ""}}, (err, doc)=>{
        if(err){
          return res.status(500).send(err)
        }
      })
      
    }

    if(req.query.images){
      GearModel.updateOne({images: req.qeary.images}, {$pull: {images: req.query.images}}  , (err, doc)=>{
        if(err){
          return res.status(500).send(err)
        }
      })
    }

    if(req.query.attributes){
      GearModel.updateOne({title: req.query.title}, {$pull: {attributes: {attribute: req.query.attributes}}}, (err, doc)=>{
        if(err){
          return res.status(500).send(err)
        }
      })
    }

    GearModel.findOne({title: req.query.title}, (err, doc)=>{
      if(err){
        return res.status(500).send(err)
      }else{
        return res.status(200).send(doc)
      }
    })    
  }
})  

module.exports = router

















