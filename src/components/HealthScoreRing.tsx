interface HealthScoreRingProps {
    percentage: number; // 0-100
    size?: number; // diameter in pixels
    strokeWidth?: number;
    status: 'safe' | 'warning' | 'danger';
    label?: string;
}

export default function HealthScoreRing({
    percentage,
    size = 120,
    strokeWidth = 8,
    status,
    label
}: HealthScoreRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Color based on status
    const colors = {
        safe: {
            stroke: '#34d399',
            glow: 'rgba(52, 211, 153, 0.3)',
            text: '#34d399'
        },
        warning: {
            stroke: '#fb923c',
            glow: 'rgba(251, 146, 60, 0.3)',
            text: '#fb923c'
        },
        danger: {
            stroke: '#f87171',
            glow: 'rgba(248, 113, 113, 0.3)',
            text: '#f87171'
        }
    };

    const color = colors[status];

    return (
        <div className="health-ring" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgb(51 65 85 / 0.3)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color.stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease-out',
                        filter: `drop-shadow(0 0 6px ${color.glow})`
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="text-2xl font-bold"
                    style={{ color: color.text }}
                >
                    {Math.round(percentage)}%
                </span>
                {label && (
                    <span className="text-xs text-slate-400 mt-1">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}
