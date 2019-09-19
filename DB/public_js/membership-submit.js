// Create a Stripe client.
var stripe = Stripe("pk_live_sKLHKTmKO4Et6z2A286T86TF00YWF7zs7l");

// Create an instance of Elements.
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    fontFamily: 'sans-serif, sans-serif, sans-serif',
    fontSize: '16px'
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};		

// Create an instance of the card Element.
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');



// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
  displayError.textContent = event.error.message;
  } else {
  displayError.textContent = '';
  }
});

// Handle form submission.
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  var tokenData = {
    "name": document.getElementById("first-name").value + " " + document.getElementById("last-name").value,
    "address_country": $("#select_country").val(),
    "currency": "usd"
  }

  stripe.createToken(card, tokenData).then(function(result) {
  if (result.error) {
    // Inform the user if there was an error.
    var errorElement = document.getElementById('card-errors');
    errorElement.textContent = result.error.message;
  } else if (validateForm()){
    // Send the token to your server.
    stripeTokenHandler(result.token.id);

  }
  })
})

// Submit the form with the token ID.
function stripeTokenHandler(token) {
  //var url = "https://osumountaineers.com/member?"
  //var url = "http://localhost:3000/member?"
  var url = "https://www.monti-test-site-test.us/payment"


  url+= "firstName="+document.getElementById("first-name").value
  url+= "&lastName="+document.getElementById("last-name").value
  url+= "&dotNumber="+document.getElementById("dot-number").value
  url+= "&iso2="+$("#select_country").val()
  if (("#payment-select").val() == 1){
    url+= "&paymentType=sMembership-semester"
    url+= "paymentAmount=30"
    url+= "paymentDescription=_"
  }else if (("#payment-select").val() == 2){
    url+= "&paymentType=Membership-year"
    url+= "paymentAmount=40"
    url+= "paymentDescription=_"
  }else{
    url+= "&paymentType=other"
    url+= "paymentAmount="+document.getElementById("amount")
    url+= "paymentDescription="+document.getElementById("description")
  }
    

  var myHeaders = new Headers({
    'Stripe-Token': token,
    "Access-Control-Expose-Headers": "Stripe-Token"
  });

  fetch(url, {method:"POST", mode:"cors", headers: myHeaders})
    .then(function(result){
      if(result.status != 200){
        result.json().then(function(result){
          alert(result.error)
        })
      }else{
        window.location.replace("https://www.monti-test-site-test.us/payment-succsess.html")
      }
  })
}



