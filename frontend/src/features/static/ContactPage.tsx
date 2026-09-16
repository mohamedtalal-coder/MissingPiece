import React, { useState } from 'react';
import { Mail, Send, MapPin, Phone } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0914] text-white font-serif py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10 bg-[#130e21] border border-[#221738] p-10 md:p-14 rounded-3xl shadow-xl">
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-white">Contact Us</h1>
          <p className="text-sm font-sans text-[#a1a1aa]">Have questions or feedback? We would love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-sans">
          
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif text-white">Get in Touch</h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Whether you need assistance with an ongoing order, shipping details, or custom puzzle inquiries, our team is always ready to assist.
            </p>
            
            <div className="space-y-4 text-xs text-[#d1d5db]">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#c084fc]" />
                <span>support@missingpiece.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#c084fc]" />
                <span>+20 100 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#c084fc]" />
                <span>Zagazig, Egypt</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0914] p-6 rounded-2xl border border-[#221738]">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">✓</div>
                <h4 className="text-sm font-bold text-white">Message Sent!</h4>
                <p className="text-xs text-[#a1a1aa]">Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#a1a1aa]">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Salma Yehia"
                    className="w-full bg-[#130e21] border border-[#221738] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7e22ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#a1a1aa]">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="salma@example.com"
                    className="w-full bg-[#130e21] border border-[#221738] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7e22ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#a1a1aa]">Message</label>
                  <textarea 
                    required 
                    rows={4}
                    placeholder="Write your message here..."
                    className="w-full bg-[#130e21] border border-[#221738] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7e22ce] resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactPage;