import { Coffee, Settings2, ShoppingBag, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BREWLY_BRAND } from '@/data/brewlyMenu';
import { cn } from '@/lib/utils';

export type BrewlyView = 'home' | 'menu' | 'wallet' | 'account';

const NAV_ITEMS: { id: BrewlyView; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'account', label: 'Account' },
];

interface BrewlyHeaderProps {
  active: BrewlyView;
  onNavigate: (view: BrewlyView) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenDev: () => void;
  onReconfigure: () => void;
}

export function BrewlyHeader({
  active,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenDev,
  onReconfigure,
}: BrewlyHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-white shadow-sm">
            <Coffee className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-black tracking-tight text-slate-900">
              {BREWLY_BRAND.name.toLowerCase()}
            </span>
            <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              {BREWLY_BRAND.tagline}
            </span>
          </span>
        </button>

        <nav className="ml-4 hidden gap-1 md:flex">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                active === item.id
                  ? 'bg-green-800 text-white'
                  : 'text-slate-600 hover:bg-stone-100'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDev}
            className="hidden text-xs text-slate-500 hover:text-slate-700 lg:inline-flex"
            title="Inspect API traffic (BlueMonk engine)"
          >
            <Terminal className="mr-1.5 h-3.5 w-3.5" />
            Dev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconfigure}
            className="hidden text-xs text-slate-500 hover:text-slate-700 lg:inline-flex"
            title="Disconnect and re-enter the API key"
          >
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Reconfigure
          </Button>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 rounded-full bg-green-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-900"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-stone-100 px-3 py-2 md:hidden">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              active === item.id
                ? 'bg-green-800 text-white'
                : 'text-slate-600 hover:bg-stone-100'
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
