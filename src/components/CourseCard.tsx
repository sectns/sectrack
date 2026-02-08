import { useState } from 'react';
import { Course, AttendanceLog, AttendanceStatus, CourseType } from '@/types';
import { useAttendanceCalculator } from '@/hooks/useAttendanceCalculator';
import { AlertTriangle, Calendar, Settings } from 'lucide-react';
import HealthScoreRing from './HealthScoreRing';
import AddAttendanceModal from './AddAttendanceModal';
import EditCourseModal from './EditCourseModal';
import Button from './ui/Button';

interface CourseCardProps {
    course: Course;
    attendanceLogs: AttendanceLog[];
    totalWeeks: number;
    onAddAttendance: (data: {
        courseId: string;
        date: string;
        type: CourseType;
        hours: number;
        status: AttendanceStatus;
    }) => Promise<void>;
    onUpdateCourse: (courseId: string, data: {
        name: string;
        course_code?: string;
        t_hours: number;
        u_hours: number;
        t_limit_percent: number;
        u_limit_percent: number;
    }) => Promise<void>;
    onDeleteCourse: (courseId: string) => Promise<void>;
    onDeleteLog: (logId: string) => Promise<void>;
}

export default function CourseCard({
    course,
    attendanceLogs,
    totalWeeks,
    onAddAttendance,
    onUpdateCourse,
    onDeleteCourse,
    onDeleteLog
}: CourseCardProps) {
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const calculation = useAttendanceCalculator({
        course,
        attendanceLogs: attendanceLogs.filter(log => log.course_id === course.id),
        totalWeeks
    });

    // Calculate overall health percentage (average of T and U)
    const tHealthPercent = calculation.t_max_absent_hours > 0
        ? ((calculation.t_max_absent_hours - calculation.t_current_absent_hours) / calculation.t_max_absent_hours) * 100
        : 100;
    const uHealthPercent = course.u_hours > 0 && calculation.u_max_absent_hours > 0
        ? ((calculation.u_max_absent_hours - calculation.u_current_absent_hours) / calculation.u_max_absent_hours) * 100
        : 100;

    const handleAddAttendance = async (data: {
        date: string;
        type: CourseType;
        hours: number;
        status: AttendanceStatus;
    }) => {
        await onAddAttendance({
            courseId: course.id,
            ...data
        });
    };

    const handleUpdateCourse = async (data: {
        name: string;
        course_code?: string;
        t_hours: number;
        u_hours: number;
        t_limit_percent: number;
        u_limit_percent: number;
    }) => {
        await onUpdateCourse(course.id, data);
    };

    const handleDeleteCourse = async () => {
        await onDeleteCourse(course.id);
    };

    return (
        <>
            <div className="card-glass group hover:shadow-2xl hover:shadow-emerald-900/10 border-white/5">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            {course.course_code && (
                                <span
                                    className="px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border"
                                    style={{
                                        backgroundColor: `${course.color_code}15`,
                                        color: course.color_code,
                                        borderColor: `${course.color_code}30`
                                    }}
                                >
                                    {course.course_code}
                                </span>
                            )}
                            {calculation.is_critical && (
                                <span className="badge badge-absent flex items-center gap-1.5 py-1 px-3 text-[10px] font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    KRİTİK
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2 leading-tight tracking-tight group-hover:text-emerald-400 transition-colors">
                            {course.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 italic">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-50" />
                                Teorik: {course.t_hours}s
                            </span>
                            {course.u_hours > 0 && (
                                <span className="flex items-center gap-1.5 italic">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-50" />
                                    Uygulama: {course.u_hours}s
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="w-12 h-12 rounded-2xl bg-slate-800/20 hover:bg-slate-800/60 flex items-center justify-center transition-all border border-white/5 hover:border-white/10 group/settings"
                        title="Ders Ayarları"
                    >
                        <Settings className="w-5 h-5 text-slate-500 group-hover/settings:text-white group-hover/settings:rotate-90 transition-all duration-300" />
                    </button>
                </div>

                {/* Health Rings */}
                <div className="flex items-center justify-around py-6 border-y border-slate-800">
                    {/* Theory Ring */}
                    <div className="text-center">
                        <HealthScoreRing
                            percentage={Math.max(0, tHealthPercent)}
                            size={100}
                            strokeWidth={6}
                            status={calculation.t_status}
                        />
                        <p className="text-xs text-slate-400 mt-2 font-medium">Teorik</p>
                        <p className="text-xs text-slate-500">
                            {calculation.t_remaining_hours}/{calculation.t_max_absent_hours} hak
                        </p>
                    </div>

                    {/* Practice Ring (if exists) */}
                    {course.u_hours > 0 && (
                        <div className="text-center">
                            <HealthScoreRing
                                percentage={Math.max(0, uHealthPercent)}
                                size={100}
                                strokeWidth={6}
                                status={calculation.u_status}
                            />
                            <p className="text-xs text-slate-400 mt-2 font-medium">Uygulama</p>
                            <p className="text-xs text-slate-500">
                                {calculation.u_remaining_hours}/{calculation.u_max_absent_hours} hak
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3 rounded-xl bg-slate-800/50">
                        <p className="text-xs text-slate-400 mb-1">Teorik Devamsızlık</p>
                        <p className="text-lg font-bold text-white">
                            {calculation.t_current_absent_hours} saat
                        </p>
                    </div>
                    {course.u_hours > 0 && (
                        <div className="p-3 rounded-xl bg-slate-800/50">
                            <p className="text-xs text-slate-400 mb-1">Uygulama Devamsızlık</p>
                            <p className="text-lg font-bold text-white">
                                {calculation.u_current_absent_hours} saat
                            </p>
                        </div>
                    )}
                </div>

                {/* Total Absence Summary */}
                <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Toplam Devamsızlık</span>
                            <span className="text-2xl font-black text-emerald-400 tracking-tight leading-none">
                                {calculation.t_current_absent_hours + calculation.u_current_absent_hours} <span className="text-xs font-bold opacity-60 ml-0.5">Saat</span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-emerald-400/60" />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        icon={Calendar}
                        onClick={() => setShowAttendanceModal(true)}
                        className="h-14 rounded-2xl shadow-lg shadow-emerald-900/40"
                    >
                        Yoklama Ekle
                    </Button>
                </div>
            </div>

            {/* Attendance Modal */}
            {showAttendanceModal && (
                <AddAttendanceModal
                    isOpen={showAttendanceModal}
                    onClose={() => setShowAttendanceModal(false)}
                    course={course}
                    onSubmit={handleAddAttendance}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <EditCourseModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    course={course}
                    attendanceLogs={attendanceLogs.filter(log => log.course_id === course.id)}
                    onUpdate={handleUpdateCourse}
                    onDelete={handleDeleteCourse}
                    onDeleteLog={onDeleteLog}
                />
            )}
        </>
    );
}
