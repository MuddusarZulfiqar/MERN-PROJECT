const express = require('express');
const {getMyDetail ,addUser,loginUser,userLogout, resetPasswordRequest, changePassword, getAllUsers, getSingleUser,resetPassword,updateUserDetail,updateUserRole,deleteUser } = require('../controllers/userController');
const { isAuth, isAdmin } = require('../middlewares/auth');

const router = express.Router();

router.route('/user').post(addUser).get([isAuth, isAdmin],getAllUsers);
router.route('/user/login').post(loginUser).get(isAuth,getMyDetail);
router.route('/user/logout').post(isAuth,userLogout);
router.route('/user/resetPassword').post(resetPasswordRequest);
router.route('/user/changePassword').post([isAuth],changePassword);
router.route('/user/:userId').get([isAuth,isAdmin],getSingleUser).put([isAuth],updateUserDetail).delete([isAuth,isAdmin],deleteUser);
router.route('/user/role/:userId').put([isAuth,isAdmin],updateUserRole)
router.route('/users/resetPassword/:resetToken').post(resetPassword);
module.exports = router;