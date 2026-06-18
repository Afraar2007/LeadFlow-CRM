import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { LEAD_STATUS_COLORS, PRIORITY_COLORS } from '@/constants';
import type { LeadStatus, Priority } from '@/types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = LEAD_STATUS_COLORS[status] || 'default';

  return (
    <Badge
      variant={color as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'}
      className={cn('capitalize', className)}
    >
      {status.replace(/([A-Z])/g, ' $1').trim()}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority] || 'default';

  return (
    <Badge
      variant={color as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'}
      className={cn('capitalize', className)}
    >
      {priority}
    </Badge>
  );
}