import { ChevronRight, Heart, LogOut, MapPin, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROWS: Array<{ icon: typeof User; label: string; detail: string }> = [
  { icon: User, label: 'Profile details', detail: 'Name, email, phone' },
  { icon: MapPin, label: 'Addresses', detail: '2 saved addresses' },
  { icon: Heart, label: 'Favorites', detail: '4 saved items' },
  { icon: Settings, label: 'Notifications', detail: 'Email + push' },
];

interface BrewlyAccountProps {
  onReconfigure: () => void;
}

export function BrewlyAccount({ onReconfigure }: BrewlyAccountProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Brewly account
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Profile & preferences</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-800 text-xl font-bold text-white">
              S
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Sarah</p>
              <p className="text-sm text-slate-500">sarah@brewly.demo</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-stone-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Member since 2024</p>
            <p className="text-slate-500">Bronze tier · 1,240 pts</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:col-span-2">
          {ROWS.map((r, idx) => {
            const Icon = r.icon;
            return (
              <button
                key={r.label}
                type="button"
                className={
                  'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-stone-50 ' +
                  (idx > 0 ? 'border-t border-stone-100' : '')
                }
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-800">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.detail}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900">BlueMonk Integration</p>
          <p className="text-xs text-slate-500">
            Disconnect from the current Integration API key. You'll re-enter the URL and key on
            the setup screen.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onReconfigure}
          className="border-stone-200 text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Reconfigure
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400">Brewly demo · powered by BlueMonk</p>
    </div>
  );
}
