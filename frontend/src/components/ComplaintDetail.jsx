import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, CheckCircle, AlertCircle, MessageSquare, Info, Download, Trash2, HelpCircle } from 'lucide-react';

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
        default: return <HelpCircle size={16} />;
    }
};

const ComplaintDetail = ({ complaint, user, onUpdate, onClose }) => {
    const [formData, setFormData] = useState({
        status: complaint.status,
        remarks: complaint.remarks || '',
        adminResponse: complaint.adminResponse || '',
    });
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    const isAdmin = user.role === 'Admin';

    useEffect(() => {
        if (complaint.status === 'Completed' && complaint.completedAt) {
            const updateTimer = () => {
                const completedTime = new Date(complaint.completedAt).getTime();
                const now = new Date().getTime();
                const tenMinutesInMs = 10 * 60 * 1000;
                const expiryTime = completedTime + tenMinutesInMs;
                const difference = expiryTime - now;

                if (difference <= 0) {
                    if (timeLeft !== 'Expired') {
                        setTimeLeft('Expired');

                        // If Admin, delete from DB immediately. Otherwise, refresh will hide it
                        if (isAdmin) {
                            api.delete(`/complaints/${complaint._id}`)
                                .then(() => onUpdate())
                                .catch(err => console.error(err));
                        } else {
                            onUpdate();
                        }
                    }
                    return false;
                } else {
                    const minutes = Math.floor(difference / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                    setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
                    return true;
                }
            };

            // Run once immediately
            updateTimer();

            // Set interval for subsequent updates
            const timer = setInterval(() => {
                const isActive = updateTimer();
                if (!isActive) clearInterval(timer);
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setTimeLeft(null);
        }
    }, [complaint.status, complaint.completedAt, onUpdate, timeLeft, isAdmin, complaint._id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/complaints/${complaint._id}`, formData);
            onUpdate();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="text-slate-200">
            {complaint.status === 'Completed' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Trash2 size={20} className="text-red-400" />
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold text-red-400 uppercase tracking-tight">Auto-Deletion Active</p>
                            <p className="text-xs text-slate-400 mt-0.5">This complaint will be removed from the system soon.</p>
                        </div>
                    </div>
                    <div className="text-center sm:text-right px-4 py-2 bg-red-500/10 rounded-lg min-w-[100px]">
                        <p className="text-[10px] text-red-400/70 font-bold uppercase tracking-widest">Time Remaining</p>
                        <p className="text-xl font-mono font-bold text-red-400">{timeLeft || '10m 00s'}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                    <div className="border-b border-glass-border pb-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Complaint ID</span>
                        <h3 className="text-2xl font-bold tracking-tight text-primary">#{complaint.complaintId}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-lg border border-glass-border">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status</span>
                            <div className="flex items-center gap-2 mt-1 font-semibold" style={{ color: getStatusColor(complaint.status) }}>
                                {getStatusIcon(complaint.status)}
                                <span className="text-sm">{complaint.status}</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-glass-border">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Priority</span>
                            <div className={`mt-1 text-sm font-bold uppercase ${complaint.priority === 'High' ? 'text-red-400' : 'text-slate-300'}`}>
                                {complaint.priority}
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-bg p-4 rounded-xl border border-glass-border">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Description</span>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{complaint.description}</p>
                    </div>

                    {complaint.evidence && complaint.evidence.length > 0 && (
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Evidence Files</span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                {complaint.evidence.map((file, index) => {
                                    // With Cloudinary, file is already the URL
                                    const fileUrl = file;
                                    const isVideo = /\.(mp4|mov|avi|wmv)$/i.test(file);

                                    return (
                                        <div key={index} className="group relative aspect-video bg-black rounded-lg overflow-hidden border border-glass-border hover:border-primary/50 transition-colors">
                                            {isVideo ? (
                                                <video src={fileUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={fileUrl} alt={`Evidence ${index}`} className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <a
                                                    href={fileUrl}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-primary rounded-full text-white hover:scale-110 transition-transform shadow-lg"
                                                    title="Download/View Full"
                                                >
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!isAdmin && (
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mt-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={16} className="text-primary" />
                                <span className="text-sm font-bold uppercase tracking-wider text-primary">Office Support</span>
                            </div>
                            <div className="space-y-1 text-xs text-slate-400 leading-relaxed">
                                <p><span className="text-slate-300 font-medium">Office:</span> Room 402, Main Block</p>
                                <p><span className="text-slate-300 font-medium">Hours:</span> 10:00 AM - 4:00 PM</p>
                                <p><span className="text-slate-300 font-medium">Contact:</span> admin_support@college.edu</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:border-l lg:border-glass-border lg:pl-12 space-y-6 pt-8 lg:pt-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-slate-400" />
                        <h4 className="text-lg font-bold">Resolution & Response</h4>
                    </div>

                    {isAdmin ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-group">
                                <label className="form-label">Update Status</label>
                                <select className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Pending">Pending</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Admin Remarks (Internal)</label>
                                <textarea
                                    className="form-input min-h-[80px]"
                                    rows="3"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="Internal notes for tracking..."
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Official Response (To User)</label>
                                <textarea
                                    className="form-input min-h-[80px]"
                                    rows="3"
                                    value={formData.adminResponse}
                                    onChange={(e) => setFormData({ ...formData, adminResponse: e.target.value })}
                                    placeholder="Write a message to the user..."
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full disabled:opacity-50" disabled={loading}>
                                {loading ? 'Updating...' : 'Save & Publish'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Official Response</span>
                                <div className="mt-2 p-5 bg-white/5 rounded-xl border border-glass-border min-h-[100px]">
                                    {complaint.adminResponse ? (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.adminResponse}</p>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4 text-center">
                                            <Clock className="text-slate-600 mb-2" size={24} />
                                            <p className="text-sm italic text-slate-500">Wait for admin review...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-glass-border pt-4">
                                <span>Timeline</span>
                                <span className="text-slate-400">Update: {new Date(complaint.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetail;
