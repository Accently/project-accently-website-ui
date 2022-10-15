const express = require("express");
const router = express.Router();
const serverless = require("serverless-http");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
require("./customFunctions/userModel");
const User = mongoose.model("users");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const requestIp = require('request-ip');

const bizSdk = require('facebook-nodejs-business-sdk');
const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const DeliveryCategory = bizSdk.DeliveryCategory;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;

const app = express();

const access_token = process.env.FACEBOOK_ACCESS_TOKEN;
const pixel_id = process.env.FACEBOOK_PIXEL_ID;
const api = bizSdk.FacebookAdsApi.init(access_token);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIp.mw())

//Facebook Server Side Tracking Script
//router.post("*/server-side-tracking", async (req, res) => {
/*
  let current_timestamp = Math.floor(new Date() / 1000);

  try {
    console.log("1");
    console.log("Event Name" + req.body.eventName);
    console.log("Event Time" + current_timestamp);
    console.log("Event ID" + req.body.eventId);
    console.log("Event URL" + req.body.eventUrl);
    console.log("Event IP" + req.clientIp);
    console.log("Event IP" + req.headers['user-agent']);

    await axios.post(`https://graph.facebook.com/v9.0/${pixel_id}/events?access_token=${access_token}`, {
      data: [
        {
          "event_name": req.body.eventName,
          "event_time": current_timestamp,
          "action_source": "website",
          "event_id": req.body.eventId,
          "event_source_url": req.body.eventUrl,
          "user_data": {
            "client_ip_address": req.clientIp,
            "client_user_agent": req.headers['user-agent']
          }
        }
      ]
    });
    console.log("2");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success"
      })
    };

  } catch (err) {

    console.log("3");
    console.log("Error: " + err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err
      })
    };

  }
})*/

router.post("*/server-side-tracking", async (req, res) => {

  let current_timestamp = Math.floor(new Date() / 1000);

  try {
    console.log("1");
    console.log("Event Name" + req.body.eventName);
    console.log("Event Time" + current_timestamp);
    console.log("Event ID" + req.body.eventId);
    console.log("Event URL" + req.body.eventUrl);
    console.log("Event IP" + req.clientIp);
    console.log("Event IP" + req.headers['user-agent']);

    const userData = (new UserData())
      .setClientIpAddress(req.clientIp)
      .setClientUserAgent(req.headers['user-agent']);

    const serverEvent = (new ServerEvent())
      .setEventName(req.body.eventName)
      .setEventTime(current_timestamp)
      .setUserData(userData)
      .setEventSourceUrl(req.body.eventUrl)
      .setActionSource('website')
      .setEventId(req.body.eventId);

    const eventsData = [serverEvent];
    const eventRequest = (new EventRequest(access_token, pixel_id))
      .setEvents(eventsData);

    const response = await eventRequest.execute()

    console.log("2");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: response
      })
    };

  } catch (err) {

    console.log("3");
    console.log("Error: " + err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err
      })
    };

  }
})

//Email submission endpoint
router.post("*/submit", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);

  const existingUser = await User.findOne({ email: req.body.email });

  if (!existingUser) {
    const shortIdVariable = shortid.generate();
    const user = await new User({
      email: req.body.email,
      referralId: shortIdVariable,
      numberOfReferrals: 0
    }).save();
  }
  mongoose.disconnect();
  res.redirect("/early-access");
});

//Stripe Payment Endpoint
app.post("*/charge", async (req, res) => {
  const token = req.body.stripeToken;

  const charge = await stripe.charges.create(
    {
      amount: 10000,
      currency: "usd",
      description: "Down payment for first access to Accently",
      source: token,
    },
    function (err, charge) {
      if (charge) {
        console.log("Success: " + charge);
        res.redirect("/thank-you-early-access");
      }
      if (err) {
        console.log("Error: " + err);
        res.redirect("/early-access");
      }
    }
  );
});

app.use("/", router);

module.exports.handler = serverless(app);

//Ideas
//1. Try hard coding the values getting sent to see if you can just successfully make a request to Facebook
//2. If necessary 