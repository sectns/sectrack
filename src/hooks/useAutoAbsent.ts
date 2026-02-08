import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ScheduleSlot, AttendanceLog, AttendanceStatus } from '@/types';
import { format, parseISO, eachDayOfInterval, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Passive Auto-Absent System
 * 
 * This hook implements the "Lazy Check" mechanism:
 * - No cron jobs or background workers
 * - Checks on dashboard load
 * - Compares current_date with last_visit_date
 * - Marks untracked slots as "Yok Yazıldı (Otomatik)"
 * - User must manually override to "Gittim" if they were present
 */

interface UseAutoAbsentProps {
    userId: string;
    scheduleSlots: ScheduleSlot[];
    existingLogs: AttendanceLog[];
}

interface AutoAbsentResult {
    isChecking: boolean;
    autoMarkedCount: number;
    lastCheckDate: string | null;
}

export const useAutoAbsent = ({
    userId,
    scheduleSlots,
    existingLogs
}: UseAutoAbsentProps): AutoAbsentResult => {
    const [isChecking, setIsChecking] = useState(false);
    const [autoMarkedCount, setAutoMarkedCount] = useState(0);
    const [lastCheckDate, setLastCheckDate] = useState<string | null>(null);

    useEffect(() => {
        const checkAndMarkAbsent = async () => {
            if (!userId || scheduleSlots.length === 0) return;

            setIsChecking(true);

            try {
                // Get user's last visit date
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('last_visit_date')
                    .eq('id', userId)
                    .single();

                if (profileError) throw profileError;

                const lastVisitDate = profile?.last_visit_date
                    ? parseISO(profile.last_visit_date)
                    : new Date();

                const currentDate = new Date();
                setLastCheckDate(format(currentDate, 'yyyy-MM-dd'));

                // If current date is same as last visit, no need to check
                if (format(currentDate, 'yyyy-MM-dd') === format(lastVisitDate, 'yyyy-MM-dd')) {
                    setIsChecking(false);
                    return;
                }

                // Get all dates between last visit and current date
                const datesToCheck = eachDayOfInterval({
                    start: lastVisitDate,
                    end: currentDate
                });

                const logsToCreate: Array<{
                    slot_id: string;
                    date: string;
                    status: AttendanceStatus;
                    is_auto_marked: boolean;
                    note: string;
                }> = [];

                // Check each date
                for (const date of datesToCheck) {
                    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

                    // Find slots for this day
                    const slotsForDay = scheduleSlots.filter(
                        slot => slot.day_of_week === dayOfWeek
                    );

                    for (const slot of slotsForDay) {
                        const dateStr = format(date, 'yyyy-MM-dd');

                        // Check if attendance log already exists for this slot and date
                        const existingLog = existingLogs.find(
                            log => log.slot_id === slot.id && log.date === dateStr
                        );

                        // If no log exists and the date is in the past, mark as auto-absent
                        if (!existingLog && isBefore(date, currentDate)) {
                            logsToCreate.push({
                                slot_id: slot.id,
                                date: dateStr,
                                status: AttendanceStatus.ABSENT,
                                is_auto_marked: true,
                                note: 'Otomatik olarak yok yazıldı'
                            });
                        }
                    }
                }

                // Bulk insert auto-absent logs
                if (logsToCreate.length > 0) {
                    const { error: insertError } = await supabase
                        .from('attendance_logs')
                        .insert(logsToCreate);

                    if (insertError) throw insertError;

                    setAutoMarkedCount(logsToCreate.length);
                }

                // Update last_visit_date to current date
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ last_visit_date: format(currentDate, 'yyyy-MM-dd') })
                    .eq('id', userId);

                if (updateError) throw updateError;

            } catch (error) {
                console.error('Auto-absent check failed:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkAndMarkAbsent();
    }, [userId, scheduleSlots, existingLogs]);

    return {
        isChecking,
        autoMarkedCount,
        lastCheckDate
    };
};

/**
 * Helper function to manually trigger auto-absent check
 * Can be called from a button or on specific user actions
 */
export const triggerAutoAbsentCheck = async (userId: string) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('last_visit_date')
            .eq('id', userId)
            .single();

        if (error) throw error;

        // Force update last_visit_date to trigger re-check
        await supabase
            .from('profiles')
            .update({ last_visit_date: format(new Date(), 'yyyy-MM-dd') })
            .eq('id', userId);

        return true;
    } catch (error) {
        console.error('Manual auto-absent trigger failed:', error);
        return false;
    }
};
