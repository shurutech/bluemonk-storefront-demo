import { Ticket } from 'lucide-react';

const VOUCHERS = [
  { name: '20% off cold brews', code: 'SUMMER20', expires: 'Expires in 12 days' },
  { name: 'Free pastry with coffee', code: 'PAIRUP', expires: 'Expires in 4 days' },
  { name: '$5 referral credit', code: 'FRIEND5', expires: 'No expiry' },
];

export function BrewlyWallet() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Brewly wallet
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Vouchers, points, and saved cards</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-green-900 to-green-600 p-6 text-white shadow-sm md:col-span-1">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase opacity-80">
            Brewly Club
          </p>
          <p className="mt-2 text-4xl font-black tabular-nums">1,240</p>
          <p className="text-xs opacity-80">points earned this year</p>
          <div className="mt-6 rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold tracking-wider uppercase opacity-80">
              Next reward
            </p>
            <p className="mt-1 text-sm font-semibold">$5 off any drink at 1,500 pts</p>
            <div className="mt-2 relative h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="absolute inset-y-0 left-0 w-[82%] rounded-full bg-amber-300" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:col-span-2">
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Available vouchers
          </p>
          <div className="mt-3 space-y-2">
            {VOUCHERS.map(v => (
              <div
                key={v.code}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-800">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{v.name}</p>
                  <p className="text-xs text-slate-500">
                    Code: <span className="font-semibold text-slate-700">{v.code}</span> ·{' '}
                    {v.expires}
                  </p>
                </div>
                <span className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-bold text-green-800">
                  Use in cart
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-sm text-slate-500">
        Vouchers shown here are static demo content. The active coupons evaluated by the BlueMonk
        engine come from the API response when a code is applied in the cart.
      </div>
    </div>
  );
}
