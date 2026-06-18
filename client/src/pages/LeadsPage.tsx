import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLeads, useCreateLead, useDeleteLead } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Users,
  RefreshCw,
  Download,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Lead, LeadFilters, CreateLeadRequest } from '@/types/lead';
import { LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS, LEAD_SOURCE_OPTIONS } from '@/constants';

const createLeadSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  leadSource: z.string().optional(),
  message: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

interface FiltersState {
  search: string;
  status: string;
  priority: string;
  country: string;
  leadSource: string;
  startDate: string;
  endDate: string;
  page: number;
  sort: string;
}

const COLUMNS = [
  { key: 'fullName', label: 'Name', sortable: true },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'country', label: 'Country', sortable: true },
  { key: 'leadSource', label: 'Source', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'assignedTo', label: 'Assigned To', sortable: false },
  { key: 'createdAt', label: 'Created', sortable: true },
] as const;

export function LeadsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    status: '',
    priority: '',
    country: '',
    leadSource: '',
    startDate: '',
    endDate: '',
    page: 1,
    sort: '-createdAt',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(COLUMNS.map((c) => c.key)));
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const queryFilters: LeadFilters = useMemo(() => {
    const f: LeadFilters = { page: filters.page, limit: 10 };
    if (filters.search) f.search = filters.search;
    if (filters.status) f.status = filters.status as Lead['status'];
    if (filters.priority) f.priority = filters.priority as Lead['priority'];
    if (filters.country) f.country = filters.country;
    if (filters.leadSource) f.leadSource = filters.leadSource;
    if (filters.startDate) f.startDate = filters.startDate;
    if (filters.endDate) f.endDate = filters.endDate;
    if (filters.sort) f.sort = filters.sort;
    return f;
  }, [filters]);

  const { data, isLoading, isError, refetch } = useLeads(queryFilters);
  const createMutation = useCreateLead();
  const deleteMutation = useDeleteLead();

  const leads = data?.leads || [];
  const pagination = data?.pagination;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      country: '',
      leadSource: 'Website',
      message: '',
      status: 'New',
      priority: 'Medium',
    },
  });

  const onCreateSubmit = useCallback(
    async (formData: CreateLeadFormData) => {
      try {
        await createMutation.mutateAsync(formData as CreateLeadRequest);
        setCreateOpen(false);
        reset();
      } catch {
        // Error handled by hook
      }
    },
    [createMutation, reset]
  );

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteMutation]);

  const handleSort = (key: string) => {
    setFilters((prev) => {
      const currentDirection = prev.sort === key ? 'asc' : prev.sort === `-${key}` ? 'desc' : null;
      let newSort: string;
      if (currentDirection === null) {
        newSort = `-${key}`;
      } else if (currentDirection === 'desc') {
        newSort = key;
      } else {
        newSort = '-createdAt';
      }
      return { ...prev, sort: newSort, page: 1 };
    });
  };

  const getSortIcon = (key: string) => {
    if (filters.sort === `-${key}`) return <ChevronDown className="h-3 w-3" />;
    if (filters.sort === key) return <ChevronUp className="h-3 w-3" />;
    return <ChevronsUpDown className="h-3 w-3" />;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      country: '',
      leadSource: '',
      startDate: '',
      endDate: '',
      page: 1,
      sort: '-createdAt',
    });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.country || filters.leadSource || filters.startDate || filters.endDate || filters.search;

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Country', 'Source', 'Priority', 'Status', 'Created'];
    const rows = leads.map((lead) => [
      lead.fullName,
      lead.email,
      lead.phone,
      lead.company,
      lead.country,
      lead.leadSource,
      lead.priority,
      lead.status,
      format(new Date(lead.createdAt), 'yyyy-MM-dd'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage and track your sales leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" {...register('fullName')} className={errors.fullName ? 'border-destructive' : ''} />
                    {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register('phone')} />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" {...register('company')} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register('country')} />
                  </div>
                  <div>
                    <Label htmlFor="leadSource">Lead Source</Label>
                    <select
                      id="leadSource"
                      {...register('leadSource')}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      {LEAD_SOURCE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      {...register('status')}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      {LEAD_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      {...register('priority')}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" {...register('message')} rows={3} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); reset(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Lead
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={filters.search}
            onChange={(v) => setFilters((prev) => ({ ...prev, search: v, page: 1 }))}
            placeholder="Search leads by name, email, company..."
            className="flex-1"
          />
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary">!</span>}
          </Button>
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowColumnMenu(!showColumnMenu)}>
              Columns
            </Button>
            {showColumnMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColumnMenu(false)} />
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-popover p-2 shadow-lg">
                  {COLUMNS.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.key)}
                        onChange={() => {
                          const next = new Set(visibleColumns);
                          if (next.has(col.key)) next.delete(col.key);
                          else next.add(col.key);
                          setVisibleColumns(next);
                        }}
                        className="rounded"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <div>
                  <Label className="text-xs">Status</Label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">All</option>
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value, page: 1 }))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">All</option>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Country</Label>
                  <Input
                    value={filters.country}
                    onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value, page: 1 }))}
                    placeholder="Filter by country"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Source</Label>
                  <select
                    value={filters.leadSource}
                    onChange={(e) => setFilters((prev) => ({ ...prev, leadSource: e.target.value, page: 1 }))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">All</option>
                    {LEAD_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))}
                    className="h-9"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3 gap-2">
                  <X className="h-3 w-3" />
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {pagination ? `${pagination.total} leads found` : 'Loading...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : leads.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No leads found"
              description={hasActiveFilters ? 'Try adjusting your filters.' : 'Create your first lead to get started.'}
              actionLabel={!hasActiveFilters ? 'Add Lead' : undefined}
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.filter((col) => visibleColumns.has(col.key)).map((col) => (
                      <TableHead
                        key={col.key}
                        className={cn(col.sortable && 'cursor-pointer select-none')}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable && getSortIcon(col.key)}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead._id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/dashboard/leads/${lead._id}`)}
                    >
                      {COLUMNS.filter((col) => visibleColumns.has(col.key)).map((col) => (
                        <TableCell key={col.key}>
                          {col.key === 'fullName' && (
                            <span className="font-medium">{lead.fullName}</span>
                          )}
                          {col.key === 'company' && <span>{lead.company || '-'}</span>}
                          {col.key === 'email' && <span className="text-muted-foreground">{lead.email}</span>}
                          {col.key === 'phone' && <span>{lead.phone || '-'}</span>}
                          {col.key === 'country' && <span>{lead.country || '-'}</span>}
                          {col.key === 'leadSource' && <span>{lead.leadSource}</span>}
                          {col.key === 'priority' && <PriorityBadge priority={lead.priority} />}
                          {col.key === 'status' && <StatusBadge status={lead.status} />}
                          {col.key === 'assignedTo' && (
                            <span>{lead.assignedTo?.name || '-'}</span>
                          )}
                          {col.key === 'createdAt' && (
                            <span className="text-muted-foreground text-xs">
                              {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/dashboard/leads/${lead._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/dashboard/leads/${lead._id}?edit=true`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(lead._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action can be undone by an admin."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}