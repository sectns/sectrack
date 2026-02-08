import { useMemo } from 'react';
import { differenceInWeeks, differenceInDays, isAfter, isBefore, startOfDay, addWeeks } from 'date-fns';
import { Profile } from '@/types';

interface SemesterCalculations {
    totalWeeks: number;
    currentWeek: number;
    weeksRemaining: number;
    isCompleted: boolean;
    hasStarted: boolean;
    progressPercent: number;
    daysUntilStart: number; // New: Days remaining until semester starts
    semesterEnd: Date | null; // Auto-calculated end date
}

export function useSemesterCalculations(profile: Profile | null): SemesterCalculations {
    return useMemo(() => {
        const now = startOfDay(new Date());

        // Default values if semester start date not set
        if (!profile?.semester_start) {
            return {
                totalWeeks: 14, // Default fallback
                currentWeek: 0,
                weeksRemaining: 14,
                isCompleted: false,
                hasStarted: false,
                progressPercent: 0,
                daysUntilStart: 0,
                semesterEnd: null,
            };
        }

        const semesterStart = startOfDay(new Date(profile.semester_start));

        // Auto-calculate end date: Start + 14 weeks
        const semesterEnd = addWeeks(semesterStart, 14);
        const totalWeeks = 14; // Fixed to 14 weeks

        // Check if semester has started
        const hasStarted = !isBefore(now, semesterStart);

        // Calculate days until start (if not started)
        const daysUntilStart = hasStarted ? 0 : differenceInDays(semesterStart, now);

        // Check if semester has ended
        const isCompleted = isAfter(now, semesterEnd);

        // Calculate current week (1-indexed, 0 if not started)
        let currentWeek = 0;
        if (hasStarted && !isCompleted) {
            currentWeek = Math.min(
                totalWeeks,
                Math.max(1, differenceInWeeks(now, semesterStart) + 1)
            );
        } else if (isCompleted) {
            currentWeek = totalWeeks;
        }

        // Calculate weeks remaining
        const weeksRemaining = Math.max(0, totalWeeks - currentWeek);

        // Calculate progress percentage (0% if not started)
        let progressPercent = 0;
        if (hasStarted) {
            progressPercent = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));
        }

        return {
            totalWeeks,
            currentWeek,
            weeksRemaining,
            isCompleted,
            hasStarted,
            progressPercent,
            daysUntilStart,
            semesterEnd,
        };
    }, [profile?.semester_start]);
}
