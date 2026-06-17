import { ArrowRight, Clock, MapPin, Star, Ticket } from 'lucide-react';
import { BREWLY_BRAND, BREWLY_MENU } from '@/data/brewlyMenu';
import { FEATURED_PROMOS } from '@/data/promos';

interface BrewlyHomeProps {
  onBrowse: () => void;
}

export function BrewlyHome({ onBrowse }: BrewlyHomeProps) {
  const promo = FEATURED_PROMOS[0];
  const featured = BREWLY_MENU.filter(item => item.badge).slice(0, 4);
  const points = 1240;

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-3xl bg-cover bg-center shadow-sm"
        style={{ backgroundImage: `url(${promo.bannerImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/20" />
        <div className="relative grid gap-6 px-10 py-14 text-white md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase opacity-90">
              With love, from
            </p>
            <h1 className="mt-2 font-serif text-7xl leading-none font-black drop-shadow-lg">
              {BREWLY_BRAND.name.toLowerCase()}
            </h1>
            <p className="mt-3 max-w-md text-base opacity-90">{BREWLY_BRAND.tagline}.</p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-green-900">
              <Ticket className="h-4 w-4" />
              Featured promo: {promo.title}
            </div>
            <p className="mt-3 max-w-md text-sm opacity-95">{promo.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
              {promo.badgeText}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onBrowse}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-green-900 shadow-md transition-colors hover:bg-stone-100"
              >
                Browse menu
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-xs font-medium backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" />
                {BREWLY_BRAND.storeName}
              </div>
            </div>
          </div>

          <div className="hidden md:block" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-green-900 to-green-700 p-5 text-white shadow-sm">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-80">
            Brewly Club
          </p>
          <p className="mt-2 text-4xl font-black tabular-nums">{points.toLocaleString()}</p>
          <p className="text-xs opacity-80">points earned this year</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
              🥉
            </div>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="absolute inset-y-0 left-0 w-[42%] rounded-full bg-amber-300" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-bold opacity-60">
              🥈
            </div>
          </div>
          <p className="mt-3 text-xs opacity-90">₱500 more to level up to Silver.</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Ordering from
          </p>
          <p className="mt-2 flex items-center gap-2 text-base font-bold text-slate-900">
            <MapPin className="h-4 w-4 text-green-800" />
            {BREWLY_BRAND.storeName}
          </p>
          <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-full bg-green-100 p-1">
            <button
              type="button"
              className="rounded-full bg-white py-1.5 text-xs font-bold text-green-800 shadow-sm"
            >
              Self pick-up
            </button>
            <button type="button" className="py-1.5 text-xs font-medium text-slate-500">
              Delivery
            </button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Clock className="h-3.5 w-3.5" /> ASAP · 15–30 mins
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Quests & tasks
            </p>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-700 uppercase">
              New
            </span>
          </div>
          <p className="mt-2 text-base font-bold text-slate-900">Try 2 new drinks</p>
          <p className="text-xs text-slate-500">Earn 50 pts this week.</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-green-700" />
            </div>
            <p className="text-xs font-semibold text-green-800">1/2</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Featured
            </p>
            <h2 className="text-xl font-bold text-slate-900">This week's picks</h2>
          </div>
          <button
            type="button"
            onClick={onBrowse}
            className="text-sm font-semibold text-green-800 hover:text-green-900"
          >
            See full menu →
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map(item => (
            <button
              key={item.sku}
              type="button"
              onClick={onBrowse}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-green-50 to-amber-50">
                <span className="absolute inset-0 flex items-center justify-center text-5xl">
                  {item.emoji}
                </span>
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="relative h-full w-full object-cover transition-transform group-hover:scale-105"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                  }}
                />
                {item.badge && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                    <Star className="h-3 w-3" />
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                <p className="line-clamp-2 text-xs text-slate-500">{item.description}</p>
                <p className="mt-2 text-sm font-bold text-green-800">₱{item.price.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
