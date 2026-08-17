import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, Search, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComplaintDetail from '../components/ComplaintDetail';
import ProfileModal from '../components/ProfileModal';

const Dashboard = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setError(null);
            const res = await api.get('/complaints');
            setComplaints(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to fetch Campus Issues. Please ensure the server is running.');
            setLoading(false);
        }
    };

    const handleUpvote = async (complaintId) => {
        try {
            await api.put(`/complaints/${complaintId}/upvote`);
            await fetchComplaints();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Unable to upvote this issue.'
            );
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#f59e0b';
            case 'Accepted': return '#3b82f6';
            case 'In Progress': return '#8b5cf6';
            case 'Completed': return '#10b981';
            default: return '#94a3b8';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} />;
            case 'Accepted': return <CheckCircle size={16} />;
            case 'In Progress': return <AlertCircle size={16} />;
            case 'Completed': return <CheckCircle size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                    <button
                        onClick={fetchComplaints}
                        className="ml-auto text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user.role} Dashboard</h1>
                    <p className="text-slate-400 mt-1">
                        Welcome back, <span
                            className="text-primary font-medium cursor-pointer hover:underline decoration-primary decoration-2 underline-offset-4 transition-all"
                            onClick={() => setShowProfile(true)}
                        >
                            {user.name}
                        </span>
                    </p>
                </div>

                {user.role !== 'Admin' && (
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={20} />
                        Report Issue
                    </button>
                )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card !p-6">
                    <p className="text-slate-400 text-sm font-medium">Total Complaints</p>
                    <h3 className="text-3xl font-bold mt-2">{complaints.length}</h3>
                </div>
                <div className="glass-card !p-6">
                    <p className="text-slate-400 text-sm font-medium">Pending</p>
                    <h3 className="text-3xl font-bold mt-2 text-amber-500">
                        {complaints.filter(c => c.status === 'Pending').length}
                    </h3>
                </div>
                <div className="glass-card !p-6">
                    <p className="text-slate-400 text-sm font-medium">Resolved</p>
                    <h3 className="text-3xl font-bold mt-2 text-emerald-500">
                        {complaints.filter(c => c.status === 'Completed').length}
                    </h3>
                </div>
            </div>

            {/* Complaint List */}
            <div className="glass-card !p-0 overflow-hidden">
                <div className="p-6 border-b border-glass-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg font-semibold">Recent Complaints</h3>
                    <div className="relative w-full md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search ID or Category..."
                            className="w-full bg-dark-bg border border-glass-border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            <tr>
                                <th className="px-6 py-4 hidden md:table-cell">ID</th>
                                <th className="px-6 py-4">Category</th>
                                {user.role === 'Admin' && <th className="px-6 py-4 hidden sm:table-cell">User</th>}
                                <th className="px-6 py-4 hidden lg:table-cell">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/30 text-sm">
                            {complaints.map((complaint) => (
                                <tr key={complaint._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500 hidden md:table-cell">#{complaint.complaintId}</td>
                                    <td className="px-6 py-4 font-medium max-w-[120px] truncate">{complaint.category}</td>
                                    {user.role === 'Admin' && (
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="flex flex-col leading-tight">
                                                <span className="font-medium">{complaint.user?.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{complaint.user?.role}</span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${complaint.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/50 text-slate-400'
                                            }`}>
                                            {complaint.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wide" style={{ color: getStatusColor(complaint.status) }}>
                                            <span className="hidden sm:inline">{getStatusIcon(complaint.status)}</span>
                                            {complaint.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-slate-500 hidden sm:table-cell">
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="text-primary font-bold text-xs uppercase tracking-widest hover:text-primary-hover transition-colors"
                                                onClick={() => setSelectedComplaint(complaint)}
                                            >
                                                View
                                            </button>

                                            <button
                                                onClick={() => handleUpvote(complaint._id)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold"
                                                title="Support this issue"
                                            >
                                                👍 {complaint.upvotes || 0}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {complaints.length === 0 && (
                        <div className="p-12 text-center text-slate-400 font-medium">
                            No Issues found.
                        </div>
                    )}
                </div>
            </div>

            {/* Complaint Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <div className="flex justify-between items-center mb-6 sticky top-0 bg-dark-card/90 backdrop-blur-md pb-4 border-b border-glass-border">
                                <h3 className="text-xl font-bold">Submit New Complaint</h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <ComplaintForm onSuccess={() => { setShowForm(false); fetchComplaints(); }} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Complaint Detail Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <div className="flex justify-between items-center mb-6 sticky top-0 bg-dark-card/90 backdrop-blur-md pb-4 border-b border-glass-border">
                                <h3 className="text-xl font-bold">Complaint Details</h3>
                                <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-white transition-colors">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <ComplaintDetail
                                complaint={selectedComplaint}
                                user={user}
                                onUpdate={() => { setSelectedComplaint(null); fetchComplaints(); }}
                                onClose={() => setSelectedComplaint(null)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Profile Modal */}
            <AnimatePresence>
                {showProfile && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <div className="flex justify-between items-center mb-6 sticky top-0 bg-dark-card/90 backdrop-blur-md pb-4 border-b border-glass-border">
                                <h3 className="text-xl font-bold">My Profile</h3>
                                <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <ProfileModal
                                user={user}
                                onClose={() => setShowProfile(false)}
                                onUpdate={(updatedUser) => {
                                    window.location.reload();
                                }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Internal Component for Form
const ComplaintForm = ({ onSuccess }) => {
   const [formData, setFormData] = useState({
        category: 'Classroom',
        department: 'CSE',
        description: '',
        priority: 'Low',
    });
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const data = new FormData();
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('priority', formData.priority);

            for (let i = 0; i < files.length; i++) {
                data.append('evidence', files[i]);
            }

            await api.post('/complaints', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to register complaint. Please check your connection or try again later.');
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 mb-4">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
            <div className="form-group">
                <label className="form-label">Issue Category</label>
                <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                    <option value="Classroom">Classroom</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Mess">Mess</option>
                    <option value="Wi-Fi">Wi-Fi</option>
                    <option value="Library">Library</option>
                    <option value="Transport">Transport</option>
                    <option value="Sports Facilities">Sports Facilities</option>
                    <option value="Campus Cleanliness">Campus Cleanliness</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    rows="4"
                    className="form-input min-h-[100px] resize-y"
                    placeholder="Describe the problem in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Evidence (Photos/Videos)</label>
                <div className="mt-2 border-2 border-dashed border-glass-border rounded-lg p-6 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative">
                    <Plus className="text-slate-400 group-hover:text-primary transition-colors mb-2" size={32} />
                    <span className="text-sm text-slate-400">Click to upload files</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => setFiles(e.target.files)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">
                    Max 5 files. Supports images and videos.
                </p>
                {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {Array.from(files).map((file, idx) => (
                            <span key={idx} className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded ring-1 ring-primary/30">
                                {file.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                    className="form-input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>

            <button
                type="submit"
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={submitting}
            >
                {submitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                    </>
                ) : 'Register Issues'}
            </button>
        </form>
    );
};

export default Dashboard;
