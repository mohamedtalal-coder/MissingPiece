import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { apiClient } from '../../api/client';

const STATUS_OPTIONS = ['', 'pending', 'approved', 'rejected', 'flagged'] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

export function AdminReviewsPage() {
  const toast = useToast();
  const { t } = useLanguage();
  const rv = t.adminPanel.reviews;

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  const fetchReviews = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(currentPage), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await apiClient.get(`/reviews/admin/all?${params.toString()}`);
      setReviews(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.showToast({ message: rv.fetchError, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, rv.fetchError, statusFilter]);

  useEffect(() => {
    fetchReviews(page);
  }, [page, fetchReviews]);

  const updateStatus = async (id: string, status: string) => {
    if (status === 'rejected' && !window.confirm(rv.confirmReject)) return;
    try {
      await apiClient.patch(`/reviews/${id}/status`, { status });
      toast.showToast({ message: rv.markedAs.replace('{{status}}', status), type: 'success' });
      fetchReviews(page);
    } catch {
      toast.showToast({ message: rv.updateError, type: 'error' });
    }
  };

  const pageLabel = rv.pageOf.replace('{{page}}', String(page)).replace('{{total}}', String(totalPages));

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{rv.title}</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
          className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        >
          <option value="">{rv.filterAll}</option>
          <option value="pending">{rv.filterPending}</option>
          <option value="approved">{rv.filterApproved}</option>
          <option value="rejected">{rv.filterRejected}</option>
          <option value="flagged">{rv.filterFlagged}</option>
        </select>
      </div>

      <div className="bg-surface-container-low rounded-lg shadow-md border border-outline-variant/20 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-on-surface-variant">{rv.loading}</div>
        ) : reviews.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-body-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                    <th className="py-3.5 px-4" scope="col">{rv.colProduct}</th>
                    <th className="py-3.5 px-4" scope="col">{rv.colUser}</th>
                    <th className="py-3.5 px-4" scope="col">{rv.colRating}</th>
                    <th className="py-3.5 px-4" scope="col">{rv.colComment}</th>
                    <th className="py-3.5 px-4" scope="col">{rv.colStatus}</th>
                    <th className="py-3.5 px-4 text-end" scope="col">{rv.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  {reviews.map(review => (
                    <tr key={review._id} className="hover:bg-surface-container/60 transition-colors">
                      <td className="py-4 px-4 font-medium">{review.product?.name || rv.unknown}</td>
                      <td className="py-4 px-4">{review.user?.name || rv.unknown}</td>
                      <td className="py-4 px-4">{review.rating} / 5</td>
                      <td className="py-4 px-4 truncate max-w-[200px]">{review.comment}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          review.status === 'approved' ? 'bg-primary-container text-on-primary-container' :
                          review.status === 'rejected' ? 'bg-error-container text-on-error-container' :
                          review.status === 'flagged' ? 'bg-tertiary-container text-on-tertiary-container' :
                          'bg-surface-variant text-on-surface-variant'
                        }`}>
                        {rv[`status${review.status.charAt(0).toUpperCase()}${review.status.slice(1)}` as keyof typeof rv] as string || review.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-end">
                        <div className="flex justify-end gap-2">
                          {review.status !== 'approved' && (
                            <Button size="sm" onClick={() => updateStatus(review._id, 'approved')}>{rv.approve}</Button>
                          )}
                          {review.status !== 'rejected' && (
                            <Button size="sm" variant="secondary" onClick={() => updateStatus(review._id, 'rejected')}>{rv.reject}</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-outline-variant/20">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  {rv.previous}
                </Button>
                <span className="text-sm text-on-surface-variant">{pageLabel}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  {rv.next}
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon="star_rate" title={rv.empty} description="" />
        )}
      </div>
    </div>
  );
}
