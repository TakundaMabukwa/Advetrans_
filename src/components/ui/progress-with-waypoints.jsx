'use client'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Check, Circle } from 'lucide-react'

export function ProgressWithWaypoints({
    value,
    waypoints,
    className,
    showLabels = true,
    variant = 'default',
}) {
    return (
        <div className={cn('w-full space-y-5 p-3', className)}>
            <div className="relative">
                <Progress value={value} className="h-2" />

                {/* Waypoint markers */}
                <div className="absolute inset-0 flex items-center">
                    {waypoints.map((waypoint, index) => {
                        const isCompleted = waypoint.completed || value >= waypoint.position
                        const isCurrent =
                            waypoint.current ||
                            (value >= waypoint.position - 5 && value < waypoint.position + 5)

                        return (
                            <div
                                key={index}
                                className="absolute flex flex-col items-center"
                                style={{
                                    left: `${waypoint.position}%`,
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                {/* Marker */}
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded-full border-2 bg-background transition-all duration-200',
                                        variant === 'stepped' ? 'h-6 w-6' : 'h-4 w-4',
                                        isCompleted
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : isCurrent
                                                ? 'border-primary bg-background'
                                                : 'border-muted-foreground/30'
                                    )}
                                >
                                    {variant === 'stepped' && isCompleted && (
                                        <Check className="h-3 w-3" />
                                    )}
                                    {variant === 'stepped' && !isCompleted && isCurrent && (
                                        <Circle className="h-2 w-2 fill-current" />
                                    )}
                                </div>

                                {/* Label */}
                                {showLabels && (
                                    <span
                                        className={cn(
                                            'mt-2 text-xs font-medium transition-colors',
                                            isCompleted
                                                ? 'text-primary'
                                                : isCurrent
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                        )}
                                    >
                                        {waypoint.label}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}