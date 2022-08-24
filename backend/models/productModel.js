const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        minlength:[3,'Name must be at least 3 characters']
    },
    price:{
        type:Number,
        required:[true,'Price is required'],
        min:[0,'Price must be greater then 0']
    },
    description:{
        type:String,
        required:[true,'Description is required'],
        minlength:[10,'Description must be at least 10 characters']
    },
    stock:{
        type:Number,
        default:1,
        min:[0,'Product is out of stock']
    },
    reserved:{
        type:Number,
        default:0,
        
    },
    images:[
        {
            image_url:{
                type:String,
                required:[true,'Image url is required']
            },
        }
    ],
    category:{
        type:String,
        required:[true,'Category is required']
    },
    tags:[
        {
            type:String,
            default:'all',
            required:[true,'Tags is required']
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    },
    createdBy:{
        type:String,
        required:[true,'Created by is required']
    },
    averageRating:{
        type:Number,
        default:0,
        min:[0,'Rating must be greater then 0'],
        max:[5,'Rating must be less then 5']
    },
    ratings:[
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:[true,'User id is required']
            },
            rating:{
                type:Number,
                required:[true,'Rating is required'],
                min:[0,'Rating must be greater then 0'],
                max:[5,'Rating must be less then 5']
            },
            message:{
                type:String,
                trim:true,
                required:[true,'Please enter message']
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ],

});

module.exports = mongoose.model('Product',ProductSchema);