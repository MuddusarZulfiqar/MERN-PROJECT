const stripe = require('stripe')('sk_test_51LZXw5EN0QJFYYjZrwOefeWunt1AWr8mp05kIpqAYLbP1IJjOSdUiyhA6pVD9JEuKyikNdMBeR7beYE9QTCiVhqW00oRyBXcj1');
const catchAsyncError = require('../middlewares/catchAsyncError');
const Product = require('../models/productModel')
exports.processPayment = catchAsyncError(async (req,res,next)=>{
    let line_items = [];
   const result = await req.body.cart.map(async(item)=>{
        const storeItem = await Product.findById(item._id);
        if(storeItem?.name){
            line_items.push({
                price_data:{
                    currency:'usd',
                    product_data:{
                        name:storeItem.name,
                    },
                    unit_amount:storeItem.price * 100, 
                },
                quantity:item.quantity,
            })
        }
    });
    if(await result){
        console.log(await result,'Result');
        console.log(line_items,'lineItems');
    }
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode: 'payment',
        line_items,
        success_url:`${process.env.SERVER_URL}/success`,
        cancel_url:`${process.env.SERVER_URL}/cancel`,
    });
    res.send({
        url:session.url
    })
});


exports.sendStripeApiKey = catchAsyncError(async (req,res,next)=>{
    res.send({
        stripeApiKey:process.env.STRIPE_API_KEY
    })
});