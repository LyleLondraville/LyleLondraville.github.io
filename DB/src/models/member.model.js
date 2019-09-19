let mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/mountaineers`)
mongoose.set('useFindAndModify', false)
mongoose.set('useNewUrlParser', true)

let MemberSchema = new mongoose.Schema({
  firstName: {
  	type: String,
  	required: true,
  },

  username: {
  	type: String,
  	required: true,
  	unique: true
  },

  insurance:{
  	type: Boolean,
  	required: true
  },

  membershipExperation:{
  	type: Date,
  	required: true
  },
  
  membershipCreation:{
	type: Date,
	required: true
  } 

})

module.exports = mongoose.model('Member', MemberSchema)