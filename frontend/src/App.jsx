import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import Protocols from './pages/Protocols';
import ForgotPassword from './pages/ForgotPassword';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

import { Menu, X, LogOut, User, Info, ShieldCheck } from 'lucide-react';

function AppContent() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="min-h-screen">
            {user && (
                <nav className="sticky top-0 z-50 bg-dark-card/90 backdrop-blur-xl border-b border-glass-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" onClick={closeMenu} className="text-xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">
                                    FixMyCampus
                                </Link>
                            </div>

                            {/* Desktop Nav */}
                            <div className="hidden sm:flex items-center gap-8">
                                {user.role !== 'Admin' && (
                                    <Link
                                        to="/protocols"
                                        className={`text-sm font-semibold transition-colors ${location.pathname === '/protocols' ? 'text-primary' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Rules
                                    </Link>
                                )}
                                <div className="h-4 w-px bg-glass-border mx-2" />
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-200 font-medium">{user.name}</span>
                                    <button
                                        onClick={logout}
                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <div className="sm:hidden flex items-center">
                                <button
                                    onClick={toggleMenu}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMenuOpen && (
                        <div className="sm:hidden bg-dark-card border-b border-glass-border px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
                            <div className="flex items-center gap-3 px-2 mb-6 pb-4 border-b border-glass-border/30">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white leading-none">{user.name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{user.role}</span>
                                </div>
                            </div>
                            <Link
                                to="/about"
                                onClick={closeMenu}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/about' ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}
                            >
                                <Info size={18} />
                                <span className="font-semibold">About Portal</span>
                            </Link>
                            {user.role !== 'Admin' && (
                                <Link
                                    to="/protocols"
                                    onClick={closeMenu}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/protocols' ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}
                                >
                                    <ShieldCheck size={18} />
                                    <span className="font-semibold">Portal Rules</span>
                                </Link>
                            )}
                            <button
                                onClick={() => { logout(); closeMenu(); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 font-semibold"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </nav>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/protocols"
                        element={
                            <ProtectedRoute>
                                {user?.role !== 'Admin' ? <Protocols /> : <Navigate to="/dashboard" />}
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
