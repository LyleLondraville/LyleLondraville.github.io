let mongoose = require('mongoose')

const server = 'ds221609.mlab.com:21609'
const database = 'rest-api-workshop'
const user = 'theoutlander'
const password = 'fZsMGZXQMx8FCTgkBwgFtEvwD7ML'

mongoose.connect(`mongodb://localhost/test_1`)

let TestSchema = new mongoose.Schema({
    username : String
})

module.exports = mongoose.model('Test', TestSchema)