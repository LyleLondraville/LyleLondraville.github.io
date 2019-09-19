// Submit the form with the token ID.
function stripeTokenHandler() {
    var url = "http://68.183.155.181/member?firstName=Lyle&lastName=Londraville&dotNumber=2&iso2=US&street=3372%20brenner%20road&state=Ohio&city=Norton&zip=44203&phone=3306031362&membershipLength=2&nonOSUemail=lyle.londraville%40gmail.com&DOB=10%2F25%2F1999"
  
    var myHeaders = new Headers({
      'pres_key': "TtbDqrxCoRYN2j1$KoZ)MFJ8zE1E9$nqC4NTm56TVqn57l9y8V3wv!m&nr$jYlUahSJSV0GQe#RhdrHZ3q(g!xYVDJUVFEkhq7#Og",
      "Access-Control-Expose-Headers": "pres_key"
    });
  
    fetch(url, {method:"POST", mode:"cors", headers: myHeaders})
      .then(function(result){
        result.json().then(function(result){
            console.log(result)
          })
    })
  }

  stripeTokenHandler()