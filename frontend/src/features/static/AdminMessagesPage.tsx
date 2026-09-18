import React, { useEffect, useState } from 'react';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { staticApi } from './staticApi';
import { Button } from '../../shared/components/ui/Button';

interface ContactMessage {
  _id: string; // From MongoDB normally, using string
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  createdAt: string;
}

export const AdminMessagesPage: React.FC = () => {
  // t removed

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  async function fetchMessages(currentPage = 1, currentFilter = filter) {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (currentFilter !== 'all') {
        params.status = currentFilter;
      }
      const data = await staticApi.getContactMessages(params);
      // Map _id to id if necessary, but we'll use _id for Mongo
      setMessages(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load contact messages', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages(page, filter);
  }, [page, filter]);

  const handleStatusChange = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    try {
      await staticApi.updateMessageStatus(id, newStatus);
      // Update local state without refetching all
      setMessages(msgs => msgs.map(m => m._id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read' | 'resolved') => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-border pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif text-[var(--text-main)]">
              Customer Messages & Missing Piece Claims
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Review and triage customer inquiries.
            </p>
          </div>
          
          <div className="flex gap-2">
            {(['all', 'unread', 'read', 'resolved'] as const).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  filter === f 
                    ? 'bg-primary text-white font-medium' 
                    : 'bg-[var(--bg-card)] border border-border text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-24 space-y-3 bg-[var(--bg-card)] rounded-md border border-border">
            <Mail className="w-10 h-10 text-primary mx-auto opacity-50" />
            <h2 className="text-xl font-serif text-[var(--text-main)]">
              No Messages
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              No customer messages match the current filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-[var(--bg-card)] border ${msg.status === 'unread' ? 'border-primary shadow-sm' : 'border-border'} p-6 rounded-md space-y-4 transition-all`}
                onClick={() => {
                  if (msg.status === 'unread') {
                    handleStatusChange(msg._id, 'read');
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-[var(--text-main)]">
                        {msg.subject || 'No Subject'}
                      </h3>
                      {msg.status === 'unread' && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                          New
                        </span>
                      )}
                      {msg.status === 'resolved' && (
                        <span className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      From: <span className="font-medium text-[var(--text-main)]">{msg.name}</span> &lt;{msg.email}&gt;
                    </p>
                  </div>

                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="bg-[var(--bg-main)] p-4 rounded border border-border text-sm text-[var(--text-main)] whitespace-pre-wrap">
                  {msg.message}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {msg.status !== 'resolved' && (
                    <Button 
                      variant="primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(msg._id, 'resolved');
                      }}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {msg.status === 'resolved' && (
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(msg._id, 'read');
                      }}
                    >
                      Reopen
                    </Button>
                  )}
                  {msg.status === 'read' && (
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(msg._id, 'unread');
                      }}
                    >
                      Mark Unread
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <Button 
                  variant="outline" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-[var(--text-muted)]">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};