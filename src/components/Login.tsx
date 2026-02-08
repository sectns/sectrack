import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            <div className="glass-panel w-full max-w-md relative animate-slide-up">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 glow-emerald">
                        <span className="text-2xl font-bold text-white">ST</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        SecTrack
                    </h1>
                    <p className="text-slate-400">
                        Yoklama takip sistemi
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            E-posta
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-modern pl-11"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Şifre
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-modern pl-11"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full btn-primary flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isSignUp ? 'Kayıt Olunuyor...' : 'Giriş Yapılıyor...'}
                            </>
                        ) : (
                            <>
                                {isSignUp ? (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Kayıt Ol
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Giriş Yap
                                    </>
                                )}
                            </>
                        )}
                    </button>

                    {/* Toggle */}
                    <div className="text-center pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            {isSignUp
                                ? 'Zaten hesabın var mı? Giriş yap'
                                : 'Hesabın yok mu? Kayıt ol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
