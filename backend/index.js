const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv')
const dataBaseConnect = require('./database/db.js')
const ErrorHandler = require('./middlewares/error');
const productRouter = require('./routes/productRouter');
const userRouter = require('./routes/userRouter');
const orderRouter = require('./routes/orderRouter');
const paymentRouter = require('./routes/paymentRoute')
const cors = require('cors');
const cloudinary = require('cloudinary');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
// ! Create app
const app = express();

// ! App configs 
dotenv.config({ path: `config/config.env` });
// Handling uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('Server error: ' + err.message);
    process.exit(1);
});

// ! import middleware app

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
// ! starting the DataBase
dataBaseConnect();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
}



app.use(cors(corsOptions))

app.use('/api',productRouter);
app.use('/api',userRouter);
app.use('/api',orderRouter);
app.use('/api',paymentRouter);
// ! Starting Server
const PORT = process.env.PORT || 5000; 
app.listen(PORT,()=>{
    console.log(`Server is starting on http://localhost:${PORT}`)
});


app.use(ErrorHandler);

// unhandled promise rejection

process.on('unhandledRejection', (reason) => {
    console.log('Server closed duce to'+reason);
    server.close(()=>{
        process.exit(1);
    })
});