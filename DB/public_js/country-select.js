
var countriesStatesJSON 
var countryLength

function getCountryByCode(code) {
    for(var i = 0; i < countryLength; i++){
      if(countriesStatesJSON[i].iso2 == code){
        return countriesStatesJSON[i]
      }
    }	
}

// take care of async
$.getJSON("https://lylelondraville.github.io/DB/public_js/countries_states.json", function(json){
  countriesStatesJSON = json
  countryLength = json.length

}).then(function(resuult){
  var countrySelect = document.getElementById("select_country")
  countrySelect.addEventListener("input", function(element){
  //console.log(element.val())
  var country = getCountryByCode($("#select_country").val())
  var states = country.states
  var statesLength = states.length
  //delete select item replace it with the correct states 
  //update backend to take this new form 
  //add type checks to input 
  //find out if fiona got stripe working 


  if (statesLength > 0){
    if (document.getElementById("state-select")){
      $("#state-select").empty()
    }else{
      var dropdown = document.createElement("select")
      dropdown.className = "form-control"
      dropdown.id = "state-select"
      document.getElementById("zip-div").className = "col-sm-6 form-group contact-forms"
      document.getElementById("state-select-div").className = "col-sm-6 form-group contact-forms"
      document.getElementById("state-select-div").append(dropdown)
    }
    for( var i = 0; i < statesLength; i++){
      var state = document.createElement("option")
      state.textContent = states[i]
      document.getElementById("state-select").append(state)
    }
  }else{
    if (document.getElementById("state-select")){
      document.getElementById("state-select").remove()
      document.getElementById("state-select-div").className = ""
      document.getElementById("zip-div").className = "col-sm-12 form-group contact-forms"
    }


  }
})
})
