import { useState } from 'react';
import { Course, AttendanceLog, AttendanceStatus, CourseType } from '@/types';
import { useAttendanceCalculator } from '@/hooks/useAttendanceCalculator';
import { AlertTriangle, Calendar, Settings } from 'lucide-react';
import HealthScoreRing from './HealthScoreRing';
import AddAttendanceModal from './AddAttendanceModal';
import EditCourseModal from './EditCourseModal';

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
            <div className="card-glass group">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {course.course_code && (
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        backgroundColor: `${course.color_code}20`,
                                        color: course.color_code,
                                        border: `1px solid ${course.color_code}40`
                                    }}
                                >
                                    {course.course_code}
                                </span>
                            )}
                            {calculation.is_critical && (
                                <span className="badge badge-absent flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    KRİTİK
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">
                            {course.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span>Teorik: {course.t_hours} saat</span>
                            {course.u_hours > 0 && (
                                <>
                                    <span>•</span>
                                    <span>Uygulama: {course.u_hours} saat</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center transition-all"
                        title="Ders Ayarları"
                    >
                        <Settings className="w-5 h-5 text-slate-400" />
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
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Toplam Devamsızlık</span>
                        <span className="text-lg font-bold text-emerald-400">
                            {calculation.t_current_absent_hours + calculation.u_current_absent_hours} Saat
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6">
                    <button
                        onClick={() => setShowAttendanceModal(true)}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        Yoklama Ekle
                    </button>
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
