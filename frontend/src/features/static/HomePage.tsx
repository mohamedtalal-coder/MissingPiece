import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { Motion } from '../../shared/components/ui/Motion';
import { ProductCard } from '../products/components/ProductCard';
import { ProductCardSkeleton } from '../products/components/ProductCardSkeleton';
import { productsApi, type Product } from '../products/productsApi';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';
import { useLanguage } from '../../shared/context/LanguageContext';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDcG08k9yZVrEVfodbBg7iy8eZcVT0YRfrX7FPn3nGGmd9r8HZedc_M8fLwpGg_ihYKQcQ355P74xuOXWtvo66DNzkYC6k5vIEmTVmr2LTabxunSat27yA-3d0hjC4pjKP0hchELKct7ah2WAOAjwPTUOM6gqhJxaGPSIolEL76d_mwQHRmDkBig-AVA-c33_tMV_zXOyJXH-0WCPBROhHsdwVdYpyYTIoMskBlCU3eauVnHn68_6NnXA';

export default function HomePage() {
  const { t, language } = useLanguage() as any;
  const reducedMotion = useReducedMotion();

  const CATEGORIES = useMemo(() => [
    {
      to: '/products?category=jigsaw',
      icon: 'photo_library',
      title: t.home?.jigsawTitle || 'Classic Jigsaws',
      blurb: t.home?.jigsawBlurb || 'Fine-art prints on museum-grade board with anti-glare finish.',
    },
    {
      to: '/products?category=3d',
      icon: 'account_balance',
      title: t.home?.threeDTitle || 'Architectural 3D',
      blurb: t.home?.threeDBlurb || 'Kinetic interlocking structural sculptures engineered in birch.',
    },
    {
      to: '/products?category=wooden',
      icon: 'forest',
      title: t.home?.woodenTitle || 'Wooden Puzzles',
      blurb: t.home?.woodenBlurb || 'Heirloom cherry and walnut whimsy pieces cut with zero splintering.',
    },
    {
      to: '/products?category=mystery',
      icon: 'search_insights',
      title: t.home?.mysteryTitle || 'Mystery Puzzles',
      blurb: t.home?.mysteryBlurb || 'Image-less boxes with cipher narratives and mechanical compartments.',
    },
  ], [t]);

  const STANDARDS = useMemo(() => [
    {
      icon: 'precision_manufacturing',
      title: t.home?.standards?.precisionTitle || 'Zero False Fits',
      blurb: t.home?.standards?.precisionBlurb || 'Micro-machined dies crafted uniquely. Two pieces only interlock if they belong.',
    },
    {
      icon: 'texture',
      title: t.home?.standards?.textureTitle || 'Linen Emulsion',
      blurb: t.home?.standards?.textureBlurb || 'Anti-glare eggshell emulsion designed for serene assembly under warm light.',
    },
    {
      icon: 'security',
      title: t.home?.standards?.securityTitle || 'Lost Piece Guarantee',
      blurb: t.home?.standards?.securityBlurb || 'If a piece is ever lost, we mill and mail the exact coordinate replacement for life.',
    },
    {
      icon: 'eco',
      title: t.home?.standards?.ecoTitle || 'Plastic-Free Vault',
      blurb: t.home?.standards?.ecoBlurb || 'Cloth-bound box with magnetic brass catch and organic cotton satchel.',
    },
  ], [t]);

  const [featured, setFeatured] = useState<Product[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingFeatured(true);
    setFeaturedError(null);

    productsApi
      .getAll({ sort: 'newest', limit: 3, page: 1 }, controller.signal)
      .then((data) => setFeatured(data.items))
      .catch((err: { name?: string; code?: string }) => {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
          return;
        }
        setFeaturedError(t.home?.loadError || 'Featured editions could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingFeatured(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      {/* Full-bleed hero — brand + one message + CTAs */}
      <section className="relative w-full min-h-[min(92vh,820px)] overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0" aria-hidden>
          <img
            src={HERO_IMAGE}
            alt=""
            className={`w-full h-full object-cover object-center opacity-45 ${reducedMotion ? '' : 'hero-kenburns'}`}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/50" />
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-margin-mobile lg:px-margin flex flex-col justify-end min-h-[min(92vh,820px)] pb-space-2xl pt-28">
          <div className={`max-w-2xl flex flex-col items-start gap-space-md ${reducedMotion ? '' : 'animate-slide-up'}`}>
            <p className="font-headline-lg text-display-lg-mobile sm:text-display-lg text-on-surface tracking-tight">
              MissingPiece
            </p>
            <h1 className="font-headline-md text-headline-lg sm:text-headline-lg text-on-surface/95 font-medium tracking-tight max-w-xl">
              {t.home?.heroTitle || 'Every picture is missing just one piece.'}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              {t.home?.heroDescription || 'Heirloom wooden jigsaws engineered for quiet mastery and lifelong replacement of any lost piece.'}
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <Button as="link" to="/products" size="lg" icon={language === 'ar' ? 'arrow_back' : 'arrow_forward'} iconPosition="right">
                {t.home?.exploreCollection || 'Explore Collection'}
              </Button>
              <Button as="link" to="/about" variant="outline" size="lg">
                {t.home?.ourStory || 'Our Story'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full bg-surface py-space-2xl px-margin-mobile lg:px-margin" id="disciplines">
        <div className="max-w-[1360px] mx-auto flex flex-col gap-space-xl">
          <Motion className="flex flex-col items-center text-center gap-space-xs max-w-xl mx-auto">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
              {t.home?.exploreByStyle || 'Explore by Style'}
            </span>
            <h2 className="font-headline-md text-headline-lg text-on-surface tracking-tight">{t.home?.shopByCategory || 'Shop by Category'}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t.home?.categoryDescription || 'Mindful tactile engagement across four craftsmanship traditions.'}
            </p>
          </Motion>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {CATEGORIES.map((cat, i) => (
              <Motion key={cat.to} delayMs={i * 80} className="h-full">
                <Link
                  to={cat.to}
                  className="group h-full flex flex-col justify-between bg-surface-container-low hover:bg-surface-container rounded-xl p-space-xl border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary-container/40"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon name={cat.icon} className="text-[20px]" />
                  </div>
                  <div className="pt-space-xl">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                      {cat.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{cat.blurb}</p>
                  </div>
                </Link>
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* Featured from API */}
      <section className="w-full bg-surface-container-lowest py-space-2xl px-margin-mobile lg:px-margin" id="catalog">
        <div className="max-w-[1360px] mx-auto flex flex-col gap-space-2xl">
          <Motion className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                {t.home?.selectedMasterworks || 'Selected Masterworks'}
              </span>
              <h2 className="font-headline-md text-headline-lg text-on-surface tracking-tight">
                {t.home?.bestSellers || 'Latest from the Atelier'}
              </h2>
            </div>
            <Button as="link" to="/products" variant="outline">
              {t.home?.viewAll || 'View All'}
            </Button>
          </Motion>

          {featuredError ? (
            <div
              className="rounded-xl border border-error/30 bg-surface-container-low px-space-lg py-space-xl text-center"
              role="alert"
            >
              <p className="font-body-md text-on-surface mb-space-md">{featuredError}</p>
              <Button
                type="button"
                onClick={() => {
                  setLoadingFeatured(true);
                  setFeaturedError(null);
                  productsApi
                    .getAll({ sort: 'newest', limit: 3, page: 1 })
                    .then((data) => setFeatured(data.items))
                    .catch(() => setFeaturedError(t.home?.loadError || 'Featured editions could not be loaded.'))
                    .finally(() => setLoadingFeatured(false));
                }}
              >
                {t.home?.tryAgain || 'Try Again'}
              </Button>
            </div>
          ) : loadingFeatured ? (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-space-lg"
              aria-busy="true"
              aria-label="Loading featured editions"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="font-body-md text-on-surface-variant text-center py-space-xl">
              {t.home?.newEditions || 'New editions are being cut. Check the full collection soon.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {featured.map((product, i) => (
                <Motion key={product._id} delayMs={i * 90} className="h-full">
                  <ProductCard product={product} />
                </Motion>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Craft standards */}
      <section className="w-full bg-surface py-space-2xl px-margin-mobile lg:px-margin" id="craft">
        <div className="max-w-[1360px] mx-auto flex flex-col gap-space-2xl">
          <Motion className="text-center max-w-2xl mx-auto flex flex-col items-center gap-space-xs">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
              {t.home?.atelierStandards || 'The Atelier Standards'}
            </span>
            <h2 className="font-headline-md text-headline-lg text-on-surface tracking-tight">
              {t.home?.anatomyTitle || 'The Anatomy of a MissingPiece'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t.home?.anatomyDesc || 'Horological precision, tactile materials, and heirloom woodworking.'}
            </p>
          </Motion>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {STANDARDS.map((item, i) => (
              <Motion key={item.title} delayMs={i * 70}>
                <div className="flex flex-col gap-space-md p-space-xl rounded-xl bg-surface-container-low border border-outline-variant/20 h-full">
                  <Icon name={item.icon} className="text-primary text-[24px]" />
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{item.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.blurb}</p>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
