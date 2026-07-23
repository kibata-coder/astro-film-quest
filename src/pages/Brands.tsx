import { memo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import { ALL_BRANDS } from '@/lib/brands';
import { Layers } from 'lucide-react';

const Brands = memo(() => {
  const studios = ALL_BRANDS.filter((b) => b.type === 'company');
  const streamers = ALL_BRANDS.filter((b) => b.type === 'provider');

  const BrandCard = ({ brand }: { brand: (typeof ALL_BRANDS)[0] }) => (
    <Link
      to={`/brand/${brand.id}`}
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/20 flex flex-col"
      style={{ '--brand-glow': brand.color + '44' } as React.CSSProperties}
    >
      {/* Logo area */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-full h-28 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Bottom glow stripe */}
        <div
          className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: brand.color }}
        />
        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at center, ${brand.color}, transparent 70%)` }}
        />
      </div>

      {/* Info */}
      <div className="p-3 flex-1">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {brand.description}
        </p>
      </div>

      {/* Explore label */}
      <div className="px-3 pb-3">
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: brand.color + '25', color: brand.color }}
        >
          Explore →
        </span>
      </div>
    </Link>
  );

  return (
    <Layout>
      <Seo
        title="All Brands & Studios SoudFlex"
        description="Browse movies and TV shows by your favourite streaming service or studio Netflix, Marvel, Prime Video, Disney, DC, and more."
        canonicalPath="/brands"
      />

      <main className="pt-28 pb-20 px-5 md:px-16">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">All Brands &amp; Studios</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Click any brand to browse its movies and TV shows
            </p>
          </div>
        </div>

        {/* Studios & Franchises */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Studios &amp; Franchises
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {studios.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>

        {/* Streaming Services */}
        <section>
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Streaming Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {streamers.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
});

Brands.displayName = 'Brands';
export default Brands;
