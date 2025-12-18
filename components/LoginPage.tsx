import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, Chrome, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginWithEmail, loginWithGoogle } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LoginPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await loginWithEmail(email, password);
        } catch (err: any) {
            console.error('Email login error:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Email/Password sign-in is not enabled in Firebase Console.');
            } else {
                setError(err.message || 'Failed to sign in. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        console.log('Google Sign-In button clicked');
        setLoading(true);
        setError(null);
        try {
            console.log('Initiating signInWithRedirect...');
            await loginWithGoogle();
        } catch (err: any) {
            console.error('Google Sign-In error:', err);
            setError(err.message || 'Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-950 p-6">
            <div className="absolute inset-0 bg-grid-slate-300/[0.05] bg-[size:40px_40px] pointer-events-none"></div>

            <div className="w-full max-w-md relative">
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-300/50 dark:shadow-none mb-6 border border-slate-200 dark:border-slate-800">
                        <span className="text-3xl font-black bg-gradient-to-br from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent transform -rotate-2">PF</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">PropFolio Manager</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to manage your property portfolio</p>
                </div>

                <div className="premium-card p-8 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-200 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 focus:border-slate-800 dark:focus:border-slate-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-200 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 focus:border-slate-800 dark:focus:border-slate-600 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10 dark:shadow-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                            Sign In
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-bold">Or continue with</span></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <Chrome size={20} className="text-slate-600 dark:text-slate-300" />
                        Google Account
                    </button>
                </div>

                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
                    Don't have an account? <span className="text-slate-900 dark:text-slate-50 font-bold cursor-pointer hover:underline">Contact Support</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
