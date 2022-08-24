const express = require('express');
const { createOrder, getSingleOrder, getLoginUserOrders, updateOrderStatus,getAllOrders } = require('../controllers/orderController');
const { isAuth, isAdmin } = require('../middlewares/auth');
const router = express.Router();

router.route('/order').post([isAuth],createOrder);
router.route('/order/:orderId').get([isAuth,isAdmin],getSingleOrder).put([isAuth,isAdmin],updateOrderStatus);
router.route('/orders/login').get(isAuth,getLoginUserOrders);
router.route('/orders/all').get([isAuth,isAdmin],getAllOrders);
module.exports = router