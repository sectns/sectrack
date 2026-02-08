import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, AttendanceLog, AttendanceStatus, CourseType } from '@/types';

/**
 * Zustand Store for Local State Management
 * 
 * Manages attendance data locally before syncing with Supabase.
 * Provides optimistic updates for better UX.
 */

interface AttendanceStore {
    // State
    courses: Course[];
    attendanceLogs: AttendanceLog[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setCourses: (courses: Course[]) => void;
    addCourse: (course: Course) => void;
    updateCourse: (id: string, updates: Partial<Course>) => void;
    deleteCourse: (id: string) => void;

    setAttendanceLogs: (logs: AttendanceLog[]) => void;
    addAttendanceLog: (log: AttendanceLog) => void;
    updateAttendanceLog: (id: string, updates: Partial<AttendanceLog>) => void;
    deleteAttendanceLog: (id: string) => void;

    // Optimistic update for attendance status
    markAttendance: (courseId: string, date: string, type: CourseType, hours: number, status: AttendanceStatus) => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearStore: () => void;
}

export const useAttendanceStore = create<AttendanceStore>()(
    persist(
        (set, get) => ({
            // Initial State
            courses: [],
            attendanceLogs: [],
            isLoading: false,
            error: null,

            // Course Actions
            setCourses: (courses) => set({ courses }),

            addCourse: (course) =>
                set((state) => ({
                    courses: [...state.courses, course]
                })),

            updateCourse: (id, updates) =>
                set((state) => ({
                    courses: state.courses.map((course) =>
                        course.id === id ? { ...course, ...updates } : course
                    )
                })),

            deleteCourse: (id) =>
                set((state) => ({
                    courses: state.courses.filter((course) => course.id !== id),
                    // Also delete related attendance logs
                    attendanceLogs: state.attendanceLogs.filter((log) => log.course_id !== id)
                })),

            // Attendance Log Actions
            setAttendanceLogs: (logs) => set({ attendanceLogs: logs }),

            addAttendanceLog: (log) =>
                set((state) => ({
                    attendanceLogs: [...state.attendanceLogs, log]
                })),

            updateAttendanceLog: (id, updates) =>
                set((state) => ({
                    attendanceLogs: state.attendanceLogs.map((log) =>
                        log.id === id ? { ...log, ...updates } : log
                    )
                })),

            deleteAttendanceLog: (id) =>
                set((state) => ({
                    attendanceLogs: state.attendanceLogs.filter((log) => log.id !== id)
                })),

            // Optimistic Attendance Marking
            markAttendance: (courseId, date, type, hours, status) => {
                const state = get();
                const existingLog = state.attendanceLogs.find(
                    (log) => log.course_id === courseId && log.date === date && log.type === type
                );

                if (existingLog) {
                    // Update existing log
                    set((state) => ({
                        attendanceLogs: state.attendanceLogs.map((log) =>
                            log.id === existingLog.id
                                ? { ...log, status, hours, updated_at: new Date().toISOString() }
                                : log
                        )
                    }));
                } else {
                    // Create new log (optimistic - will be replaced with real ID from Supabase)
                    const newLog: AttendanceLog = {
                        id: `temp-${Date.now()}`, // Temporary ID
                        course_id: courseId,
                        date,
                        type,
                        hours,
                        status,
                        is_auto_marked: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    set((state) => ({
                        attendanceLogs: [...state.attendanceLogs, newLog]
                    }));
                }
            },

            // Utility Actions
            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            clearStore: () => set({
                courses: [],
                attendanceLogs: [],
                isLoading: false,
                error: null
            })
        }),
        {
            name: 'sectrack-storage', // LocalStorage key
            partialize: (state) => ({
                // Only persist essential data, not loading/error states
                courses: state.courses,
                attendanceLogs: state.attendanceLogs
            })
        }
    )
);
