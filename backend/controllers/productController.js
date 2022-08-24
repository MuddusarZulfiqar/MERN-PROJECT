const ErrorHandler = require('../utils/errorHandling');
const catchAsyncError = require('../middlewares/catchAsyncError');
const Product = require('../models/productModel');
const ApiFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');

const addProduct = catchAsyncError(async (req, res, next) => {
    
    const {name,price,description,images,category,tags} = req.body;
    if(!name || !price || !description || !images || !category || !tags){
        return next(new ErrorHandler('Please provide all the required fields',400));
    }
    const myCloud = await cloudinary.v2.uploader.upload(req.body.productImages,{
        folder: 'products',
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        invalidate: true,
        eager: [
            { width: 200, height: 200, crop: "fill" },
            { width: 100, height: 100, crop: "fill" },
            { width: 50, height: 50, crop: "fill" }
        ]
    });
    const product = await (await Product.create({...req.body,createdBy:req.user._id,images:{
        public_id:myCloud.public_id,
        url:myCloud.secure_url,
    }}));
    res.status(201).json({
        status:'success',
        data:{
            product
        }
    });
});

const getAllProducts = catchAsyncError(async (req,res)=>{
    const productPerPage = 5;
    // const productCount = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find().populate('ratings.userId','email name'),req.query).search().filter().pagination(productPerPage).limit();
    const products = await apiFeatures.query;
    // get page number from query string
    const page = req.query.page || 1;
    // get total pages
    const totalPages = Math.ceil(products.length / productPerPage);
    res.status(200).json({
        status:'success',
        results:products.length,
        page:page,
        totalPages:totalPages,
        data:{
            products
        }
    });
});


const updateProduct = catchAsyncError(async (req,res,next)=>{
    // check req.body is empty or not
    if(Object.keys(req.body).length === 0){
        return next(new ErrorHandler('Please provide at least one field to update',400));
    }
    const product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate('ratings.userId','email name');
    if(!product){
        return next(new ErrorHandler('Product not found',404));
    }
    res.status(200).json({
        status:'success',
        data:{
            product
        }
    });
});

const getSingleProduct = catchAsyncError(async (req,res,next)=>{
    const product = await Product.findById(req.params.id).select("-createdBy -createdAt -updatedAt -__v").populate('ratings.userId','email name');
    if(!product){
        return next(new ErrorHandler('Product not found',404));
    }
    res.status(200).json({
        status:'success',
        data:{
            product
        }
    });
});

const deleteProduct = catchAsyncError(async (req,res,next)=>{
    const product = await Product.findByIdAndDelete(req.params.id).select("-createdBy -createdAt -updatedAt -__v");
    if(!product){
        return next(new ErrorHandler('Product not found',404));
    }
    res.status(200).json({
        status:'success',
        data:{
            product
        }
    });
});


const updateAndRiteReview = catchAsyncError(async (req,res,next)=>{
    const {id} = req.params;
    const {rating,message} = req.body;
    if(!rating || !message){
        return next(new ErrorHandler('Rating and message is required',400));
    }
    if(rating > 5){
        return next(new ErrorHandler('Review must be or equal to 5',404));
    }
    const product = await Product.findById(id);
    const haveReview = product.ratings.map((rating)=>{
        if(rating.userId = req.user._id){
            return rating
        }
    });
    if(haveReview.length > 0){
        product.ratings.map((review)=>{
            if(review.userId = req.user._id){
                review.rating = rating,
                review.message = message
            }
        })
    } else{
        product.ratings.push({
            userId:req.user._id,
            rating:rating,
            message,
        })
    };

    var totalReview = product.ratings.reduce((accumulator,currentVal)=>accumulator+currentVal.rating,0);
    // console.log(totalReview)
    var average = totalReview / product.ratings.length;
    product.averageRating = average;
    await product.save({
        validateBeforeSave:true
    });

    res.json({
        status: "success",
        data:product
    })

});

const deleteReview = catchAsyncError(async (req,res,next)=>{
    const {productId,reviewId} = req.params;
    if(!productId || !reviewId){
        return next(new ErrorHandler('Validation Error',400));
    }
    const product = await Product.findById(productId);
    if(!product) {
        return next(new ErrorHandler('Product Not Found',404));
    }
    const newRatings = product.ratings.filter((review)=>review._id.toString() == reviewId);
    if(newRatings.length === product.ratings.length){
        return next(new ErrorHandler('Given rating is not available',404));
    }
    product.ratings = newRatings;
    var totalReview = product.ratings.reduce((accumulator,currentVal)=>accumulator+currentVal.rating,0);
    // console.log(totalReview)
    var average = totalReview / product.ratings.length;
    product.averageRating = average;
    const productUpdate = await product.save();
    res.json({
        status:'success',
        data:productUpdate
    })
})

module.exports.addProduct = addProduct;
module.exports.getAllProducts = getAllProducts;
module.exports.updateProduct = updateProduct;
module.exports.getSingleProduct = getSingleProduct;
module.exports.deleteProduct = deleteProduct;
module.exports.updateAndRiteReview = updateAndRiteReview;
module.exports.deleteReview = deleteReview;