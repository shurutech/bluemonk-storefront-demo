import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { BREWLY_MENU, MENU_CATEGORIES, type MenuItem } from '@/data/brewlyMenu';
import { cn } from '@/lib/utils';

interface BrewlyMenuProps {
  onAdd: (item: MenuItem) => void;
}

export function BrewlyMenu({ onAdd }: BrewlyMenuProps) {
  const [category, setCategory] = useState<(typeof MENU_CATEGORIES)[number]>('Featured');
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    return BREWLY_MENU.filter(item => {
      const matchesQuery = query
        ? item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesCategory = category === 'Featured' || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Brewly menu
          </p>
          <h1 className="text-2xl font-bold text-slate-900">All drinks & bites</h1>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search drinks and bites"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-green-700 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MENU_CATEGORIES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
              category === c
                ? 'bg-green-800 text-white shadow-sm'
                : 'border border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-slate-500">
          No matches for "{query}".
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <div
              key={item.sku}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-green-50 to-amber-50">
                <span className="absolute inset-0 flex items-center justify-center text-6xl">
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
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-wider text-orange-700 uppercase">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-base font-bold text-slate-900">{item.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <p className="text-base font-bold text-green-800">${item.price.toFixed(2)}</p>
                  <button
                    type="button"
                    onClick={() => onAdd(item)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-green-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
