let express = require('express')
let router = express.Router()


router.get("/payment", (req, res)=>{
    res.sendFile("/root/LyleLondraville.github.io/public_html/payment.html")
})


router.get("/about", (req, res)=>{
    res.sendFile("/root/LyleLondraville.github.io/public_html/about.html")
})

router.get("/payment-succsess", (req, res)=>{
    res.sendFile("/root/LyleLondraville.github.io/public_html/payment-succsess.html")
})

router.get("/", (req, res)=>{
    res.sendFile("/root/LyleLondraville.github.io/public_html/index.html")
})

module.exports = router
