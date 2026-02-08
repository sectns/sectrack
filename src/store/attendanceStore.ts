import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, ScheduleSlot, AttendanceLog, AttendanceStatus } from '@/types';

/**
 * Zustand Store for Local State Management
 * 
 * Manages attendance data locally before syncing with Supabase.
 * Provides optimistic updates for better UX.
 */

interface AttendanceStore {
    // State
    courses: Course[];
    scheduleSlots: ScheduleSlot[];
    attendanceLogs: AttendanceLog[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setCourses: (courses: Course[]) => void;
    addCourse: (course: Course) => void;
    updateCourse: (id: string, updates: Partial<Course>) => void;
    deleteCourse: (id: string) => void;

    setScheduleSlots: (slots: ScheduleSlot[]) => void;
    addScheduleSlot: (slot: ScheduleSlot) => void;
    deleteScheduleSlot: (id: string) => void;

    setAttendanceLogs: (logs: AttendanceLog[]) => void;
    addAttendanceLog: (log: AttendanceLog) => void;
    updateAttendanceLog: (id: string, updates: Partial<AttendanceLog>) => void;
    deleteAttendanceLog: (id: string) => void;

    // Optimistic update for attendance status
    markAttendance: (slotId: string, date: string, status: AttendanceStatus) => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearStore: () => void;
}

export const useAttendanceStore = create<AttendanceStore>()(
    persist(
        (set, get) => ({
            // Initial State
            courses: [],
            scheduleSlots: [],
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
                    // Also delete related schedule slots
                    scheduleSlots: state.scheduleSlots.filter((slot) => slot.course_id !== id)
                })),

            // Schedule Slot Actions
            setScheduleSlots: (slots) => set({ scheduleSlots: slots }),

            addScheduleSlot: (slot) =>
                set((state) => ({
                    scheduleSlots: [...state.scheduleSlots, slot]
                })),

            deleteScheduleSlot: (id) =>
                set((state) => ({
                    scheduleSlots: state.scheduleSlots.filter((slot) => slot.id !== id),
                    // Also delete related attendance logs
                    attendanceLogs: state.attendanceLogs.filter((log) => log.slot_id !== id)
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
            markAttendance: (slotId, date, status) => {
                const state = get();
                const existingLog = state.attendanceLogs.find(
                    (log) => log.slot_id === slotId && log.date === date
                );

                if (existingLog) {
                    // Update existing log
                    set((state) => ({
                        attendanceLogs: state.attendanceLogs.map((log) =>
                            log.id === existingLog.id
                                ? { ...log, status, updated_at: new Date().toISOString() }
                                : log
                        )
                    }));
                } else {
                    // Create new log (optimistic - will be replaced with real ID from Supabase)
                    const newLog: AttendanceLog = {
                        id: `temp-${Date.now()}`, // Temporary ID
                        slot_id: slotId,
                        date,
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
                scheduleSlots: [],
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
                scheduleSlots: state.scheduleSlots,
                attendanceLogs: state.attendanceLogs
            })
        }
    )
);
