import { useMemo } from 'react';
import { Course, AttendanceLog, AttendanceStatus, AttendanceCalculation, TOTAL_WEEKS } from '@/types';

/**
 * The "Brain" of SecTrack - T+U Attendance Calculation Hook
 * 
 * Implements the complex Turkish university attendance rules:
 * - Theory (T): 30% absence limit
 * - Practice (U): 20% absence limit
 * - Uses round() for max absent hours to match OBS system (5.6 → 6)
 * - Color coding: Green (0-50%), Yellow (50-80%), Red (80%+)
 * - NOW SUPPORTS DYNAMIC SEMESTER WEEKS!
 */

interface UseAttendanceCalculatorProps {
    course: Course;
    attendanceLogs: AttendanceLog[];
    totalWeeks?: number; // Dynamic semester weeks (defaults to 14)
}

export const useAttendanceCalculator = ({
    course,
    attendanceLogs,
    totalWeeks = TOTAL_WEEKS
}: UseAttendanceCalculatorProps): AttendanceCalculation => {

    return useMemo(() => {
        // ========================================================================
        // THEORY (T) CALCULATIONS
        // ========================================================================

        const t_total_hours = course.t_hours * totalWeeks;
        const t_max_absent_hours = Math.round(t_total_hours * (course.t_limit_percent / 100));

        // Count only ABSENT status for theory classes
        // CANCELLED and REPORT do NOT count against the limit
        // Now uses the actual hours from each log (flexible tracking)
        const t_current_absent_hours = attendanceLogs
            .filter(log => log.status === AttendanceStatus.ABSENT && log.type === 'T')
            .reduce((sum, log) => sum + log.hours, 0);

        const t_remaining_hours = Math.max(0, t_max_absent_hours - t_current_absent_hours);
        const t_usage_percent = t_max_absent_hours > 0
            ? (t_current_absent_hours / t_max_absent_hours) * 100
            : 0;

        const t_status: 'safe' | 'warning' | 'danger' =
            t_usage_percent >= 80 ? 'danger' :
                t_usage_percent >= 50 ? 'warning' :
                    'safe';

        // ========================================================================
        // PRACTICE (U) CALCULATIONS
        // ========================================================================

        const u_total_hours = course.u_hours * totalWeeks;
        const u_max_absent_hours = Math.round(u_total_hours * (course.u_limit_percent / 100));

        const u_current_absent_hours = attendanceLogs
            .filter(log => log.status === AttendanceStatus.ABSENT && log.type === 'U')
            .reduce((sum, log) => sum + log.hours, 0);


        const u_remaining_hours = Math.max(0, u_max_absent_hours - u_current_absent_hours);
        const u_usage_percent = u_max_absent_hours > 0
            ? (u_current_absent_hours / u_max_absent_hours) * 100
            : 0;

        const u_status: 'safe' | 'warning' | 'danger' =
            u_usage_percent >= 80 ? 'danger' :
                u_usage_percent >= 50 ? 'warning' :
                    'safe';

        // ========================================================================
        // OVERALL STATUS
        // ========================================================================

        const is_critical = t_status === 'danger' || u_status === 'danger';

        return {
            // Theory
            t_total_hours,
            t_max_absent_hours,
            t_current_absent_hours,
            t_remaining_hours,
            t_usage_percent,
            t_status,

            // Practice
            u_total_hours,
            u_max_absent_hours,
            u_current_absent_hours,
            u_remaining_hours,
            u_usage_percent,
            u_status,

            // Overall
            is_critical
        };
    }, [course, attendanceLogs, totalWeeks]);
};

/**
 * Helper function to calculate attendance for a single type (T or U)
 * Can be used independently if needed
 */
export const calculateSingleTypeAttendance = (
    weeklyHours: number,
    limitPercent: number,
    absentCount: number
) => {
    const totalHours = weeklyHours * TOTAL_WEEKS;
    const maxAbsentHours = Math.round(totalHours * (limitPercent / 100));
    const currentAbsentHours = absentCount * weeklyHours;
    const remainingHours = Math.max(0, maxAbsentHours - currentAbsentHours);
    const usagePercent = maxAbsentHours > 0
        ? (currentAbsentHours / maxAbsentHours) * 100
        : 0;

    const status: 'safe' | 'warning' | 'danger' =
        usagePercent >= 80 ? 'danger' :
            usagePercent >= 50 ? 'warning' :
                'safe';

    return {
        totalHours,
        maxAbsentHours,
        currentAbsentHours,
        remainingHours,
        usagePercent,
        status
    };
};
