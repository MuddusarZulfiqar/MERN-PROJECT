const mongoose = require('mongoose');

const orderSchema =new mongoose.Schema({
    shippingInfo:{
        address:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        pinCode:{
            type:Number,
            required:true
        },
        phoneNumber:{
            type:String,
            required:true
        }
    },
    orderItems:[
        {
            quantity:{
                type:Number,
                default:1,
                min:[1,'Product quantity must be greater then 1'],
                required:true
            },
            product:{
                type:mongoose.Schema.ObjectId,
                ref:"Product",
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    paymentInfo:{
        id:{
            type:String,
            required:true
        },
        status:{
            type:String,
            required:true
        }
    },
    paidAt:{
        type:Date,
        required:true,
    },
    itemsPrice:{
        type:Number,
        default:0,
        required:true
    },
    texPrice:{
        type:Number,
        default:0,
        required:true
    },
    shippingPrice:{
        type:Number,
        default:0,
        required:true
    },
    totalPrice:{
        type:Number,
        default:0,
        required:true
    },
    orderStatus:{
        type:String,
        required:true,
        enum: ['processing', 'completed','canceled'],
        default:'processing'
    },
    reasonCanceled:{
        type:String,
    },
    deliveredAt:Date,
},{
    timestamps:true
});


const Order = mongoose.model('order',orderSchema);

module.exports = Order