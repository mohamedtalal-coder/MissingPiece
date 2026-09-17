
import { ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b0914] text-white px-8 py-16 font-sans space-y-12">
      
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">About Missing Piece</h1>
          <p className="text-xs md:text-sm text-[#cbd5e1]">Discover the philosophy, vision, and passion behind our master-crafted puzzle collections.</p>
        </div>

        {/* الـ 3 مستطيلات النيون جنب بعض */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* المستطيل الأول */}
          <div className="bg-[#130e21] border border-[#7e22ce]/40 p-6 rounded-2xl space-y-4 shadow-xl hover:border-[#a855f7] transition-all">
            <div className="w-12 h-12 bg-[#18112c] rounded-xl flex items-center justify-center text-[#c084fc] border border-[#7e22ce]/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Exquisite Craftsmanship</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Every puzzle in our catalog is hand-picked to meet the highest standards of quality, featuring laser-cut precision and stunning visual storytelling.
            </p>
          </div>

          {/* المستطيل الثاني */}
          <div className="bg-[#130e21] border border-[#7e22ce]/40 p-6 rounded-2xl space-y-4 shadow-xl hover:border-[#a855f7] transition-all">
            <div className="w-12 h-12 bg-[#18112c] rounded-xl flex items-center justify-center text-[#c084fc] border border-[#7e22ce]/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Mind & Concentration</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              We curate timeless experiences designed to engage your mind, spark creativity, and provide moments of absolute peace and focus away from screens.
            </p>
          </div>

          {/* المستطيل الثالث */}
          <div className="bg-[#130e21] border border-[#7e22ce]/40 p-6 rounded-2xl space-y-4 shadow-xl hover:border-[#a855f7] transition-all">
            <div className="w-12 h-12 bg-[#18112c] rounded-xl flex items-center justify-center text-[#c084fc] border border-[#7e22ce]/40">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Collector Community</h3>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Built by enthusiasts for true puzzle connoisseurs. Join our growing community of solvers who appreciate the art of the missing piece.
            </p>
          </div>

        </div>

    </div>
  );
}

export default AboutPage;