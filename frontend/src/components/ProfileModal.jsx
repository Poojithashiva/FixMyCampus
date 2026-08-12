import React, { useState } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Building, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfileModal = ({ user, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        department: user.department,
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await api.put('/auth/updatedetails', formData);
            onUpdate(res.data.data);
            setSuccess('Details updated successfully');
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update details');
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await api.put('/auth/updatepassword', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
            setLoading(false);
        }
    };

    const [deletePassword, setDeletePassword] = useState('');

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await api.delete('/auth/deleteaccount', {
                data: { password: deletePassword }
            });
            localStorage.removeItem('token');
            window.location.href = '/login';
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account');
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex gap-4 mb-8 border-b border-glass-border">
                <button
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
                    onClick={() => { setActiveTab('details'); setError(null); setSuccess(null); }}
                >
                    Account Details
                </button>
                <button
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'password' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
                    onClick={() => { setActiveTab('password'); setError(null); setSuccess(null); }}
                >
                    Security
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            {activeTab === 'details' ? (
                <form onSubmit={handleUpdateDetails} className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                className="form-input pl-10"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                className="form-input pl-10"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Department</label>
                        <div className="relative">
                            <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                className="form-input pl-10"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </form>
            ) : (
                <div className="space-y-8">
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="form-group">
                            <div className="flex justify-between items-center mb-1">
                                <label className="form-label mb-0">Current Password</label>
                                <button
                                    type="button"
                                    onClick={() => alert('For security, if you forgot your current password, please logout and use the "Forgot Password" link on the login page to verify your identity and reset your password.')}
                                    className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    className="form-input pl-10"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? 'Updating...' : <><Lock size={18} /> Update Password</>}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-glass-border">
                        <h3 className="text-red-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            Danger Zone
                        </h3>
                        <p className="text-slate-400 text-xs mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        className="form-input pl-10"
                                        placeholder="Enter password to delete account"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 font-bold rounded-lg transition-all text-sm uppercase tracking-wider"
                            >
                                {loading ? 'Deleting...' : 'Delete My Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileModal;
