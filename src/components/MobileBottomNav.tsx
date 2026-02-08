import { Home, Calendar, Settings } from 'lucide-react';

interface MobileBottomNavProps {
    activeTab: 'dashboard' | 'schedule' | 'settings';
    onTabChange: (tab: 'dashboard' | 'schedule' | 'settings') => void;
}

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
    const tabs = [
        { id: 'dashboard' as const, icon: Home, label: 'Ana Sayfa' },
        { id: 'schedule' as const, icon: Calendar, label: 'Program' },
        { id: 'settings' as const, icon: Settings, label: 'Ayarlar' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
            <div className="flex items-center justify-around px-2 py-3">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
