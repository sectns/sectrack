import { useState, useMemo } from 'react';
import { ScheduleSlot, AttendanceLog, AttendanceStatus, DayOfWeek, DAY_NAMES_SHORT } from '@/types';
import { format, startOfWeek, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Ban, FileText } from 'lucide-react';

interface ScheduleGridProps {
    scheduleSlots: ScheduleSlot[];
    attendanceLogs: AttendanceLog[];
    onMarkAttendance: (slotId: string, date: string, status: AttendanceStatus) => void;
}

export default function ScheduleGrid({ scheduleSlots, attendanceLogs, onMarkAttendance }: ScheduleGridProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(() =>
        startOfWeek(new Date(), { locale: tr, weekStartsOn: 1 }) // Monday
    );
    const isMobile = window.innerWidth < 768;

    // Generate week days
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    }, [currentWeekStart]);

    // Get slots for a specific day
    const getSlotsForDay = (dayOfWeek: DayOfWeek) => {
        return scheduleSlots
            .filter(slot => slot.day_of_week === dayOfWeek)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    };

    // Get attendance log for a slot and date
    const getAttendanceLog = (slotId: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return attendanceLogs.find(log => log.slot_id === slotId && log.date === dateStr);
    };

    // Cycle through statuses: null -> PRESENT -> ABSENT -> CANCELLED -> null
    const cycleStatus = (currentStatus?: AttendanceStatus) => {
        if (!currentStatus || currentStatus === AttendanceStatus.PENDING) {
            return AttendanceStatus.PRESENT;
        } else if (currentStatus === AttendanceStatus.PRESENT) {
            return AttendanceStatus.ABSENT;
        } else if (currentStatus === AttendanceStatus.ABSENT) {
            return AttendanceStatus.CANCELLED;
        } else {
            return AttendanceStatus.PENDING;
        }
    };

    // Navigate weeks
    const goToPreviousWeek = () => {
        setCurrentWeekStart(prev => addDays(prev, -7));
    };

    const goToNextWeek = () => {
        setCurrentWeekStart(prev => addDays(prev, 7));
    };

    const goToCurrentWeek = () => {
        setCurrentWeekStart(startOfWeek(new Date(), { locale: tr, weekStartsOn: 1 }));
    };

    // Status icon component
    const StatusIcon = ({ status }: { status: AttendanceStatus }) => {
        switch (status) {
            case AttendanceStatus.PRESENT:
                return <Check className="w-4 h-4 text-emerald-400" />;
            case AttendanceStatus.ABSENT:
                return <X className="w-4 h-4 text-red-400" />;
            case AttendanceStatus.CANCELLED:
                return <Ban className="w-4 h-4 text-slate-400" />;
            case AttendanceStatus.REPORT:
                return <FileText className="w-4 h-4 text-blue-400" />;
            default:
                return <div className="w-4 h-4 rounded-full bg-slate-600/30" />;
        }
    };

    // Mobile view - Today's classes
    if (isMobile) {
        const today = new Date();
        const todaySlots = getSlotsForDay(today.getDay() as DayOfWeek);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Bugünün Dersleri
                    </h2>
                    <span className="text-slate-400 text-sm">
                        {format(today, 'dd MMMM yyyy', { locale: tr })}
                    </span>
                </div>

                {todaySlots.length === 0 ? (
                    <div className="card-glass text-center py-12">
                        <Calendar className="w-12 h-12 text-emerald-400/30 mx-auto mb-3" />
                        <p className="text-slate-400">Bugün ders yok</p>
                    </div>
                ) : (
                    todaySlots.map(slot => {
                        const log = getAttendanceLog(slot.id, today);
                        return (
                            <div key={slot.id} className="card-glass">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-white font-semibold">
                                                {slot.start_time} - {slot.end_time}
                                            </span>
                                            <span className={`badge ${slot.type === 'T' ? 'badge-present' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>
                                                {slot.type === 'T' ? 'TEORİK' : 'UYGULAMA'}
                                            </span>
                                        </div>
                                    </div>
                                    <StatusIcon status={log?.status || AttendanceStatus.PENDING} />
                                </div>

                                {/* Quick action buttons */}
                                <div className="grid grid-cols-4 gap-2">
                                    <button
                                        onClick={() => onMarkAttendance(slot.id, format(today, 'yyyy-MM-dd'), AttendanceStatus.PRESENT)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ripple ${log?.status === AttendanceStatus.PRESENT
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                                            }`}
                                    >
                                        VAR
                                    </button>
                                    <button
                                        onClick={() => onMarkAttendance(slot.id, format(today, 'yyyy-MM-dd'), AttendanceStatus.ABSENT)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ripple ${log?.status === AttendanceStatus.ABSENT
                                                ? 'bg-red-500 text-white'
                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                                            }`}
                                    >
                                        YOK
                                    </button>
                                    <button
                                        onClick={() => onMarkAttendance(slot.id, format(today, 'yyyy-MM-dd'), AttendanceStatus.CANCELLED)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ripple ${log?.status === AttendanceStatus.CANCELLED
                                                ? 'bg-slate-500 text-white'
                                                : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/30'
                                            }`}
                                    >
                                        İPTAL
                                    </button>
                                    <button
                                        onClick={() => onMarkAttendance(slot.id, format(today, 'yyyy-MM-dd'), AttendanceStatus.REPORT)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ripple ${log?.status === AttendanceStatus.REPORT
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                                            }`}
                                    >
                                        RAPOR
                                    </button>
                                </div>

                                {log?.is_auto_marked && (
                                    <p className="text-red-400/70 text-xs mt-3 flex items-center gap-1">
                                        <span>⚠</span> Otomatik işaretlendi
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        );
    }

    // Desktop view - Full weekly grid
    return (
        <div className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                    Haftalık Program
                </h2>
                <div className="flex items-center gap-3">
                    <button onClick={goToPreviousWeek} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-emerald-400" />
                    </button>
                    <button onClick={goToCurrentWeek} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-sm text-emerald-400 transition-colors border border-emerald-500/30">
                        Bu Hafta
                    </button>
                    <span className="text-slate-400 text-sm px-4">
                        {format(weekDays[0], 'dd MMM', { locale: tr })} - {format(weekDays[6], 'dd MMM yyyy', { locale: tr })}
                    </span>
                    <button onClick={goToNextWeek} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-emerald-400" />
                    </button>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="card-glass overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="px-4 py-3 text-left text-emerald-400 font-semibold text-sm">SAAT</th>
                            {weekDays.map((day, idx) => (
                                <th key={idx} className="px-4 py-3 text-center text-emerald-400 font-semibold text-sm">
                                    <div>{DAY_NAMES_SHORT[day.getDay() as DayOfWeek]}</div>
                                    <div className="text-xs text-slate-400 font-normal">{format(day, 'dd/MM')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Generate time slots (8:00 - 18:00) */}
                        {Array.from({ length: 10 }, (_, i) => {
                            const hour = 8 + i;
                            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;

                            return (
                                <tr key={timeSlot} className="border-b border-slate-800/50">
                                    <td className="px-4 py-3 text-slate-400 text-sm">
                                        {timeSlot}
                                    </td>
                                    {weekDays.map((day, dayIdx) => {
                                        const dayOfWeek = day.getDay() as DayOfWeek;
                                        const slotsForDay = getSlotsForDay(dayOfWeek);
                                        const slotAtTime = slotsForDay.find(slot =>
                                            slot.start_time.startsWith(timeSlot.substring(0, 2))
                                        );

                                        if (!slotAtTime) {
                                            return <td key={dayIdx} className="px-2 py-3 bg-slate-900/30" />;
                                        }

                                        const log = getAttendanceLog(slotAtTime.id, day);
                                        const statusColor =
                                            log?.status === AttendanceStatus.PRESENT ? 'bg-emerald-500/20 border-emerald-500/50' :
                                                log?.status === AttendanceStatus.ABSENT ? 'bg-red-500/20 border-red-500/50' :
                                                    log?.status === AttendanceStatus.CANCELLED ? 'bg-slate-500/20 border-slate-500/50' :
                                                        log?.status === AttendanceStatus.REPORT ? 'bg-blue-500/20 border-blue-500/50' :
                                                            'bg-slate-700/10 border-slate-700/30';

                                        return (
                                            <td key={dayIdx} className="px-2 py-3">
                                                <div
                                                    className={`border rounded-lg p-2 ${statusColor} cursor-pointer hover:opacity-80 transition-all ripple`}
                                                    onClick={() => {
                                                        const nextStatus = cycleStatus(log?.status);
                                                        onMarkAttendance(slotAtTime.id, format(day, 'yyyy-MM-dd'), nextStatus);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${slotAtTime.type === 'T' ? 'bg-emerald-500/30 text-emerald-400' : 'bg-blue-500/30 text-blue-400'
                                                            }`}>
                                                            {slotAtTime.type}
                                                        </span>
                                                        <StatusIcon status={log?.status || AttendanceStatus.PENDING} />
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        {slotAtTime.start_time} - {slotAtTime.end_time}
                                                    </p>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-400">Var</span>
                </div>
                <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400" />
                    <span className="text-slate-400">Yok</span>
                </div>
                <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">İptal/Tatil</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400">Raporlu</span>
                </div>
                <div className="text-slate-500 text-xs ml-auto">
                    💡 Tıklayarak durumu değiştir
                </div>
            </div>
        </div>
    );
}
