import { ShieldCheck, Sparkles, HeartHandshake, Puzzle, Compass, Quote } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Motion } from '../../shared/components/ui/Motion';
import { Link } from 'react-router-dom';

export function AboutPage() {
  const { t } = useLanguage() as any;

  return (
    <div className="w-full flex flex-col relative overflow-hidden bg-surface pb-space-2xl">
      {/* Hero Background Effects */}
      <div
        className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--color-primary)_12%,transparent)_0%,_transparent_60%)] blur-2xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute top-40 -start-40 w-96 h-96 bg-primary-container/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"
        aria-hidden
      />

      {/* Hero Section */}
      <div className="relative pt-space-3xl pb-space-2xl px-margin-mobile lg:px-margin max-w-7xl mx-auto w-full text-center">
        <Motion preset="up" className="inline-flex items-center gap-2 mb-space-md">
          <span className="h-px w-8 bg-primary/40" />
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.2em]">
            {t.about?.heritage || 'Our Heritage'}
          </span>
          <span className="h-px w-8 bg-primary/40" />
        </Motion>

        <Motion preset="up" delayMs={100} className="max-w-3xl mx-auto space-y-space-md">
          <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight leading-[1.1]">
            {t.about?.title || 'About Missing Piece'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {t.about?.subtitle ||
              'Discover the philosophy, vision, and passion behind our master-crafted puzzle collections.'}
          </p>
        </Motion>
      </div>

      {/* Story Section */}
      <div className="relative px-margin-mobile lg:px-margin max-w-7xl mx-auto w-full pb-space-3xl">
        <div className="grid lg:grid-cols-2 gap-space-2xl items-center">
          <Motion preset="right" delayMs={200} className="relative aspect-[4/5] rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-10" />
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 group-hover:bg-primary/0 transition-colors duration-700" />
            {/* Elegant placeholder gradient image if actual image is missing */}
            <div className="w-full h-full bg-[linear-gradient(45deg,var(--color-surface-container-high),var(--color-surface-container-low))] bg-[length:200%_200%] animate-[gradient_15s_ease_infinite] relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <Puzzle className="w-32 h-32 text-on-surface-variant" />
              </div>
            </div>
            
            {/* Overlay Text inside image */}
            <div className="absolute bottom-0 start-0 end-0 p-space-xl z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <Quote className="w-8 h-8 text-primary-container mb-4 opacity-50" />
              <p className="font-serif text-xl sm:text-2xl text-on-surface leading-snug font-medium italic">
                {t.about?.quote || "\"We believe in the quiet revolution of slowing down. A puzzle isn't just a game; it's a meditation.\""}
              </p>
            </div>
          </Motion>

          <Motion preset="left" delayMs={300} className="space-y-space-xl">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-space-sm">
                {t.about?.anatomyTitle || 'The Anatomy of Perfection'}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                {t.about?.anatomyP1 || 'Founded in 2026, Missing Piece was born out of a desire to rescue the art of the jigsaw puzzle from mass production. We collaborate with independent artists and employ heirloom-grade walnut grains to create architectural joinery that snaps together with absolute satisfaction.'}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {t.about?.anatomyP2 || 'Our micro-precision laser die-cuts ensure that every single piece is unique, preventing false fits and elevating the challenge. We are not just making puzzles; we are crafting contemplative focus for the modern age.'}
              </p>
            </div>
            
            <div className="flex gap-space-md pt-space-sm border-t border-outline-variant/30">
              <div className="flex-1">
                <span className="block font-display-sm text-3xl text-primary mb-1">100+</span>
                <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">{t.about?.masterEditions || 'Master Editions'}</span>
              </div>
              <div className="w-px bg-outline-variant/30" />
              <div className="flex-1">
                <span className="block font-display-sm text-3xl text-primary mb-1">0</span>
                <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">{t.about?.plasticUsed || 'Plastic Used'}</span>
              </div>
            </div>
          </Motion>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="bg-surface-container-lowest border-y border-outline-variant/20 py-space-3xl relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary-container)_0%,transparent_100%)] opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin relative z-10">
          <div className="text-center mb-space-2xl max-w-2xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-sm">
              {t.about?.pillarsTitle || 'Our Core Pillars'}
            </h2>
            <p className="font-body-md text-on-surface-variant">
              {t.about?.pillarsDesc || 'The principles that guide every cut, every box, and every collection we release to the world.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-space-lg lg:gap-space-xl">
            <Motion preset="up" delayMs={100} className="bg-surface-container-low/50 backdrop-blur-sm border border-outline-variant/30 p-space-xl rounded-2xl hover:border-primary/40 hover:bg-surface-container-low transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary border border-primary-container/30 mb-space-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
                {t.about?.craftsmanshipTitle || 'Exquisite Craftsmanship'}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {t.about?.craftsmanshipDescription ||
                  'Every puzzle in our catalog is hand-picked to meet the highest standards of quality, featuring laser-cut precision and stunning visual storytelling.'}
              </p>
            </Motion>

            <Motion preset="up" delayMs={200} className="bg-surface-container-low/50 backdrop-blur-sm border border-outline-variant/30 p-space-xl rounded-2xl hover:border-primary/40 hover:bg-surface-container-low transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary border border-primary-container/30 mb-space-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
                {t.about?.mindTitle || 'Mind & Concentration'}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {t.about?.mindDescription ||
                  'We curate timeless experiences designed to engage your mind, spark creativity, and provide moments of absolute peace and focus away from screens.'}
              </p>
            </Motion>

            <Motion preset="up" delayMs={300} className="bg-surface-container-low/50 backdrop-blur-sm border border-outline-variant/30 p-space-xl rounded-2xl hover:border-primary/40 hover:bg-surface-container-low transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary border border-primary-container/30 mb-space-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
                {t.about?.communityTitle || 'Collector Community'}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {t.about?.communityDescription ||
                  'Built by enthusiasts for true puzzle connoisseurs. Join our growing community of solvers who appreciate the art of the missing piece.'}
              </p>
            </Motion>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-margin-mobile lg:px-margin text-center pt-space-3xl pb-space-lg">
        <Motion preset="up">
          <ShieldCheck className="w-12 h-12 text-primary-container mx-auto mb-space-md opacity-80" />
          <h2 className="font-display-sm text-2xl md:text-3xl text-on-surface mb-space-sm">
            {t.about?.experienceTitle || 'Experience the Difference'}
          </h2>
          <p className="font-body-md text-on-surface-variant mb-space-xl max-w-lg mx-auto">
            {t.about?.experienceDesc || 'Ready to disconnect from the digital noise? Explore our archive of artisanal editions.'}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-on-primary font-label-caps uppercase tracking-widest text-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:shadow-[0_0_30px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
          >
            {t.about?.exploreBtn || 'Explore the Collection'}
          </Link>
        </Motion>
      </div>
    </div>
  );
}

export default AboutPage;