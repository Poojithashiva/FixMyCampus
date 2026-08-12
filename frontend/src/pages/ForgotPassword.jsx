import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/auth/sendotp', { email });
            setStep(2);
            setLoading(false);
        } catch (err) {
            // Check if backend returned an OTP in the error (dev fallback)
            if (err.response?.data?.otp) {
                setOtp(err.response.data.otp);
                setError(`Note: Email delivery failed, but here is your test code: ${err.response.data.otp}`);
                setTimeout(() => {
                    setStep(2);
                    setLoading(false);
                }, 2000);
            } else {
                setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
                setLoading(false);
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('/auth/resetpassword', {
                email,
                otp,
                newPassword: passwordData.newPassword
            });
            setSuccess(true);
            setLoading(false);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md"
            >
                <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {success ? 'Password Reset!' : step === 1 ? 'Forgot Password?' : 'Verify OTP'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {success
                            ? 'Your password has been updated successfully.'
                            : step === 1
                                ? 'Enter your college email to receive a verification code'
                                : `We've sent a 6-digit code to ${email}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
                            <p className="text-slate-400 text-sm mb-6">Redirecting to login page...</p>
                            <Link to="/login" className="btn-primary inline-block">Login Now</Link>
                        </motion.div>
                    ) : step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleRequestOTP}
                            className="space-y-4"
                        >
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">College Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="email"
                                        className="form-input pl-10"
                                        placeholder="name@college.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Get Verification Code'
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleResetPassword}
                            className="space-y-4"
                        >
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Verification Code (OTP)</label>
                                <div className="relative">
                                    <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        className="form-input pl-10 tracking-[1em] font-mono text-center"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        className="form-input pl-10"
                                        placeholder="••••••••"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        className="form-input pl-10"
                                        placeholder="••••••••"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs text-slate-400 hover:text-white transition-colors text-center"
                                >
                                    Wrong email? Go back
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
