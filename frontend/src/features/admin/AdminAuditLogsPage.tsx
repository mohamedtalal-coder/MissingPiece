import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { apiClient } from '../../api/client';

export function AdminAuditLogsPage() {
  const toast = useToast();
  const { t, formatDate } = useLanguage();
  const ap = t.adminPanel.auditLogs;
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/audit-logs?page=${currentPage}&limit=20`);
      setLogs(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.showToast({ message: ap.fetchError, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, ap.fetchError]);

  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />
      <div className="flex justify-between items-end pb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{ap.title}</h1>
          <p className="text-on-surface-variant mt-2">{ap.subtitle}</p>
        </div>
        <Button onClick={() => fetchLogs(page)} variant="secondary" icon="refresh">{ap.refresh}</Button>
      </div>

      <div className="bg-surface-container-low rounded-lg shadow-md border border-outline-variant/20 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-on-surface-variant">{ap.loading}</div>
        ) : logs.length > 0 ? (
          <table className="w-full text-start text-body-sm border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                <th className="py-3.5 px-4" scope="col">{ap.colDate}</th>
                <th className="py-3.5 px-4" scope="col">{ap.colAdmin}</th>
                <th className="py-3.5 px-4" scope="col">{ap.colAction}</th>
                <th className="py-3.5 px-4" scope="col">{ap.colResource}</th>
                <th className="py-3.5 px-4" scope="col">{ap.colDetails}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="py-4 px-4 whitespace-nowrap text-on-surface-variant">
                    {formatDate(log.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-4 font-medium">{log.adminId?.email || ap.unknown}</td>
                  <td className="py-4 px-4 font-mono text-xs text-primary">{log.action}</td>
                  <td className="py-4 px-4 text-on-surface-variant">{log.resourceModel} ({log.resourceId})</td>
                  <td className="py-4 px-4">
                    <pre className="text-[10px] overflow-x-auto max-w-[200px] text-on-surface-variant bg-surface-container p-2 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon="history" title={ap.empty} description="" />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-outline-variant/20">
            <Button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="secondary"
            >
              {ap.previous}
            </Button>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {ap.pageOf.replace('{{page}}', String(page)).replace('{{total}}', String(totalPages))}
            </span>
            <Button
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              variant="secondary"
            >
              {ap.next}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
