// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum AttendanceStatus {
    PENDING = 'PENDING',
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    CANCELLED = 'CANCELLED',
    REPORT = 'REPORT'
}

export enum CourseType {
    T = 'T', // Teorik (Theory)
    U = 'U'  // Uygulama (Practice)
}

export enum DayOfWeek {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6
}

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface Profile {
    id: string;
    full_name: string;
    avatar_url?: string;
    last_visit_date: string; // ISO date string
    semester_start?: string; // ISO date string (end is auto-calculated as start + 14 weeks)
    created_at: string;
    updated_at: string;
}



export interface Course {
    id: string;
    user_id: string;
    name: string;
    course_code?: string;
    t_hours: number; // Weekly theory hours
    u_hours: number; // Weekly practice hours
    t_limit_percent: number; // Theory absence limit percentage (default 30)
    u_limit_percent: number; // Practice absence limit percentage (default 20)
    color_code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AttendanceLog {
    id: string;
    course_id: string; // Direct link to course (no more slots)
    date: string; // ISO date string
    type: CourseType; // T or U
    hours: number; // How many hours (flexible, can differ from weekly default)
    status: AttendanceStatus;
    note?: string;
    is_auto_marked: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================


export interface AttendanceCalculation {
    // Theory (T)
    t_total_hours: number;          // Total theory hours in semester (t_hours * 14)
    t_max_absent_hours: number;     // Maximum allowed absent hours (floor)
    t_current_absent_hours: number; // Current absent hours
    t_remaining_hours: number;      // Remaining allowed absent hours
    t_usage_percent: number;        // Percentage of limit used (0-100+)
    t_status: 'safe' | 'warning' | 'danger'; // Color coding

    // Practice (U)
    u_total_hours: number;
    u_max_absent_hours: number;
    u_current_absent_hours: number;
    u_remaining_hours: number;
    u_usage_percent: number;
    u_status: 'safe' | 'warning' | 'danger';

    // Overall
    is_critical: boolean; // True if either T or U is in danger
}

export interface CourseWithStats extends Course {
    calculation: AttendanceCalculation;
    total_classes: number;
    attended_classes: number;
    missed_classes: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CourseFormData {
    name: string;
    course_code?: string;
    t_hours: number;
    u_hours: number;
    t_limit_percent?: number;
    u_limit_percent?: number;
    color_code?: string;
}



export interface AttendanceUpdateData {
    status: AttendanceStatus;
    note?: string;
}

// ============================================================================
// UI TYPES
// ============================================================================



// ============================================================================
// UTILITY TYPES
// ============================================================================

export type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export interface StatusInfo {
    label: string; // Turkish label
    color: StatusColor;
    icon: string; // Lucide icon name
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TOTAL_WEEKS = 14;

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PENDING]: 'Bekliyor',
    [AttendanceStatus.PRESENT]: 'Var',
    [AttendanceStatus.ABSENT]: 'Yok',
    [AttendanceStatus.CANCELLED]: 'İptal/Tatil',
    [AttendanceStatus.REPORT]: 'Raporlu'
};

export const DAY_NAMES: Record<DayOfWeek, string> = {
    [DayOfWeek.SUNDAY]: 'Pazar',
    [DayOfWeek.MONDAY]: 'Pazartesi',
    [DayOfWeek.TUESDAY]: 'Salı',
    [DayOfWeek.WEDNESDAY]: 'Çarşamba',
    [DayOfWeek.THURSDAY]: 'Perşembe',
    [DayOfWeek.FRIDAY]: 'Cuma',
    [DayOfWeek.SATURDAY]: 'Cumartesi'
};

export const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
    [DayOfWeek.SUNDAY]: 'Paz',
    [DayOfWeek.MONDAY]: 'Pzt',
    [DayOfWeek.TUESDAY]: 'Sal',
    [DayOfWeek.WEDNESDAY]: 'Çar',
    [DayOfWeek.THURSDAY]: 'Per',
    [DayOfWeek.FRIDAY]: 'Cum',
    [DayOfWeek.SATURDAY]: 'Cmt'
};
