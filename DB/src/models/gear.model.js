let mongoose = require('mongoose')

const server = 'ds221609.mlab.com:21609'
const database = 'rest-api-workshop'
const user = 'theoutlander'
const password = 'fZsMGZXQMx8FCTgkBwgFtEvwD7ML'

mongoose.connect(`mongodb://localhost/test_1`)

let SizeSchema = new mongoose.Schema({
    size: {
      type: String, 
      required: true
    },  
    SKUs :{
      unreserved: {
        type: [String], 
        required: true,
        unique: true        
      },
      reserved: {
        type: [String], 
        required: true,
        unique: true        
      } 
    }
})

let AttributeSchema = new mongoose.Schema({
    attribute: {
      type: String, 
      required: true
    },  
    description :{
      type: String, 
      required: true
    }
})

let GearSchema = new mongoose.Schema({
  
  title: {
  	type: String,
  	required: true,
    unique: true
  },
  
  sizes: [{ 
    type: SizeSchema,
    required: true
  }],

  attributes: [{ 
    type: AttributeSchema,
    required: false
  }],

  description: {
    type: String,
    required: false
  },

  images: {
    type: [String],
    required: true
  }

})


module.exports = mongoose.model('Gear', GearSchema)