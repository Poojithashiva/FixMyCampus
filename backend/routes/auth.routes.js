const express = require('express');
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    sendOTP,
    resetPassword,
    deleteAccount,
} = require('../controllers/auth.controller');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/sendotp', sendOTP);
router.post('/resetpassword', resetPassword);
router.delete('/deleteaccount', protect, deleteAccount);

module.exports = router;
