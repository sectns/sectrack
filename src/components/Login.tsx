import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';

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
        <div className="min-h-screen flex">
            {/* Left Side - Form (Mobile: Full Screen, Desktop: 40%) */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile Background */}
                <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md relative z-10">
                    {/* Logo & Header */}
                    <div className="mb-10 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-6 glow-emerald-lg">
                            <span className="text-2xl font-bold text-white">ST</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                            {isSignUp ? 'Hesap Oluştur' : 'Tekrar Hoş Geldin'}
                        </h1>
                        <p className="text-slate-400 text-base font-medium">
                            {isSignUp
                                ? 'Devamsızlık takibini kolaylaştırmak için kayıt ol'
                                : 'Devamsızlık durumunu kontrol etmek için giriş yap'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
                        <Input
                            type="email"
                            label="E-posta Adresi"
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            required
                            autoComplete="email"
                        />

                        <Input
                            type="password"
                            label="Şifre"
                            placeholder="En az 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={Lock}
                            required
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        />

                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm animate-shake">
                                <p className="text-sm font-medium text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            icon={isSignUp ? UserPlus : LogIn}
                        >
                            {loading
                                ? (isSignUp ? 'Kayıt Olunuyor...' : 'Giriş Yapılıyor...')
                                : (isSignUp ? 'Kayıt Ol' : 'Giriş Yap')}
                        </Button>

                        {/* Toggle */}
                        <div className="pt-6 border-t border-slate-800/50 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                }}
                                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                {isSignUp
                                    ? 'Zaten hesabın var mı? Giriş yap'
                                    : 'Hesabın yok mu? Kayıt ol'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Decorative Panel (Desktop Only) */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border-l border-slate-800/50">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    {/* Quote Section */}
                    <div className="max-w-xl mb-16 text-center">
                        <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-6 animate-pulse" />
                        <blockquote className="text-3xl font-bold text-white mb-4 leading-tight tracking-tight">
                            "Devamsızlığı dert etme,<br />
                            <span className="text-gradient-emerald">SecTrack</span> senin yerine takip eder."
                        </blockquote>
                        <p className="text-slate-400 text-lg font-medium">
                            Akıllı yoklama takip sistemi ile devamsızlık limitini asla aşma.
                        </p>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 gap-6 max-w-lg w-full">
                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 tracking-tight">Gerçek Zamanlı Takip</h3>
                                <p className="text-slate-400 text-sm font-medium">Devamsızlık durumunu anlık olarak görüntüle ve kontrol et.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 tracking-tight">Kolay Kullanım</h3>
                                <p className="text-slate-400 text-sm font-medium">Sade ve modern arayüz ile hızlı yoklama girişi.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
