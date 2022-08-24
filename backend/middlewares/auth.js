const ErrorHandler = require('../utils/errorHandling');
const jwt = require('jsonwebtoken');
// check user is authenticated;
const User = require('../models/userModel');
const isAuth = async (req, res, next) => {
    if (!req.cookies.token) {
        return next(new ErrorHandler('Please login to continue', 401));
    }
    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorHandler('Please login to continue', 401));
    }
};

// check user is admin
const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new ErrorHandler('You are not authorized to access this route', 401));
    }
    next();
}

module.exports = { isAuth, isAdmin };