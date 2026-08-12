const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const otpGenerator = require('otp-generator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password, role, department } = req.body;

    try {
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            department,
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide an email and password',
        });
    }

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
    };

    try {
        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/sendotp
// @access  Public
exports.sendOTP = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        // Generate 6-digit OTP using otp-generator
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        });

        // Save OTP to user (valid for 10 minutes)
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send Email
        const message = `Your password reset verification code is: ${otp}. This code is valid for 10 minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6366f1;">FixMyCampusPassword Reset</h2>
                <p>You requested a password reset. Please use the verification code below:</p>
                <div style="background: #f4f4f5; font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
                <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'FixMyCampus Password Reset Code',
                message,
                html,
            });

            res.status(200).json({
                success: true,
                message: 'OTP sent to your college email',
            });
        } catch (err) {
            console.error('Email Error:', err);
            // Fallback for development if email fails
            user.resetPasswordOTP = otp;
            user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
            await user.save();

            res.status(500).json({
                success: false,
                message: 'Error sending email. Please try again later.',
                otp: process.env.NODE_ENV === 'development' ? otp : undefined // Return OTP only in dev if mail fails
            });
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Reset password (OTP-based)
// @route   POST /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res, next) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordOTPExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }

        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
exports.deleteAccount = async (req, res, next) => {
    const { password } = req.body;

    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password',
            });
        }

        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(statusCode).json({
        success: true,
        token,
    });
};
