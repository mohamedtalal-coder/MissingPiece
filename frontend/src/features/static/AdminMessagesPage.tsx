import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Loader2, Mail } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

interface ContactMessage {
  id: string | number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export const AdminMessagesPage: React.FC = () => {
  const { t } = useLanguage();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMessages() {
    try {
      setLoading(true);

      const response = await apiClient.get<ContactMessage[]>(
        '/admin/messages'
      );

      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load contact messages', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-border pb-4">
          <h1 className="text-3xl font-serif text-[var(--text-main)]">
            {t.adminMessages.title}
          </h1>

          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t.adminMessages.subtitle}
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-24 space-y-3 bg-[var(--bg-card)] rounded-md border border-border">
            <Mail className="w-10 h-10 text-primary mx-auto" />

            <h2 className="text-xl font-serif text-[var(--text-main)]">
              {t.adminMessages.noMessages}
            </h2>

            <p className="text-xs text-[var(--text-muted)]">
              {t.adminMessages.noMessagesDescription}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-[var(--bg-card)] border border-border p-6 rounded-md space-y-2"
              >
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-main)]">
                      {msg.name}
                    </h3>

                    <p className="text-[11px] text-primary">
                      {msg.email}
                    </p>
                  </div>

                  <span className="text-[11px] text-[var(--text-muted)]">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)] pt-2">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};