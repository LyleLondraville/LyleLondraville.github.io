
function validateForm(){

  function isAlpabet(string){
    var letters = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    var stringArray = string.toLowerCase().split("")
    for(var i = 0; i < stringArray.length; i++){
      if (!letters.includes(stringArray[i])){
        return false
      }
    }
    return true
  }

  var result = true

  if(document.getElementById("first-name").value == ""){
    document.getElementById("first-name").className = "form-control error"
    result = false
  }else if (!isAlpabet(document.getElementById("first-name").value)){
    document.getElementById("first-name").className = "form-control error"
    result = false
  }else{
    document.getElementById("first-name").className = "form-control"
  }

  if(document.getElementById("last-name").value == ""){
    document.getElementById("last-name").className = "form-control error"
    result = false
  }else if (!isAlpabet(document.getElementById("last-name").value)){
    document.getElementById("last-name").className = "form-control error"
    result = false
  }else{
    document.getElementById("last-name").className = "form-control"
  }

  if(!$("#year").val()){
    document.getElementById("year").className = "form-control error"
    result = false
  }else{
    document.getElementById("year").className = "form-control"
  }

  if(!$("#month").val()){
    document.getElementById("month").className = "form-control error"
    result = false
  }else{
    document.getElementById("month").className = "form-control"
  }

  if(document.getElementById("street").value == ""){
    document.getElementById("street").className = "form-control error"
    result = false
  }else{
    document.getElementById("street").className = "form-control"
  }

  if(!$("#day").val()){
    document.getElementById("day").className = "form-control error"
    result = false
  }else{
    document.getElementById("day").className = "form-control"
  }



  if(document.getElementById("dot-number").value == ""){
    document.getElementById("dot-number").className = "form-control error"
    result = false
  }else if(!Number.isInteger(Number(document.getElementById("dot-number").value)) || Number(document.getElementById("dot-number").value <= 0)){
    document.getElementById("dot-number").className = "form-control error"
    result = false
  }else{
    document.getElementById("dot-number").className = "form-control"
  }

  if(document.getElementById("phone").value == ""){
    document.getElementById("phone").className = "form-control error"
    result = false
  }else if(!Number.isInteger(Number(document.getElementById("phone").value)) || document.getElementById("phone").value.length != 10){
    document.getElementById("zip").className = "form-control error"
    result = false
  }else{
    document.getElementById("phone").className = "form-control"
  }

  if(document.getElementById("email").value == ""){
    document.getElementById("email").className = "form-control error"
    result = false
  }else{
    document.getElementById("email").className = "form-control"
  }
  
  
  if(document.getElementById("zip").value == ""){
    document.getElementById("zip").className = "form-control error"
    result = false
  }else{
    document.getElementById("zip").className = "form-control"
  }

  
  if(document.getElementById("city").value == ""){
    document.getElementById("city").className = "form-control error"
    result = false
  }else if (!isAlpabet(document.getElementById("city").value)){
    document.getElementById("city").className = "form-control error"
    result = false
  }else{
    document.getElementById("city").className = "form-control"
  }
  
  

  
  return result

}