import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { apiClient } from '../../api/client';

interface Discount {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  validFrom: string;
  validTo: string;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
}

interface DiscountForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  validFrom: string;
  validTo: string;
  maxUses: string;
}

const EMPTY_FORM: DiscountForm = {
  code: '',
  type: 'percentage',
  value: 10,
  validFrom: '',
  validTo: '',
  maxUses: '',
};

function formatDateInput(isoStr: string): string {
  if (!isoStr) return '';
  return isoStr.split('T')[0] ?? '';
}

export function AdminDiscountsPage() {
  const toast = useToast();
  const { t, formatDate } = useLanguage();
  const dc = t.adminPanel.discounts;

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountForm>(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDiscounts = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/discounts?page=${currentPage}&limit=20`);
      setDiscounts(data.items ?? data.discounts ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.showToast({ message: dc.fetchError, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, dc.fetchError]);

  useEffect(() => {
    fetchDiscounts(page);
  }, [page, fetchDiscounts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (d: Discount) => {
    setEditingId(d._id);
    setForm({
      code: d.code,
      type: d.type,
      value: d.value,
      validFrom: formatDateInput(d.validFrom),
      validTo: formatDateInput(d.validTo),
      maxUses: d.maxUses !== undefined ? String(d.maxUses) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.validFrom || !form.validTo || form.value <= 0) {
      toast.showToast({ message: 'Code, dates, and a positive value are required.', type: 'error' });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        validFrom: form.validFrom,
        validTo: form.validTo,
        ...(form.maxUses ? { maxUses: parseInt(form.maxUses, 10) } : {}),
      };
      if (editingId) {
        await apiClient.patch(`/discounts/${editingId}`, payload);
      } else {
        await apiClient.post('/discounts', payload);
      }
      toast.showToast({ message: dc.saved, type: 'success' });
      closeModal();
      fetchDiscounts(page);
    } catch (err: any) {
      const msg = err?.response?.data?.message || dc.saveError;
      toast.showToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(dc.confirmDelete)) return;
    try {
      await apiClient.delete(`/discounts/${id}`);
      toast.showToast({ message: dc.deleted, type: 'success' });
      fetchDiscounts(page);
    } catch {
      toast.showToast({ message: dc.saveError, type: 'error' });
    }
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />
      <div className="flex justify-between items-end pb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{dc.title}</h1>
        <Button onClick={openCreate}>{dc.add}</Button>
      </div>

      <div className="bg-surface-container-low rounded-lg shadow-md border border-outline-variant/20 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-on-surface-variant">{dc.loading}</div>
        ) : discounts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-body-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                    <th className="py-3.5 px-4" scope="col">{dc.code}</th>
                    <th className="py-3.5 px-4" scope="col">{dc.type}</th>
                    <th className="py-3.5 px-4" scope="col">{dc.value}</th>
                    <th className="py-3.5 px-4" scope="col">{dc.validFrom}</th>
                    <th className="py-3.5 px-4" scope="col">{dc.validTo}</th>
                    <th className="py-3.5 px-4" scope="col">{dc.maxUses}</th>
                    <th className="py-3.5 px-4" scope="col">{dc.active}</th>
                    <th className="py-3.5 px-4 text-end" scope="col">{dc.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  {discounts.map(d => (
                    <tr key={d._id} className="hover:bg-surface-container/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-medium">{d.code}</td>
                      <td className="py-4 px-4">{d.type === 'percentage' ? dc.percentage : dc.fixed}</td>
                      <td className="py-4 px-4">{d.type === 'percentage' ? `${d.value}%` : `${d.value}`}</td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">{formatDate(d.validFrom)}</td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">{formatDate(d.validTo)}</td>
                      <td className="py-4 px-4">{d.maxUses ?? '∞'} (used: {d.usedCount ?? 0})</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${d.isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-end">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEdit(d)}>{dc.save === 'Save' ? 'Edit' : dc.save}</Button>
                          <Button size="sm" variant="secondary" onClick={() => handleDelete(d._id)}>{dc.delete}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-outline-variant/20">
                <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                  Previous
                </Button>
                <span className="text-sm text-on-surface-variant">Page {page} of {totalPages}</span>
                <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon="sell" title={dc.empty} description="" />
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-on-surface">{editingId ? 'Edit Discount' : dc.add}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">{dc.code}</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER20"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  disabled={!!editingId}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{dc.type}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="percentage">{dc.percentage}</option>
                    <option value="fixed">{dc.fixed}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    {dc.value} {form.type === 'percentage' ? '(%)' : ''}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={form.type === 'percentage' ? 100 : undefined}
                    value={form.value}
                    onChange={(e) => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{dc.validFrom}</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm(f => ({ ...f, validFrom: e.target.value }))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{dc.validTo}</label>
                  <input
                    type="date"
                    value={form.validTo}
                    onChange={(e) => setForm(f => ({ ...f, validTo: e.target.value }))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">{dc.maxUses} (leave blank for unlimited)</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={(e) => setForm(f => ({ ...f, maxUses: e.target.value }))}
                  placeholder="∞"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal} disabled={saving}>{dc.cancel}</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? '…' : dc.save}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
