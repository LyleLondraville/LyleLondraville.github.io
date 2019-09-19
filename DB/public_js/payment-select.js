
  var paymentOption = document.getElementById("payment-select")
  countrySelect.addEventListener("input", function(element){

    if ($("#payment-select").val()){
        var description_div = document.createElement("div")
        var amount_div = document.createElement("div")

        description_div.className = "col-sm-6 form-group contact-forms"
        amount_div.className = "col-sm-6 form-group contact-forms"

        description.id = "description-div"
        amount.id = "amount-div"
        
        var description = document.createElement("input")
        var amount = document.createElement("input")

        description.id = "description"
        amount.id = "amount"

        description.className = "form-control"
        amount.className = "form-control"

        description.setAttribute("placeholder", "description")
        amount.setAttribute("placeholder", "amount")
        amount.setAttribute("type", "number")

        description_div.append(description)
        amount_div.append(amount)

        var masterDoc = document.getElementById("payment-form")
        masterDoc.append(description_div)
        masterDoc.append(amount_div)

    }else{
        document.getElementById("description-div").remove()
        document.getElementById("amount_div").remove()
    }

})
