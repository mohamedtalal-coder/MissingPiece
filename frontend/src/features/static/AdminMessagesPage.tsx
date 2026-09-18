import React, { useEffect, useState } from 'react';
import { staticApi } from './staticApi';
import { Button } from '../../shared/components/ui/Button';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { useToast } from '../../shared/context/ToastContext';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  createdAt: string;
}

function MessageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading messages">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 rounded-xl animate-shimmer" />
      ))}
    </div>
  );
}

export const AdminMessagesPage: React.FC = () => {
  const toast = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const limit = 10;

  async function fetchMessages(currentPage = 1, currentFilter = filter) {
    try {
      setLoading(true);
      setError(null);
      const params: { page: number; limit: number; status?: string } = { page: currentPage, limit };
      if (currentFilter !== 'all') {
        params.status = currentFilter;
      }
      const data = await staticApi.getContactMessages(params);
      setMessages(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load contact messages', err);
      setError('Failed to load messages');
      toast.showToast({ message: 'Failed to load messages', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages(page, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const handleStatusChange = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    if (pendingId) return;
    setPendingId(id);
    const previous = messages.find((m) => m._id === id)?.status;
    setMessages((msgs) => msgs.map((m) => (m._id === id ? { ...m, status: newStatus } : m)));
    try {
      await staticApi.updateMessageStatus(id, newStatus);
      toast.showToast({ message: `Marked as ${newStatus}`, type: 'success' });
    } catch (err) {
      console.error('Failed to update status', err);
      if (previous) {
        setMessages((msgs) => msgs.map((m) => (m._id === id ? { ...m, status: previous } : m)));
      }
      toast.showToast({ message: 'Failed to update message', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read' | 'resolved') => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8">
        <div>
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
            Client Relations
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
            Customer Messages &amp; Missing Piece Claims
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5 max-w-2xl">
            Review and triage customer inquiries, commission requests, and heirloom replacement claims.
          </p>
        </div>

        <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20 shadow-sm">
          {(['all', 'unread', 'read', 'resolved'] as const).map((f) => (
            <Button
              key={f}
              onClick={() => handleFilterChange(f)}
              variant={filter === f ? 'primary' : 'ghost'}
              size="sm"
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/40 text-error p-4 rounded-md flex items-center justify-between gap-3 mb-6">
          <span>{error}</span>
          <Button type="button" size="sm" onClick={() => fetchMessages(page, filter)}>
            Retry
          </Button>
        </div>
      )}

      {loading && messages.length === 0 ? (
        <MessageSkeleton />
      ) : messages.length === 0 ? (
        <div className="py-24 bg-surface-container-low rounded-xl shadow-sm">
          <EmptyState
            icon="mail"
            title="No Correspondence"
            description="No customer dispatches match the current ledger view."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map((msg) => (
            <div
              key={msg._id}
              role={msg.status === 'unread' ? 'button' : undefined}
              tabIndex={msg.status === 'unread' ? 0 : undefined}
              onClick={() => {
                if (msg.status === 'unread') {
                  handleStatusChange(msg._id, 'read');
                }
              }}
              onKeyDown={(e) => {
                if (msg.status === 'unread' && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleStatusChange(msg._id, 'read');
                }
              }}
              className={`bg-surface-container-low border ${
                msg.status === 'unread'
                  ? 'border-primary/50 shadow-md ring-1 ring-primary/20 cursor-pointer'
                  : 'border-outline-variant/30 shadow-sm'
              } p-space-lg rounded-xl flex flex-col gap-space-md transition-all`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      {msg.subject || 'Unspecified Subject'}
                    </h3>
                    <StatusBadge type="message" status={msg.status} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    From: <span className="font-medium text-on-surface">{msg.name}</span> &lt;{msg.email}&gt;
                  </p>
                </div>

                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider text-right shrink-0">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="bg-surface-container p-space-md rounded-lg border border-outline-variant/10 font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </div>

              <div
                className="flex justify-end gap-3 pt-2 flex-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                {msg.status === 'unread' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={pendingId === msg._id}
                    disabled={!!pendingId}
                    onClick={() => handleStatusChange(msg._id, 'read')}
                  >
                    Mark Read
                  </Button>
                )}
                {msg.status !== 'resolved' && (
                  <Button
                    onClick={() => handleStatusChange(msg._id, 'resolved')}
                    icon="done_all"
                    isLoading={pendingId === msg._id}
                    disabled={!!pendingId}
                  >
                    Archive &amp; Resolve
                  </Button>
                )}
                {msg.status === 'resolved' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange(msg._id, 'read')}
                    isLoading={pendingId === msg._id}
                    disabled={!!pendingId}
                  >
                    Reopen Dispatch
                  </Button>
                )}
                {msg.status === 'read' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange(msg._id, 'unread')}
                    isLoading={pendingId === msg._id}
                    disabled={!!pendingId}
                  >
                    Mark Unread
                  </Button>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6 mt-4 border-t border-surface-container-highest">
              <Button
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                variant="secondary"
              >
                Previous
              </Button>
              <span className="font-label-md text-label-md text-on-surface-variant">
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page === totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;
