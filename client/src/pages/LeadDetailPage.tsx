import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLead, useUpdateLead, useUpdateLeadStatus, useDeleteLead, useRestoreLead, usePermanentDeleteLead } from '@/hooks/useLeads';
import { useNotes, useCreateNote, useDeleteNote, useUpdateNote } from '@/hooks/useNotes';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  RotateCcw,
  AlertTriangle,
  MessageSquare,
  Send,
  Edit3,
  X,
  Mail,
  Phone,
  Building2,
  Globe,
  User,
  Clock,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS, LEAD_SOURCE_OPTIONS } from '@/constants';
import type { LeadStatus, Priority, LeadSource } from '@/types/lead';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const { data: lead, isLoading, isError, refetch } = useLead(id || '');
  const updateMutation = useUpdateLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const deleteMutation = useDeleteLead();
  const restoreMutation = useRestoreLead();
  const permanentDeleteMutation = usePermanentDeleteLead();

  const { data: notes, isLoading: notesLoading } = useNotes(id || '');

  // Edit dialog
  const [editOpen, setEditOpen] = useState(() => searchParams.get('edit') === 'true');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');

  // Delete/restore dialogs
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const [noteDeleteId, setNoteDeleteId] = useState<string | null>(null);

  const handleEditOpen = () => {
    if (lead) {
      setEditName(lead.fullName);
      setEditEmail(lead.email);
      setEditPhone(lead.phone || '');
      setEditCompany(lead.company || '');
      setEditCountry(lead.country || '');
      setEditSource(lead.leadSource);
      setEditMessage(lead.message || '');
      setEditStatus(lead.status);
      setEditPriority(lead.priority);
    }
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          fullName: editName,
          email: editEmail,
          phone: editPhone || undefined,
          company: editCompany || undefined,
          country: editCountry || undefined,
          leadSource: editSource as LeadSource,
          message: editMessage || undefined,
          status: editStatus as LeadStatus,
          priority: editPriority as Priority,
        },
      });
      setEditOpen(false);
    } catch {
      // handled by hook
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({ id, data: { status: newStatus } });
    } catch {
      // handled by hook
    }
  };

  const handleAddNote = async () => {
    if (!id || !newNote.trim()) return;
    try {
      await createNoteMutation.mutateAsync({ leadId: id, data: { text: newNote.trim() } });
      setNewNote('');
    } catch {
      // handled by hook
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!id || !editingNoteText.trim()) return;
    try {
      await updateNoteMutation.mutateAsync({ leadId: id, noteId, data: { text: editingNoteText.trim() } });
      setEditingNoteId(null);
      setEditingNoteText('');
    } catch {
      // handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Lead not found</h2>
        <p className="text-muted-foreground mt-2">The lead you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/dashboard/leads')} className="mt-4">Back to Leads</Button>
      </div>
    );
  }

  const noteList = Array.isArray(notes) ? notes : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/leads')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{lead.fullName}</h1>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Created {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
              {lead.assignedTo && (
                <>
                  <span className="mx-1">•</span>
                  <User className="h-3 w-3" />
                  Assigned to {lead.assignedTo.name}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.status !== 'Won' && lead.status !== 'Lost' && (
            <div className="flex items-center gap-1">
              {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s as LeadStatus)}
                  className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                    lead.status === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  {s === 'Proposal Sent' ? 'Proposal' : s}
                </button>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleEditOpen} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          {isAdmin && lead.isDeleted ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setRestoreOpen(true)} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Restore
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setPermanentDeleteOpen(true)} className="gap-2">
                <AlertTriangle className="h-4 w-4" /> Delete Forever
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Lead Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Full Name</dt>
                  <dd className="text-sm font-medium mt-0.5">{lead.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="text-sm mt-0.5 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {lead.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="text-sm mt-0.5 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {lead.phone || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Company</dt>
                  <dd className="text-sm mt-0.5 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {lead.company || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Country</dt>
                  <dd className="text-sm mt-0.5 flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {lead.country || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Lead Source</dt>
                  <dd className="text-sm mt-0.5">{lead.leadSource}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Created By</dt>
                  <dd className="text-sm mt-0.5">{lead.createdBy?.name || 'System'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Created At</dt>
                  <dd className="text-sm mt-0.5">{format(new Date(lead.createdAt), 'MMM d, yyyy h:mm a')}</dd>
                </div>
                {lead.message && (
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Message</dt>
                    <dd className="text-sm mt-0.5">{lead.message}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Notes / Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Notes & Activity</span>
                <span className="text-sm font-normal text-muted-foreground">{noteList.length} notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Note */}
              <div className="flex gap-2 mb-6">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || createNoteMutation.isPending}
                  className="self-end"
                >
                  {createNoteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Notes list */}
              {notesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : noteList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No notes yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add the first note to this lead.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {noteList.map((note) => (
                    <div
                      key={note._id}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                    >
                      {editingNoteId === note._id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setEditingNoteId(null)}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditNote(note._id)}
                              disabled={!editingNoteText.trim()}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-sm font-medium">{note.author?.name || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingNoteId(note._id);
                                  setEditingNoteText(note.text);
                                }}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setNoteDeleteId(note._id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status Details */}
          <Card>
            <CardHeader>
              <CardTitle>Status Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Current Status</Label>
                <div className="mt-1">
                  <StatusBadge status={lead.status} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <div className="mt-1">
                  <PriorityBadge priority={lead.priority} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Lead Source</Label>
                <p className="text-sm mt-1">{lead.leadSource}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Notes Count</Label>
                <p className="text-sm mt-1">{lead.notesCount || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Assigned User */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{lead.assignedTo?.name || 'Unassigned'}</p>
                  <p className="text-xs text-muted-foreground">{lead.assignedTo?.email || 'No assignee'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleEditOpen}>
                <Pencil className="h-4 w-4" /> Edit Lead
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a href={`mailto:${lead.email}`}>
                  <Mail className="h-4 w-4" /> Send Email
                </a>
              </Button>
              {lead.phone && (
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href={`tel:${lead.phone}`}>
                    <Phone className="h-4 w-4" /> Call {lead.phone}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Input id="edit-company" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input id="edit-country" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-source">Lead Source</Label>
                <select id="edit-source" value={editSource} onChange={(e) => setEditSource(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  {LEAD_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select id="edit-status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  {LEAD_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <select id="edit-priority" value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-message">Message</Label>
              <Textarea id="edit-message" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Lead"
        description="Are you sure you want to soft-delete this lead? It can be restored by an admin."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (id) await deleteMutation.mutateAsync(id);
          navigate('/dashboard/leads');
        }}
      />
      <ConfirmationDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        title="Restore Lead"
        description="Restore this soft-deleted lead and its associated notes?"
        confirmLabel="Restore"
        onConfirm={async () => { if (id) { await restoreMutation.mutateAsync(id); refetch(); } }}
      />
      <ConfirmationDialog
        open={permanentDeleteOpen}
        onOpenChange={setPermanentDeleteOpen}
        title="Permanently Delete"
        description="This action cannot be undone. All associated notes will also be permanently deleted."
        confirmLabel="Delete Forever"
        variant="destructive"
        onConfirm={async () => {
          if (id) await permanentDeleteMutation.mutateAsync(id);
          navigate('/dashboard/leads');
        }}
      />
      <ConfirmationDialog
        open={!!noteDeleteId}
        onOpenChange={(open) => !open && setNoteDeleteId(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (id && noteDeleteId) {
            await deleteNoteMutation.mutateAsync({ leadId: id, noteId: noteDeleteId });
            setNoteDeleteId(null);
          }
        }}
      />
    </div>
  );
}