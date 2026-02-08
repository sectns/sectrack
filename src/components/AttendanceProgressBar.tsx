interface AttendanceProgressBarProps {
    current: number;
    max: number;
    status: 'safe' | 'warning' | 'danger';
}

export default function AttendanceProgressBar({ current, max, status }: AttendanceProgressBarProps) {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

    const statusClasses = {
        safe: 'progress-safe',
        warning: 'progress-warning',
        danger: 'progress-danger'
    };

    return (
        <div className="progress-bar">
            <div
                className={`progress-fill ${statusClasses[status]}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
