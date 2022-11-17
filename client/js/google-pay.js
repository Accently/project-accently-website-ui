document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Initialize Stripe
    const stripe = Stripe('pk_test_51Lrnh3Hn5HPNBT2DQtdgvnH7HCOm8qYTOyYDrzrIpJhAHdgeeC5n4i6qLFy2JibSXGNfjT5c419dHbVNyVZxBAY700PxxUxtgz', {
      apiVersion: '2020-08-27',
    });
  
    var email = document.getElementById('email-4').value;
      var name = document.getElementById('name-3').value;
      const billingDetails = {
      name: name,
      email: email,
    };
    // 2. Create a payment request object
    var paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'total',
        amount: 10000,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });
  
    // 3. Create a PaymentRequestButton element
    const elements = stripe.elements();
    const prButton = elements.create('paymentRequestButton', {
      paymentRequest: paymentRequest,
    });
  console.log(prButton)
    // Check the availability of the Payment Request API,
    // then mount the PaymentRequestButton
    paymentRequest.canMakePayment().then(function (result) {
      if (result) {
        prButton.mount('#gpay-element');
      } else {
        document.getElementById('gpay-element').innerHTML = 'not availble';
        document.getElementById('gpay-element').style.color = 'red';
        console.log('Google Pay support not found. Check the pre-requisites above and ensure you are testing in a supported browser.');
      }
    });
  
    paymentRequest.on('paymentmethod', async (e) => {
      // Make a call to the server to create a new
      // payment intent and store its client_secret.
  
      await axios
        .post(
          "/.netlify/functions/payment-card",
          {
            amount:"1000000",
          }
        )
        .then(async (response) => {
          //console.log(response)
      console.log(`Client secret returned.`);
  
      // Confirm the PaymentIntent without handling potential next actions (yet).
      let {error, paymentIntent} = await stripe.confirmCardPayment(
        response.data.clientSecret,
        {
          payment_method: e.paymentMethod.id,
        },
        {
          handleActions: false,
        }
      );
  
      if (error) {
        console.log(error.message);
  
        // Report to the browser that the payment failed, prompting it to
        // re-show the payment interface, or show an error message and close
        // the payment interface.
        console.log('fail');
        return;
      }
      // Report to the browser that the confirmation was successful, prompting
      // it to close the browser payment method collection interface.
      console.log('success');
  
      // Check if the PaymentIntent requires any actions and if so let Stripe.js
      // handle the flow. If using an API version older than "2019-02-11" instead
      // instead check for: `paymentIntent.status === "requires_source_action"`.
      if (paymentIntent.status === 'requires_action') {
        // Let Stripe.js handle the rest of the payment flow.
        let {error, paymentIntent} = await stripe.confirmCardPayment(
          clientSecret
        );
        if (error) {
          // The payment failed -- ask your customer for a new payment method.
          console.log(error.message);
          return;
        }
        console.log(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
      }
  
      console.log(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    });
  })
})