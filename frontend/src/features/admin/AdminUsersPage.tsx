import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { apiClient } from '../../api/client';

interface StepUpPending {
  type: 'status' | 'role';
  userId: string;
  payload: Record<string, unknown>;
}

export function AdminUsersPage() {
  const toast = useToast();
  const { t } = useLanguage();
  const us = t.adminPanel.users;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  // Step-up password confirmation modal
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [stepUpPassword, setStepUpPassword] = useState('');
  const [stepUpPending, setStepUpPending] = useState<StepUpPending | null>(null);
  const [stepUpLoading, setStepUpLoading] = useState(false);

  // Debounce search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 350);
  };

  const fetchUsers = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter !== '') params.set('isActive', statusFilter);

      const { data } = await apiClient.get(`/admin/users?${params.toString()}`);
      setUsers(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.showToast({ message: us.fetchError, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, us.fetchError, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  /** Open the step-up modal instead of directly calling the API. */
  const requestStepUp = (type: 'status' | 'role', userId: string, payload: Record<string, unknown>) => {
    setStepUpPending({ type, userId, payload });
    setStepUpPassword('');
    setStepUpOpen(true);
  };

  const executeStepUp = async () => {
    if (!stepUpPending || !stepUpPassword) return;
    try {
      setStepUpLoading(true);
      const { type, userId, payload } = stepUpPending;
      const endpoint = type === 'status' ? `/admin/users/${userId}/status` : `/admin/users/${userId}/role`;
      await apiClient.patch(endpoint, { ...payload, confirmPassword: stepUpPassword });
      toast.showToast({ message: type === 'status' ? us.statusUpdated : us.roleUpdated, type: 'success' });
      setStepUpOpen(false);
      setStepUpPending(null);
      setStepUpPassword('');
      fetchUsers(page);
    } catch (err: any) {
      const msg = err?.response?.data?.message || (stepUpPending?.type === 'status' ? us.statusUpdateError : us.roleUpdateError);
      toast.showToast({ message: msg, type: 'error' });
    } finally {
      setStepUpLoading(false);
    }
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    const confirmMsg = currentStatus ? us.confirmSuspend : us.confirmReactivate;
    if (!window.confirm(confirmMsg)) return;
    requestStepUp('status', id, { isActive: !currentStatus });
  };

  const updateRole = (id: string, newRole: string, currentRole: string) => {
    if (newRole === currentRole) return;
    const confirmMsg = us.confirmRoleChange.replace('{{role}}', newRole);
    if (!window.confirm(confirmMsg)) return;
    requestStepUp('role', id, { role: newRole });
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter !== '') params.set('isActive', statusFilter);
      const res = await apiClient.get(`/admin/users/export?${params.toString()}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.showToast({ message: us.exportError || 'Export failed', type: 'error' });
    }
  };

  const pageLabel = us.pageOf.replace('{{page}}', String(page)).replace('{{total}}', String(totalPages));

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{us.title}</h1>
        <Button size="sm" variant="secondary" onClick={handleExport}>{us.export}</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder={us.searchPlaceholder}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">{us.filterRole}: {us.all}</option>
          <option value="buyer">{us.roleBuyer}</option>
          <option value="admin">{us.roleAdmin}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">{us.filterStatus}: {us.all}</option>
          <option value="true">{us.statusActive}</option>
          <option value="false">{us.statusSuspended}</option>
        </select>
      </div>

      <div className="bg-surface-container-low rounded-lg shadow-md border border-outline-variant/20 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-on-surface-variant">{us.loading}</div>
          ) : users.length > 0 ? (
            <table className="w-full text-start text-body-sm border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                  <th className="py-3.5 px-4" scope="col">{us.colName}</th>
                  <th className="py-3.5 px-4" scope="col">{us.colEmail}</th>
                  <th className="py-3.5 px-4" scope="col">{us.colRole}</th>
                  <th className="py-3.5 px-4" scope="col">{us.colStatus}</th>
                  <th className="py-3.5 px-4 text-end" scope="col">{us.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-surface-container/60 transition-colors">
                    <td className="py-4 px-4">{user.name}</td>
                    <td className="py-4 px-4 text-on-surface-variant text-sm">{user.email}</td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user._id, e.target.value, user.role)}
                        className="bg-transparent border border-outline-variant rounded p-1 text-sm"
                      >
                        <option value="buyer">{us.roleBuyer}</option>
                        <option value="admin">{us.roleAdmin}</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                        {user.isActive ? us.statusActive : us.statusSuspended}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-end">
                      <Button size="sm" variant="secondary" onClick={() => toggleStatus(user._id, user.isActive)}>
                        {user.isActive ? us.suspend : us.reactivate}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon="group" title={us.empty} description="" />
          )}
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
              {us.previous}
            </Button>
            <span className="text-sm text-on-surface-variant">{pageLabel}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              {us.next}
            </Button>
          </div>
        )}
      </div>

      {/* Step-up password confirmation modal */}
      {stepUpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && !stepUpLoading) setStepUpOpen(false); }}
        >
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="font-headline-md text-on-surface">{us.confirmPassword}</h2>
            <p className="text-sm text-on-surface-variant">
              {us.stepUpDesc || 'This action requires re-entering your admin password for security.'}
            </p>
            <input
              type="password"
              value={stepUpPassword}
              onChange={(e) => setStepUpPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && stepUpPassword) executeStepUp(); }}
              placeholder={us.passwordPlaceholder || 'Enter your password'}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setStepUpOpen(false)} disabled={stepUpLoading}>
                {us.cancel || 'Cancel'}
              </Button>
              <Button onClick={executeStepUp} disabled={!stepUpPassword || stepUpLoading}>
                {stepUpLoading ? '…' : us.confirm || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
