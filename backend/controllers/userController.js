const ErrorHandler = require('../utils/errorHandling');
const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const setJwtToken = require('../utils/jwt');
const sendEmail = require('../utils/email');
const resetPasswordEmailTemplate = require('../emails/resetPassword')
const addUser = catchAsyncError(async (req, res, next) => {
    const {name,email,password,confirmPassword} = req.body;
    if(!name || !email || !password || !confirmPassword){
        return next(new ErrorHandler('Please provide all the required fields',400));
    }
    if(password !== confirmPassword){
        return next(new ErrorHandler('Passwords do not match',400));
    }
    // check if user already exists
    const userFind = await User.findOne({email});
    if(userFind){
        return next(new ErrorHandler('User already exists',400));
    }
    const user = await User.create(req.body);
    const token = await user.getSignedJwtToken();

    setJwtToken(token,200,res);
});

const loginUser = catchAsyncError(async (req, res, next) => {
    const {email,password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler('Please provide all the required fields',400));
    }
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorHandler('User does not exist',400));
    }
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorHandler('Invalid password',400));
    }
    const token = await user.getSignedJwtToken();
    setJwtToken(token,200,res);
});

const userLogout = catchAsyncError(async (req,res,next)=>{
    res.cookie('token','none',{
        expires:new Date(Date.now() + 10*1000),
        httpOnly:true
    }).status(200).json({
        status:'success',
        token:'none'
    });
});

const changePassword = catchAsyncError(async (req,res,next)=>{
    const {oldPassword,newPassword,confirmPassword} = req.body;
    if(!oldPassword || !newPassword || !confirmPassword){
        return next(new ErrorHandler('Please provide all the required fields',400));
    }
    if(newPassword !== confirmPassword){
        return next(new ErrorHandler('Passwords do not match',400));
    }
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(oldPassword);
    if(!isMatch){
        return next(new ErrorHandler('Invalid password',400));
    }
    user.password = newPassword;
    await user.save();
    const token = await user.getSignedJwtToken();
    setJwtToken(token,200,res);
});

const resetPasswordRequest = catchAsyncError(async (req,res,next)=>{
    // send email to user with token
    const {email} = req.body;
    if(!email){
        return next(new ErrorHandler('Please provide all the required fields',400));
    }
    const user = await User.findOne({email});
    if(!user){
        return next(new ErrorHandler('User does not exist',400));
    }
    const resetToken = await user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    const resetURL = `${process.env.LOCAL_STORAGE_PATH}/api/users/resetPassword/${resetToken}`;
    const emailTemplate = resetPasswordEmailTemplate(resetURL);
    try{
        await sendEmail({
            email:user.email,
            subject:'Password reset token',
            html:emailTemplate
        });
        res.status(200).json({
            status:'success',
            message:'Token sent to email'
        });
    }
    catch(err){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler('Email could not be sent',500));
    }
});
const resetPassword = catchAsyncError(async (req,res,next)=>{
    const {resetToken} = req.params;
    const {password='Allah@112233',confirmPassword='Allah@112233'} = req.body;
    if(!password || !confirmPassword){
        return next(new ErrorHandler('Please provide all the required fields',400));
    }
    if(password !== confirmPassword){
        return next(new ErrorHandler('Passwords do not match',400));
    }
    const user = await User.findOne({passwordResetToken:resetToken,passwordResetExpires:{$gt:Date.now()}});
    if(!user){
        return next(new ErrorHandler('Invalid token',400));
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave:false});
    const token = await user.getSignedJwtToken();
    setJwtToken(token,200,res);
});
const getAllUsers = catchAsyncError(async (req,res,next)=>{
    const users = await User.find({}).select("-password");
    res.status(200).json({
        status:'success',
        count:users.length,
        data:users
    });
});

const getSingleUser = catchAsyncError(async (req,res,next)=>{
    const {userId} = req.params;
    const user = await User.findById(userId).select("+password");
    if(!user) {
        return next(new ErrorHandler('User Not Found',404))
    };
    res.status(200).json({
        status:'success',
        data:user
    });
});

const getMyDetail = catchAsyncError(async (req,res,next)=>{
    
    const user = await User.findById(req.user.id).select("-__v -passwordResetExpires -passwordResetToken");
    if(!user){
        return next(new ErrorHandler('User Not Found',404))
    }
    res.status(200).json({
        status:'success',
        data:user
    })
})


const updateUserDetail = catchAsyncError(async (req,res,next)=>{
    if(Object.keys(req.body).length === 0){
        return next(new ErrorHandler('Please provide at least one field to update',400));
    }
    if(req.body.password){
        return next(new ErrorHandler('Not able to change password',400));
    }
    const user = await User.findByIdAndUpdate(req.params.userId,req.body,{new:true,runValidators:true}).select("-role -__v");
    if(!user){
        return next(new ErrorHandler('User not found',404));
    }
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    });
})

const updateUserRole = catchAsyncError(async (req,res,next)=>{
    const {userId} = req.params;
    if(Object.keys(req.body).length === 0){
        return next(new ErrorHandler('Please provide role to update',400));
    }
    if(!req.body.role){
        return next(new ErrorHandler('Please provide role to update',400));
    }
    const user = await User.findByIdAndUpdate(userId,{role:req.body.role},{
        new:true,
        runValidators:true
    }).select('+role');

    if(!user){
        return next(new ErrorHandler('User not found',404));
    }

    res.status(200).json({
        "status": "success",
        data:user
    })
});

const deleteUser = catchAsyncError(async (req,res,next)=>{
    const {userId} = req.params;
    const user = await User.findByIdAndDelete(userId);
    if(!user){
        return next(new ErrorHandler('User Not Found',404));
    }
    
    res.json({
        status:"success",
        message:"User Deleted Successfully"
    })
});
module.exports.addUser = addUser;
module.exports.loginUser = loginUser;
module.exports.userLogout = userLogout;
module.exports.changePassword = changePassword;
module.exports.resetPasswordRequest = resetPasswordRequest;
module.exports.resetPassword = resetPassword;
module.exports.getAllUsers = getAllUsers;
module.exports.getSingleUser = getSingleUser;
module.exports.getMyDetail = getMyDetail;
module.exports.updateUserDetail = updateUserDetail
module.exports.updateUserRole = updateUserRole
module.exports.deleteUser = deleteUser