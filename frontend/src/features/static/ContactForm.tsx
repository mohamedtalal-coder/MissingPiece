import React, { useState } from 'react';
import { staticApi } from './staticApi';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await staticApi.sendMessage({ name, email, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-purple-950/20 border border-purple-900/40 p-8 rounded-3xl">
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>Message sent successfully! We will get back to you soon.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-purple-200">Your Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Salma Yehia" 
          className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
          required 
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-purple-200">Email Address</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="name@example.com" 
          className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
          required 
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-purple-200">Your Message</label>
        <textarea 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="How can we help you?" 
          rows={4} 
          className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
          required 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium hover:from-purple-500 hover:to-indigo-500 transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-900/40"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>Send Message</span>
        {!loading && <Send className="w-3.5 h-3.5" />}
      </button>
    </form>
  );
};