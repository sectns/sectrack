import { useState } from 'react';
import { X, Calendar as CalendarIcon, Save, XCircle, CheckCircle, PauseCircle } from 'lucide-react';
import { Course, AttendanceStatus, CourseType } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AddAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    onSubmit: (data: {
        date: string;
        type: CourseType;
        hours: number;
        status: AttendanceStatus;
    }) => Promise<void>;
}

export default function AddAttendanceModal({
    isOpen,
    onClose,
    course,
    onSubmit
}: AddAttendanceModalProps) {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Determine default type based on what the course has
    const defaultType = course.t_hours > 0 ? CourseType.T : CourseType.U;

    const [date, setDate] = useState(today);
    const [type, setType] = useState<CourseType>(defaultType);
    const [hours, setHours] = useState(type === CourseType.T ? course.t_hours : course.u_hours);
    const [status, setStatus] = useState<AttendanceStatus>(AttendanceStatus.ABSENT);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Update hours when type changes
    const handleTypeChange = (newType: CourseType) => {
        setType(newType);
        setHours(newType === CourseType.T ? course.t_hours : course.u_hours);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date) {
            setError('Lütfen tarih seçin');
            return;
        }

        if (hours <= 0) {
            setError('Saat 0\'dan büyük olmalı');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await onSubmit({ date, type, hours, status });
            onClose();
        } catch (err) {
            setError('Kaydetme sırasında bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const statusCards = [
        {
            value: AttendanceStatus.ABSENT,
            icon: XCircle,
            label: 'Gitmedim',
            description: 'Devamsızlık hakkından düşer',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            activeColor: 'border-red-500 bg-red-500/20',
            iconColor: 'text-red-400',
            glowColor: 'shadow-red-500/50'
        },
        {
            value: AttendanceStatus.CANCELLED,
            icon: PauseCircle,
            label: 'İptal/Tatil',
            description: 'Hakkı etkilemez',
            bgColor: 'bg-slate-500/10',
            borderColor: 'border-slate-500/30',
            activeColor: 'border-slate-400 bg-slate-500/20',
            iconColor: 'text-slate-400',
            glowColor: 'shadow-slate-500/50'
        },
        {
            value: AttendanceStatus.PRESENT,
            icon: CheckCircle,
            label: 'Gittim',
            description: 'Kayıt için (opsiyonel)',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            activeColor: 'border-emerald-500 bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            glowColor: 'shadow-emerald-500/50'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full md:max-w-lg md:rounded-3xl rounded-t-3xl rounded-b-none animate-slide-up max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl p-6 border-b border-slate-800 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                <CalendarIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Yoklama Ekle
                                </h2>
                                <p className="text-sm text-slate-400">{course.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                            Tarih
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            {format(new Date(date), 'dd MMMM yyyy, EEEE', { locale: tr })}
                        </p>
                    </div>

                    {/* Type (if course has both T and U) */}
                    {course.t_hours > 0 && course.u_hours > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">
                                Tür
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange(CourseType.T)}
                                    className={`h-12 px-4 rounded-xl font-semibold transition-all ${type === CourseType.T
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                                        }`}
                                >
                                    Teorik
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange(CourseType.U)}
                                    className={`h-12 px-4 rounded-xl font-semibold transition-all ${type === CourseType.U
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'
                                        }`}
                                >
                                    Uygulama
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hours */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                            Saat
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Varsayılan: {type === CourseType.T ? course.t_hours : course.u_hours} saat
                        </p>
                    </div>

                    {/* Status - Card Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                            Durum
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {statusCards.map((card) => {
                                const Icon = card.icon;
                                const isActive = status === card.value;

                                return (
                                    <button
                                        key={card.value}
                                        type="button"
                                        onClick={() => setStatus(card.value)}
                                        className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${isActive
                                                ? `${card.activeColor} ${card.glowColor} shadow-lg scale-[1.02]`
                                                : `${card.bgColor} ${card.borderColor} hover:scale-[1.01]`
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl ${card.bgColor} flex items-center justify-center ${isActive ? 'scale-110' : ''
                                                } transition-transform`}>
                                                <Icon className={`w-7 h-7 ${card.iconColor}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className={`font-bold text-lg ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                    {card.label}
                                                </div>
                                                <div className={`text-sm ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                                                    {card.description}
                                                </div>
                                            </div>
                                            {isActive && (
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                    <div className={`w-3 h-3 rounded-full ${card.iconColor.replace('text-', 'bg-')}`} />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-shake">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 btn-secondary"
                            disabled={saving}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
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
                                    Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
