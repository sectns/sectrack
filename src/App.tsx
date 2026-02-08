import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import { Terminal } from 'lucide-react';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-deep-black">
                <div className="text-center">
                    <Terminal className="w-16 h-16 text-matrix-green mx-auto mb-4 animate-pulse" />
                    <p className="terminal-text text-xl">SISTEM BAŞLATILIYOR...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-deep-black">
            {/* Scanline Effect */}
            <div className="scanline fixed inset-0 pointer-events-none z-50" />

            {/* Main Content */}
            {user ? <Dashboard user={user} /> : <Login />}
        </div>
    );
}

export default App;
