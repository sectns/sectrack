import { useState } from 'react';
import { X, Calendar as CalendarIcon, Save, XCircle, CheckCircle, PauseCircle } from 'lucide-react';
import { Course, AttendanceStatus, CourseType } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Input from './ui/Input';
import Button from './ui/Button';

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
            activeStyles: 'border-red-500 bg-red-500/10 shadow-lg shadow-red-900/20',
            inactiveStyles: 'border-white/5 bg-slate-950/30 hover:bg-slate-950/50',
            iconColor: 'text-red-400'
        },
        {
            value: AttendanceStatus.CANCELLED,
            icon: PauseCircle,
            label: 'İptal/Tatil',
            description: 'Hakkı etkilemez',
            activeStyles: 'border-slate-400 bg-slate-800/80 shadow-lg shadow-slate-900/20',
            inactiveStyles: 'border-white/5 bg-slate-950/30 hover:bg-slate-950/50',
            iconColor: 'text-slate-400'
        },
        {
            value: AttendanceStatus.PRESENT,
            icon: CheckCircle,
            label: 'Gittim',
            description: 'Kayıt için (opsiyonel)',
            activeStyles: 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-900/20',
            inactiveStyles: 'border-white/5 bg-slate-950/30 hover:bg-slate-950/50',
            iconColor: 'text-emerald-400'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-sans">
            <div className="bg-slate-900/90 backdrop-blur-xl w-full md:max-w-xl md:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Yoklama Ekle</h2>
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

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Date & Type Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Tarih</label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">
                                    {format(new Date(date), 'dd MMMM yyyy, EEEE', { locale: tr })}
                                </p>
                            </div>

                            {course.t_hours > 0 && course.u_hours > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 ml-1">Tür</label>
                                    <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange(CourseType.T)}
                                            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${type === CourseType.T
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                                : 'text-slate-400 hover:text-slate-300'}`}
                                        >
                                            Teorik
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange(CourseType.U)}
                                            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${type === CourseType.U
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                                                : 'text-slate-400 hover:text-slate-300'}`}
                                        >
                                            Uygulama
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hours */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Ders Saati</label>
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                required
                                helperText={`Bugünkü ders saati (Varsayılan: ${type === CourseType.T ? course.t_hours : course.u_hours})`}
                            />
                        </div>

                        {/* Status Cards */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Katılım Durumu</label>
                            <div className="grid grid-cols-1 gap-3">
                                {statusCards.map((card) => {
                                    const Icon = card.icon;
                                    const isActive = status === card.value;

                                    return (
                                        <button
                                            key={card.value}
                                            type="button"
                                            onClick={() => setStatus(card.value)}
                                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left ${isActive ? card.activeStyles : card.inactiveStyles
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-slate-950/50 ${isActive ? 'scale-110 shadow-inner' : 'group-hover:scale-105'
                                                }`}>
                                                <Icon className={`w-6 h-6 ${isActive ? card.iconColor : 'text-slate-500'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                                    {card.label}
                                                </h4>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {card.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-shake">
                                <p className="text-sm font-medium text-red-100">{error}</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
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
                        Yoklamayı Kaydet
                    </Button>
                </div>
            </div>
        </div>
    );
}
