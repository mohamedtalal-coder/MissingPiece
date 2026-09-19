import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { apiClient } from '../../api/client';

interface FAQ {
  _id: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  category: string;
  status: 'draft' | 'published';
  order: number;
}

interface FAQFormState {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  category: string;
  status: 'draft' | 'published';
  order: number;
}

const EMPTY_FORM: FAQFormState = {
  questionEn: '',
  questionAr: '',
  answerEn: '',
  answerAr: '',
  category: 'General',
  status: 'draft',
  order: 0,
};

export function AdminFAQPage() {
  const toast = useToast();
  const { t } = useLanguage();
  const fq = t.adminPanel.faq;

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FAQFormState>(EMPTY_FORM);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      // Use admin endpoint so we see drafts too
      const { data } = await apiClient.get('/faq/admin/all');
      setFaqs(data.items ?? []);
    } catch {
      toast.showToast({ message: fq.fetchError, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, fq.fetchError]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingId(faq._id);
    setForm({
      questionEn: faq.questionEn,
      questionAr: faq.questionAr,
      answerEn: faq.answerEn,
      answerAr: faq.answerAr,
      category: faq.category,
      status: faq.status,
      order: faq.order,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleFieldChange = (field: keyof FAQFormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.questionEn.trim() || !form.questionAr.trim() || !form.answerEn.trim() || !form.answerAr.trim()) {
      toast.showToast({ message: 'All question and answer fields are required.', type: 'error' });
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await apiClient.put(`/faq/${editingId}`, form);
      } else {
        await apiClient.post('/faq', form);
      }
      toast.showToast({ message: fq.saved, type: 'success' });
      closeModal();
      fetchFaqs();
    } catch {
      toast.showToast({ message: fq.saveError, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!window.confirm(fq.confirmDelete)) return;
    try {
      await apiClient.delete(`/faq/${id}`);
      toast.showToast({ message: fq.deleted, type: 'success' });
      fetchFaqs();
    } catch {
      toast.showToast({ message: fq.deleteError, type: 'error' });
    }
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />
      <div className="flex justify-between items-end pb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{fq.title}</h1>
        </div>
        <Button onClick={openCreate}>{fq.addFaq}</Button>
      </div>

      <div className="bg-surface-container-low rounded-lg shadow-md border border-outline-variant/20 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-on-surface-variant">{fq.loading}</div>
        ) : faqs.length > 0 ? (
          <table className="w-full text-start text-body-sm border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                <th className="py-3.5 px-4" scope="col">{fq.colQuestion}</th>
                <th className="py-3.5 px-4" scope="col">{fq.colCategory}</th>
                <th className="py-3.5 px-4" scope="col">{fq.colStatus}</th>
                <th className="py-3.5 px-4 text-end" scope="col">{fq.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {faqs.map(faq => (
                <tr key={faq._id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="py-4 px-4 font-medium max-w-xs">
                    <div className="truncate">{faq.questionEn}</div>
                    <div className="truncate text-xs text-on-surface-variant mt-0.5" dir="rtl">{faq.questionAr}</div>
                  </td>
                  <td className="py-4 px-4">{faq.category}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${faq.status === 'published' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {faq.status === 'published' ? fq.published : fq.draft}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-end">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(faq)}>{fq.edit}</Button>
                      <Button size="sm" variant="secondary" onClick={() => deleteFaq(faq._id)}>{fq.delete}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon="help_outline" title={fq.empty} description={fq.emptyDesc} />
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-on-surface">{editingId ? fq.editFaq : fq.addFaq}</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* English fields */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">{fq.questionEn}</label>
                <input
                  type="text"
                  value={form.questionEn}
                  onChange={(e) => handleFieldChange('questionEn', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Question in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">{fq.answerEn}</label>
                <textarea
                  value={form.answerEn}
                  onChange={(e) => handleFieldChange('answerEn', e.target.value)}
                  rows={4}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                  placeholder="Answer in English"
                />
              </div>
              {/* Arabic fields */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">{fq.questionAr}</label>
                <input
                  dir="rtl"
                  type="text"
                  value={form.questionAr}
                  onChange={(e) => handleFieldChange('questionAr', e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="السؤال بالعربية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">{fq.answerAr}</label>
                <textarea
                  dir="rtl"
                  value={form.answerAr}
                  onChange={(e) => handleFieldChange('answerAr', e.target.value)}
                  rows={4}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                  placeholder="الإجابة بالعربية"
                />
              </div>
              {/* Meta fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{fq.category}</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{fq.status}</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="draft">{fq.draft}</option>
                    <option value="published">{fq.published}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">{fq.order}</label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => handleFieldChange('order', parseInt(e.target.value, 10) || 0)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal} disabled={saving}>{fq.cancel}</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? '…' : fq.save}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
