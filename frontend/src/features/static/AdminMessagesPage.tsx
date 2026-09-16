import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Loader2, Mail } from 'lucide-react';

interface ContactMessage {
  id: string | number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ContactMessage[]>('/admin/messages');
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load contact messages', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090614] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090614] text-purple-100 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="border-b border-purple-900/40 pb-4">
          <h1 className="text-3xl font-serif text-white">Customer Messages</h1>
          <p className="text-xs text-purple-300/70 mt-1">Review inquiries submitted through the contact form</p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-24 space-y-3 bg-purple-950/20 rounded-3xl border border-purple-900/40">
            <Mail className="w-10 h-10 text-purple-400 mx-auto" />
            <h2 className="text-xl font-serif text-white">No messages found</h2>
            <p className="text-xs text-purple-300/70">You have no new customer inquiries.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-purple-950/30 border border-purple-900/50 p-6 rounded-3xl space-y-2">
                <div className="flex justify-between items-center border-b border-purple-900/30 pb-3">
                  <div>
                    <h3 className="text-sm font-medium text-white">{msg.name}</h3>
                    <p className="text-[11px] text-purple-400">{msg.email}</p>
                  </div>
                  <span className="text-[11px] text-purple-300/60">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-purple-200/80 pt-2">{msg.message}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};