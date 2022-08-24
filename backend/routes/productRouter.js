const express = require('express');
const { addProduct,getAllProducts,updateProduct,getSingleProduct,deleteProduct,updateAndRiteReview, deleteReview } = require('../controllers/productController');
const { isAuth, isAdmin } = require('../middlewares/auth');
const router = express.Router();

router.route('/product').post([isAuth,isAdmin],addProduct).get(getAllProducts);
router.route('/product/:id').put([isAuth,isAdmin],updateProduct).get(getSingleProduct).delete([isAuth,isAdmin],deleteProduct).post(isAuth,updateAndRiteReview);
router.route('/product/review/:productId/:reviewId').delete([isAuth,isAdmin],deleteReview)

module.exports = router;