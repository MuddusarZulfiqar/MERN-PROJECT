const express = require('express');
const { processPayment, sendStripeApiKey  } = require('../controllers/paymentControllers');
const { isAuth } = require('../middlewares/auth');
const router = express.Router();

router.route('/payment/process').post(isAuth,processPayment)
router.route('/stripeapikey').get(isAuth,sendStripeApiKey)
 
module.exports = router