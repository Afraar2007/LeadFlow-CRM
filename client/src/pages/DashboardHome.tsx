import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  TrendingUp,
  Target,
  UserPlus,
  Phone,
  Award,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';

export function DashboardHome() {
  const { user } = useAuth();
  const { data, isLoading } = useLeads({ limit: 100 });

  const leads = data?.leads || [];
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
  const wonLeads = leads.filter((l) => l.status === 'Won').length;
  const lostLeads = leads.filter((l) => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const highPriorityLeads = leads.filter((l) => l.priority === 'High').length;

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads.toString(),
      icon: Users,
      description: 'All leads in pipeline',
      trend: `${leads.filter((l) => l.status === 'New').length} new`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'New Leads',
      value: newLeads.toString(),
      icon: UserPlus,
      description: 'Awaiting first contact',
      trend: `${newLeads} uncontacted`,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: Award,
      description: 'Leads converted to won',
      trend: `${wonLeads} won deals`,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'High Priority',
      value: highPriorityLeads.toString(),
      icon: Target,
      description: 'Requires immediate attention',
      trend: `${highPriorityLeads} urgent`,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100 dark:bg-rose-900/30',
    },
    {
      label: 'Contacted',
      value: contactedLeads.toString(),
      icon: Phone,
      description: 'In communication',
      trend: 'Active follow-ups',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Won / Lost',
      value: `${wonLeads} / ${lostLeads}`,
      icon: TrendingUp,
      description: 'Closed deals ratio',
      trend: `${wonLeads + lostLeads > 0 ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) : 0}% win rate`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ];

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your sales pipeline.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.fullName}</p>
                        <p className="text-xs text-muted-foreground">{lead.company || lead.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(lead.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No recent leads</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recent leads will appear here as they come in.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { status: 'New', count: newLeads, color: 'bg-blue-500' },
                  { status: 'Contacted', count: contactedLeads, color: 'bg-amber-500' },
                  { status: 'Qualified', count: leads.filter((l) => l.status === 'Qualified').length, color: 'bg-purple-500' },
                  { status: 'Proposal Sent', count: leads.filter((l) => l.status === 'Proposal Sent').length, color: 'bg-indigo-500' },
                  { status: 'Negotiation', count: leads.filter((l) => l.status === 'Negotiation').length, color: 'bg-orange-500' },
                  { status: 'Won', count: wonLeads, color: 'bg-green-500' },
                  { status: 'Lost', count: lostLeads, color: 'bg-red-500' },
                ].map((stage) => {
                  const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0;
                  return (
                    <div key={stage.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{stage.status}</span>
                        <span className="text-muted-foreground">{stage.count} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}