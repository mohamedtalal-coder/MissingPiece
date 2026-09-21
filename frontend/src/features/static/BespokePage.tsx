
import { Motion } from '../../shared/components/ui/Motion';
import { Camera, Scissors, Paintbrush, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../shared/context/LanguageContext';

export function BespokePage() {
  const { t } = useLanguage() as any;
  const processSteps = [
    {
      icon: <Camera className="w-6 h-6 text-primary" />,
      title: t.static?.bespoke?.step1Title || '1. Curate Your Image',
      description: t.static?.bespoke?.step1Desc || 'Upload a cherished photograph, a piece of original artwork, or a memorable map. Our design team will review it for resolution and composition to ensure a stunning final piece.'
    },
    {
      icon: <Scissors className="w-6 h-6 text-primary" />,
      title: t.static?.bespoke?.step2Title || '2. The Artisan Cut',
      description: t.static?.bespoke?.step2Desc || 'We do not use standard grid patterns. Our master designers map a custom cut path for your image, including personalized "whimsy" pieces shaped like animals, initials, or objects meaningful to you.'
    },
    {
      icon: <Paintbrush className="w-6 h-6 text-primary" />,
      title: t.static?.bespoke?.step3Title || '3. Crafting & Finishing',
      description: t.static?.bespoke?.step3Desc || 'Your image is infused into 1/4-inch premium maple wood. Our precision lasers cut the intricate design, and each piece is carefully hand-inspected and gently cleaned.'
    },
    {
      icon: <Package className="w-6 h-6 text-primary" />,
      title: t.static?.bespoke?.step4Title || '4. The Unboxing',
      description: t.static?.bespoke?.step4Desc || 'Your bespoke puzzle arrives in a handcrafted wooden box, wrapped in protective parchment, complete with a wax seal—ready for gifting or a timeless family evening.'
    }
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-outline-variant/30">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low to-surface -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Motion preset="up" className="space-y-6">
            <span className="text-[11px] uppercase tracking-widest px-2 py-1 rounded bg-primary-container text-primary-container border border-primary-container/20 font-label-caps">
              {t.static?.bespoke?.tagline || 'Custom Commissions'}
            </span>
            <h1 className="font-display-lg text-5xl md:text-7xl tracking-tight leading-[1.1]">
              {t.static?.bespoke?.titleMemories || 'Your Memories,'}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                {t.static?.bespoke?.titleCrafted || 'Masterfully Crafted.'}
              </span>
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed text-lg md:text-xl">
              {t.static?.bespoke?.desc || 'Commission a one-of-a-kind wooden jigsaw puzzle. Transform a special moment into an heirloom that will be pieced together for generations.'}
            </p>
            
            <div className="pt-8">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-on-primary font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t.static?.bespoke?.inquire || 'Inquire About a Commission'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Motion>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion preset="up" className="text-center mb-16">
            <h2 className="font-display-md text-3xl md:text-4xl text-on-surface">{t.static?.bespoke?.processTitle || 'The Atelier Process'}</h2>
            <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto">
              {t.static?.bespoke?.processDesc || 'Every custom piece goes through our rigorous, four-step artisanal workflow to ensure perfection.'}
            </p>
          </Motion>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <Motion 
                preset="up" 
                delayMs={index * 100} 
                key={index}
                className="relative p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary-container/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="font-title-lg text-xl text-on-surface mb-3">{step.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  {step.description}
                </p>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Teaser */}
      <section className="py-24 border-t border-outline-variant/30 bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Motion preset="up">
            <h2 className="font-display-md text-3xl mb-4">{t.static?.bespoke?.faqTitle || 'Have Questions?'}</h2>
            <p className="text-on-surface-variant mb-8">
              {t.static?.bespoke?.faqDesc || 'Learn more about our materials, shipping, and return policies in our detailed FAQ.'}
            </p>
            <Link 
              to="/faq" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-outline hover:border-primary text-on-surface hover:text-primary transition-colors"
            >
              {t.static?.bespoke?.faqBtn || 'Read the FAQ'}
            </Link>
          </Motion>
        </div>
      </section>
    </div>
  );
}

export default BespokePage;
