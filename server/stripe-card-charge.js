const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// eslint-disable-next-line import/no-anonymous-default-export
exports.handler = async (event, context) => {

  if (event.httpMethod === "POST") {
    try {

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 10000,
        currency: "usd"
      });
      console.log(paymentIntent)
      return {
        statusCode: 200,
        body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      };
      //res.status(200).send(paymentIntent.client_secret);
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err.message }),
      };
      //res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "METHOD NOT ALLOWED" }),
    };
  }
};
