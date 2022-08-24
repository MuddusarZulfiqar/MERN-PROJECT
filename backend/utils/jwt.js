

const createToken = (token,statusCode,res) => {
    // console.log(process.env.JWT_COOKIE_EXPIRES_IN)
    
    const option = {
        expire : new Date(Date.now() + (process.env.JWT_EXPIRE *24*60*60*1000)),
        httpOnly:true
    }
    res.cookie('token',token,option).status(statusCode).json({
        status:'success',
        token,
    })
}

module.exports = createToken;