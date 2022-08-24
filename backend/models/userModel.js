const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

UserSchema.methods.matchPassword = async function (enteredPassword) {
    const user = this;
    let validPassword = await bcrypt.compare(enteredPassword, user.password);
    return  validPassword;
}

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.createHash('sha256').update(crypto.randomBytes(32).toString('hex')).digest('hex');
    this.passwordResetToken = resetToken;
    var minutesToAdd=5;
    var currentDate = new Date();
    var futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
    this.passwordResetExpires = futureDate;
    return resetToken;
}

UserSchema.methods.checkPasswordResetToken = async function (token) {
    const user = this;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = new Date();
    if (now.getTime() > decoded.exp) {
        return false;
    }
    user.passwordResetExpires = decoded.exp;
    return true;
}

module.exports = mongoose.model('User', UserSchema);