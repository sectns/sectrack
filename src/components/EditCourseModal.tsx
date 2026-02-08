import { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle } from 'lucide-react';
import { Course, AttendanceLog, AttendanceStatus } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

        if (tHours <= 0 && uHours <= 0) {
            setError('En az bir ders türü (Teorik veya Uygulama) tanımlanmalı');
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

    const getStatusLabel = (status: AttendanceStatus) => {
        switch (status) {
            case AttendanceStatus.ABSENT:
                return 'Gitmedim';
            case AttendanceStatus.PRESENT:
                return 'Gittim';
            case AttendanceStatus.CANCELLED:
                return 'İptal';
            case AttendanceStatus.REPORT:
                return 'Rapor';
            default:
                return 'Beklemede';
        }
    };

    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case AttendanceStatus.ABSENT:
                return 'text-red-400 bg-red-500/10 border-red-500/30';
            case AttendanceStatus.PRESENT:
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case AttendanceStatus.CANCELLED:
                return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
            case AttendanceStatus.REPORT:
                return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
            default:
                return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        }
    };

    // Sort logs by date (newest first)
    const sortedLogs = [...attendanceLogs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl rounded-b-none animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-900/90 backdrop-blur-xl p-6 border-b border-slate-800 rounded-t-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">
                            Ders Düzenle
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'edit'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            Bilgileri Düzenle
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'history'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            Geçmiş ({attendanceLogs.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'edit' ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Course Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Ders Adı *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    placeholder="Örn: Makine Öğrenmesi"
                                    required
                                />
                            </div>

                            {/* Course Code */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Ders Kodu (Opsiyonel)
                                </label>
                                <input
                                    type="text"
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    placeholder="Örn: CS401"
                                />
                            </div>

                            {/* Theory Hours */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Teorik (Saat/Hafta)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={tHours}
                                        onChange={(e) => setTHours(Number(e.target.value))}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Teorik Limit (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={tLimit}
                                        onChange={(e) => setTLimit(Number(e.target.value))}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Practice Hours */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Uygulama (Saat/Hafta)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={uHours}
                                        onChange={(e) => setUHours(Number(e.target.value))}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Uygulama Limit (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={uLimit}
                                        onChange={(e) => setULimit(Number(e.target.value))}
                                        className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Delete Course Section */}
                            <div className="pt-4 border-t border-slate-800">
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full h-12 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Dersi Sil
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-red-400">
                                                <p className="font-semibold mb-1">Emin misiniz?</p>
                                                <p className="text-red-400/70">
                                                    Bu ders ve tüm yoklama kayıtları kalıcı olarak silinecek.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 h-12 btn-secondary"
                                            >
                                                İptal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDeleteCourse}
                                                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
                                                disabled={saving}
                                            >
                                                {saving ? 'Siliniyor...' : 'Evet, Sil'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            {sortedLogs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-400">Henüz yoklama kaydı yok</p>
                                </div>
                            ) : (
                                sortedLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-4 rounded-xl bg-slate-800/30 border border-slate-700 hover:bg-slate-800/50 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-white font-medium">
                                                        {format(new Date(log.date), 'dd MMMM yyyy', { locale: tr })}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(log.status)}`}>
                                                        {getStatusLabel(log.status)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                                    <span>{log.type === 'T' ? 'Teorik' : 'Uygulama'}</span>
                                                    <span>•</span>
                                                    <span>{log.hours} saat</span>
                                                    {log.is_auto_marked && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-yellow-400">Otomatik</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="w-10 h-10 rounded-lg hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all"
                                                title="Kaydı Sil"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Only show on edit tab */}
                {activeTab === 'edit' && !showDeleteConfirm && (
                    <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-12 btn-secondary"
                                disabled={saving}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 h-12 btn-primary flex items-center justify-center gap-2"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Değişiklikleri Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
