import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useSemesterCalculations } from '@/hooks/useSemesterCalculations';
import { LogOut, Plus, Settings as SettingsIcon, Calendar as CalendarIcon, Clock } from 'lucide-react';
import CourseCard from './CourseCard';
import CourseForm from './CourseForm';
import SemesterSettingsModal from './SemesterSettingsModal';
import MobileBottomNav from './MobileBottomNav';
import { CourseFormData, AttendanceStatus, Profile, CourseType } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';


interface DashboardProps {
    user: User;
}

export default function Dashboard({ user }: DashboardProps) {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [showSemesterSettings, setShowSemesterSettings] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'settings'>('dashboard');

    const { courses, attendanceLogs, setCourses, setAttendanceLogs, addCourse, addAttendanceLog } = useAttendanceStore();

    // Semester calculations
    const semester = useSemesterCalculations(profile);

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // Show semester settings if not configured
            if (!profileData.semester_start) {
                setShowSemesterSettings(true);
            }

            // Load courses
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true);

            if (coursesError) throw coursesError;
            setCourses(coursesData || []);

            // Load attendance logs
            const { data: logsData, error: logsError } = await supabase
                .from('attendance_logs')
                .select('*')
                .in('course_id', (coursesData || []).map(c => c.id));

            if (logsError) throw logsError;
            setAttendanceLogs(logsData || []);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleCreateCourse = async (data: CourseFormData) => {
        try {
            const { data: newCourse, error } = await supabase
                .from('courses')
                .insert([{
                    user_id: user.id,
                    ...data
                }])
                .select()
                .single();

            if (error) throw error;

            addCourse(newCourse);
            setShowCourseForm(false);
            await loadData();
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    };

    const handleSaveSemesterSettings = async (startDate: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    semester_start: startDate
                })
                .eq('id', user.id);

            if (error) throw error;

            // Reload profile
            await loadData();
        } catch (error) {
            console.error('Error saving semester settings:', error);
            throw error;
        }
    };

    const handleAddAttendance = async (data: {
        courseId: string;
        date: string;
        type: CourseType;
        hours: number;
        status: AttendanceStatus;
    }) => {
        try {
            const { data: newLog, error } = await supabase
                .from('attendance_logs')
                .insert([{
                    course_id: data.courseId,
                    date: data.date,
                    type: data.type,
                    hours: data.hours,
                    status: data.status,
                    is_auto_marked: false
                }])
                .select()
                .single();

            if (error) throw error;

            addAttendanceLog(newLog);
        } catch (error) {
            console.error('Error adding attendance:', error);
            throw error;
        }
    };

    const handleUpdateCourse = async (courseId: string, data: {
        name: string;
        course_code?: string;
        t_hours: number;
        u_hours: number;
        t_limit_percent: number;
        u_limit_percent: number;
    }) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update(data)
                .eq('id', courseId);

            if (error) throw error;

            // Reload data
            await loadData();
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            // Reload data
            await loadData();
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    };

    const handleDeleteLog = async (logId: string) => {
        try {
            const { error } = await supabase
                .from('attendance_logs')
                .delete()
                .eq('id', logId);

            if (error) throw error;

            // Reload data
            await loadData();
        } catch (error) {
            console.error('Error deleting log:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Veriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (activeTab === 'settings') {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="card-glass">
                        <h2 className="text-2xl font-bold text-white mb-6">Ayarlar</h2>

                        <div className="space-y-4">
                            <button
                                onClick={() => setShowSemesterSettings(true)}
                                className="w-full btn-secondary text-left flex items-center justify-between"
                            >
                                <span>Dönem Tarihini Düzenle</span>
                                <SettingsIcon className="w-5 h-5" />
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full btn-secondary text-left flex items-center justify-between text-red-400 border-red-500/30 hover:bg-red-500/10"
                            >
                                <span>Çıkış Yap</span>
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Dashboard view
        return (
            <>
                {courses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Henüz Ders Eklenmedi
                        </h2>
                        <p className="text-slate-400 mb-8">
                            Yoklama takibine başlamak için ilk dersini ekle
                        </p>
                        <button
                            onClick={() => setShowCourseForm(true)}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            İlk Dersini Ekle
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Course Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    attendanceLogs={attendanceLogs}
                                    totalWeeks={semester.totalWeeks}
                                    onAddAttendance={handleAddAttendance}
                                    onUpdateCourse={handleUpdateCourse}
                                    onDeleteCourse={handleDeleteCourse}
                                    onDeleteLog={handleDeleteLog}
                                />
                            ))}
                        </div>

                        {/* Add Course Button */}
                        <div className="text-center">
                            <button
                                onClick={() => setShowCourseForm(true)}
                                className="btn-secondary inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Yeni Ders Ekle
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen pb-20 md:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 mb-8">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center glow-emerald">
                                <span className="text-lg font-bold text-white">ST</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    SecTrack
                                </h1>
                                <p className="text-xs text-slate-400">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={() => setShowSemesterSettings(true)}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <SettingsIcon className="w-4 h-4" />
                                Dönem
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Çıkış
                            </button>
                        </div>
                    </div>

                    {/* Semester Progress */}
                    {profile?.semester_start && (
                        <div className="mt-4">
                            {!semester.hasStarted ? (
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-blue-400" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-400">
                                                Dönem Başlamadı
                                            </p>
                                            <p className="text-xs text-blue-400/70">
                                                Kalan: {semester.daysUntilStart} gün ({format(new Date(profile.semester_start), 'dd MMMM yyyy', { locale: tr })})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : semester.isCompleted ? (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-sm text-emerald-400 font-medium">
                                        🎉 Dönem Tamamlandı!
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-emerald-400">
                                            {semester.currentWeek}. Hafta / {semester.totalWeeks} Hafta
                                        </span>
                                        <span className="text-xs text-emerald-400/70">
                                            %{semester.progressPercent} tamamlandı
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                                            style={{ width: `${semester.progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4">
                {renderContent()}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Modals */}
            {showCourseForm && (
                <CourseForm
                    onSubmit={handleCreateCourse}
                    onCancel={() => setShowCourseForm(false)}
                />
            )}

            {showSemesterSettings && (
                <SemesterSettingsModal
                    isOpen={showSemesterSettings}
                    onClose={() => setShowSemesterSettings(false)}
                    onSave={handleSaveSemesterSettings}
                    currentStart={profile?.semester_start}
                />
            )}
        </div>
    );
}
