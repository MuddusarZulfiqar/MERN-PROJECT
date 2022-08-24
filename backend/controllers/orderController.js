const ErrorHandler = require('../utils/errorHandling');
const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const Product = require('../models/productModel')

const createOrder = catchAsyncError(async (req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        texPrice,
        shippingPrice,
        totalPrice
    } = req.body;
    if(!shippingInfo || !orderItems || !paymentInfo || !itemsPrice || !texPrice || !shippingPrice || !totalPrice){
        return next(new ErrorHandler('Please provide all the required fields',400));
    }
     
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        texPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user:req.user._id
    });
    for (let index = 0; index < order.orderItems.length; index++) {
        var productId = order.orderItems[index].product.toString()
        const product = await Product.findById(productId);
        if(!product){
            next(new ErrorHandler(`Product Not Found of id: ${productId}`,404));
            break;
        }
        else if(product.stock < 1){
            next(new ErrorHandler(`Product is out of stock of name: ${product.name}`,400));
            break;
        }
        else if(order.orderItems[index].quantity > product.stock){
            next(new ErrorHandler(`Order product quantity is greater then product quantity name: ${product.name}`,400));
            break;
        }
        else {
            product.reserved += order.orderItems[index].quantity;
            
        }
        await product.save();
    }
    res.json({
        status:true,
        data:order
    })
});

const getSingleOrder = catchAsyncError(async (req,res,next)=>{
    const {orderId} = req.params;
    const order = await Order.findById(orderId).populate("orderItems.product","name price images price").populate("user","name email");
    if(!order){
        return next(new ErrorHandler('Order Not Found',404));
    }

    res.json({
        status:"success",
        data:order
    })
});

const getLoginUserOrders = catchAsyncError(async (req,res,next)=>{
    const userId = req.user._id;
    const orders = await Order.find({user:userId}).populate("orderItems.product","name price images price").populate("user","name email").select("-__v -updatedAt");
    
    res.json({
        status:"success",
        data:orders
    })
});

const updateOrderStatus = catchAsyncError(async (req,res,next)=>{
    const {orderId} = req.params;
    const {orderStatus,reason} = req.body;
    if(!orderStatus){
        return next(new ErrorHandler('Order status is required',400));
    }

    const order = await Order.findById(orderId);
    const allOrders = await Order.find({});
    if(!order){
        return next(new ErrorHandler('Order Not Found',400));
    }
    if(order.orderStatus == 'completed'){
        return next(new ErrorHandler('Order is Already Completed',400));
    }
    else if(order.orderStatus == 'canceled'){
        return next(new ErrorHandler('Order is Already Canceled',400));
    }
    if(orderStatus.toLowerCase() === 'completed'){
        for (let index = 0; index < order.orderItems.length; index++) {
            const product = await Product.findById(order.orderItems[index].product);
            if(!product){
                next(new ErrorHandler(`Product Not Found of id: ${product._id}`,404));
                break;
            }
            else if(product.stock < 1){
                next(new ErrorHandler(`Product is out of stock of id: ${product._id}`,400));
                break;
            }
            else if(order.orderItems[index].quantity > product.stock){
                next(new ErrorHandler(`Order product quantity is greater then product quantity id: ${product._id}`,400));
                break;
            }
            else {
                product.stock -= order.orderItems[index].quantity;
                product.reserved -= Number(order.orderItems[index].quantity);
                await product.save();
            }
            
        }
        order.deliveredAt = Date.now()
    }
    else if(orderStatus.toLowerCase() === 'canceled'){
        if(!reason){
            return next(new ErrorHandler('Please provide any reason of canceled',400));
        }
        for (let index = 0; index < order.orderItems.length; index++) {
            const product = await Product.findById(order.orderItems[index].product);
            product.reserved -= Number(order.orderItems[index].quantity);
            await product.save();
            
        }
        order.reasonCanceled = reason;
    }
    
    order.orderStatus = orderStatus
   await order.save({
    validateBeforeSave:false
   });
   res.json({
    status:'success',
    data:allOrders
   })
});

const getAllOrders = catchAsyncError(async (req,res,next)=>{
    const orders = await Order.find().populate("orderItems.product","name price images price").populate("user","name email").select("-__v -updatedAt");
    res.json({
        status:"success",
        data:orders
    })
});

module.exports.createOrder = createOrder
module.exports.getSingleOrder = getSingleOrder
module.exports.getLoginUserOrders = getLoginUserOrders
module.exports.updateOrderStatus = updateOrderStatus
module.exports.getAllOrders = getAllOrders