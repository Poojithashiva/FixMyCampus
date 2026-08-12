import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        department: '',
    });

    const { register, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[90vh] py-8 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass-card w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                        <UserPlus size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                    <p className="text-slate-400 text-sm mt-1">Join FixMyCampus</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input name="name" type="text" className="form-input" placeholder="John Doe" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input name="email" type="email" className="form-input" placeholder="john@college.edu" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input name="password" type="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select name="role" className="form-input" onChange={handleChange}>
                                <option value="Student">Student</option>
                                <option value="Faculty">Faculty</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input name="department" type="text" className="form-input" placeholder="e.g. CS" onChange={handleChange} required />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full mt-2">
                        Register
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-400">
                    Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
