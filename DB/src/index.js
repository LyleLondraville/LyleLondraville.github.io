let express = require('express')
let app = express()
let memberRoute = require('./routes/member')
//let gearRoute = require('./routes/gear')
let path = require('path')
let cors = require('cors')
let bodyParser = require('body-parser')
let staticHTML = require("./routes/static-html")

app.use(bodyParser.json())
app.use(memberRoute)
//app.use(gearRoute)
app.use(staticHTML)

app.use(cors())
app.options('*', cors())
app.use(express.static('public'))

// Handler for 404 - Resource Not Foundc
app.use((req, res, next) => {
  res.status(404).send('We think you are lost!')
})

// Handler for Error 500
app.use((err, req, res, next) => {
  console.error(err.stack)
  //console.log(__dirname)
  res.sendFile(path.join(__dirname, '../public/500.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))