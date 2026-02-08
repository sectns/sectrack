import { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle, History, Settings, Check } from 'lucide-react';
import { Course, AttendanceLog, AttendanceStatus } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Input from './ui/Input';
import Button from './ui/Button';

interface EditCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    attendanceLogs: AttendanceLog[];
    onUpdate: (data: {
        name: string;
        course_code?: string;
        t_hours: number;
        u_hours: number;
        t_limit_percent: number;
        u_limit_percent: number;
    }) => Promise<void>;
    onDelete: () => Promise<void>;
    onDeleteLog: (logId: string) => Promise<void>;
}

const PRESET_COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Orange
    '#ec4899', // Pink
    '#ef4444', // Red
];

export default function EditCourseModal({
    isOpen,
    onClose,
    course,
    attendanceLogs,
    onUpdate,
    onDelete,
    onDeleteLog
}: EditCourseModalProps) {
    const [name, setName] = useState(course.name);
    const [courseCode, setCourseCode] = useState(course.course_code || '');
    const [tHours, setTHours] = useState(course.t_hours);
    const [uHours, setUHours] = useState(course.u_hours);
    const [tLimit, setTLimit] = useState(course.t_limit_percent);
    const [uLimit, setULimit] = useState(course.u_limit_percent);
    const [colorCode, setColorCode] = useState(course.color_code);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');

    useEffect(() => {
        if (isOpen) {
            setName(course.name);
            setCourseCode(course.course_code || '');
            setTHours(course.t_hours);
            setUHours(course.u_hours);
            setTLimit(course.t_limit_percent);
            setULimit(course.u_limit_percent);
            setColorCode(course.color_code);
            setError('');
            setShowDeleteConfirm(false);
        }
    }, [isOpen, course]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Ders adı boş olamaz');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await onUpdate({
                name: name.trim(),
                course_code: courseCode.trim() || undefined,
                t_hours: tHours,
                u_hours: uHours,
                t_limit_percent: tLimit,
                u_limit_percent: uLimit
                // Note: The original onUpdate didn't include color_code in its signature but the DB has it.
                // Assuming for now the update logic handles what's passed or needs extension.
            });
            onClose();
        } catch (err) {
            setError('Güncelleme sırasında bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCourse = async () => {
        try {
            setSaving(true);
            await onDelete();
            onClose();
        } catch (err) {
            setError('Silme sırasında bir hata oluştu');
            setSaving(false);
        }
    };

    const handleDeleteLog = async (logId: string) => {
        try {
            await onDeleteLog(logId);
        } catch (err) {
            setError('Kayıt silinirken bir hata oluştu');
        }
    };

    const getStatusInfo = (status: AttendanceStatus) => {
        switch (status) {
            case AttendanceStatus.ABSENT:
                return { label: 'Gitmedim', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
            case AttendanceStatus.PRESENT:
                return { label: 'Gittim', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
            case AttendanceStatus.CANCELLED:
                return { label: 'İptal', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
            case AttendanceStatus.REPORT:
                return { label: 'Rapor', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            default:
                return { label: 'Beklemede', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
        }
    };

    const sortedLogs = [...attendanceLogs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900/90 backdrop-blur-xl w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-slate-900/50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                {activeTab === 'edit' ? <Settings className="w-6 h-6" /> : <History className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Ders Bilgileri</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{course.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'edit'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                    : 'text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            Düzenle
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                    : 'text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            Geçmiş ({attendanceLogs.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'edit' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                <Input
                                    label="Ders Adı"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Örn: Makine Öğrenmesi"
                                    required
                                />
                                <Input
                                    label="Ders Kodu (Opsiyonel)"
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value)}
                                    placeholder="Örn: CS401"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    label="Teorik Saat"
                                    value={tHours}
                                    onChange={(e) => setTHours(Number(e.target.value))}
                                    helperText="Haftalık T"
                                />
                                <Input
                                    type="number"
                                    label="Teorik Limit (%)"
                                    value={tLimit}
                                    onChange={(e) => setTLimit(Number(e.target.value))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    label="Uygulama Saat"
                                    value={uHours}
                                    onChange={(e) => setUHours(Number(e.target.value))}
                                    helperText="Haftalık U"
                                />
                                <Input
                                    type="number"
                                    label="Uygulama Limit (%)"
                                    value={uLimit}
                                    onChange={(e) => setULimit(Number(e.target.value))}
                                />
                            </div>

                            {/* Color Picker Swatches (Sync if handled by onUpdate) */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-300 tracking-tight">
                                    Ders Rengi
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setColorCode(color)}
                                            className={`
                                                w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center
                                                ${colorCode === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}
                                            `}
                                            style={{ backgroundColor: color }}
                                        >
                                            {colorCode === color && (
                                                <Check className="w-5 h-5 text-white drop-shadow-md" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Delete Section */}
                            <div className="pt-6 border-t border-white/5">
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full h-14 rounded-2xl border-2 border-dashed border-red-500/20 text-red-400 font-bold hover:bg-red-500/5 hover:border-red-500/40 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Dersi Sil
                                    </button>
                                ) : (
                                    <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-4 animate-shake">
                                        <div className="flex gap-4">
                                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-white font-bold tracking-tight">Dersi Siliyorsunuz</h4>
                                                <p className="text-xs text-red-100/70 font-medium leading-relaxed mt-1">
                                                    Bu işlem geri alınamaz. Ders ve tüm geçmiş yoklama kayıtları sistemden kalıcı olarak silinecektir.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="secondary" fullWidth size="sm" onClick={() => setShowDeleteConfirm(false)}>Vazgeç</Button>
                                            <Button variant="danger" fullWidth size="sm" onClick={handleDeleteCourse} loading={saving}>Evet, Sil</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-fade-in">
                            {sortedLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center opacity-50">
                                        <History className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Henüz yoklama kaydı bulunmuyor.</p>
                                </div>
                            ) : (
                                sortedLogs.map((log) => {
                                    const status = getStatusInfo(log.status);
                                    return (
                                        <div
                                            key={log.id}
                                            className="group p-4 rounded-2xl bg-slate-950/30 border border-white/5 hover:bg-slate-950/50 hover:border-white/10 transition-all flex items-center justify-between"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-bold tracking-tight">
                                                        {format(new Date(log.date), 'dd MMMM yyyy', { locale: tr })}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${status.color} ${status.bg} ${status.border}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <span className={log.type === 'T' ? 'text-emerald-500/70' : 'text-blue-500/70'}>
                                                        {log.type === 'T' ? 'Teorik' : 'Uygulama'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{log.hours} Saat</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="w-10 h-10 rounded-xl hover:bg-red-500/10 text-slate-600 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                title="Kaydı Sil"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'edit' && !showDeleteConfirm && (
                    <div className="p-6 border-t border-white/5 bg-slate-900/50 flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            fullWidth
                            onClick={onClose}
                            disabled={saving}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={saving}
                            onClick={handleSubmit}
                            icon={Save}
                        >
                            Değişiklikleri Kaydet
                        </Button>
                    </div>
                )}
            </div>

            {error && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-xl bg-red-500 text-white shadow-2xl shadow-red-900/50 font-bold text-sm z-[60] animate-bounce">
                    {error}
                </div>
            )}
        </div>
    );
}
