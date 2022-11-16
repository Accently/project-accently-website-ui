const stripe = require("stripe")('sk_test_51Lrnh3Hn5HPNBT2DHgZxIB7EYtwPMCRUxe9wEUc5LXQbDRuRRKQ7pBJccxVCGoOytN4UAtfiQKG6nOgxekqUI4nT00fYlNuUwH');

// eslint-disable-next-line import/no-anonymous-default-export
exports.handler = async (event, context) => {
    
  if (event.httpMethod === "POST") {
    try {
      const amount = JSON.parse(event.body).amount;
     //console.log(amount)

      const paymentIntent = await stripe.paymentIntents.create({
        amount:amount,
        currency: "usd"
      });
      console.log(paymentIntent)
      return {
        statusCode: 200,
        body: JSON.stringify({clientSecret:paymentIntent.client_secret}),
      };
      //res.status(200).send(paymentIntent.client_secret);
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: err.message}),
          };
      //res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    return {
        statusCode: 400,
        body: JSON.stringify({message: "METHOD NOT ALLOWED"}),
      };
  }
};
