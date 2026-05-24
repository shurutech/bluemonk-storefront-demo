import { useEffect, useState } from 'react';
import { Loader2, Minus, Plus, ShoppingBag, Sparkles, Tag, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BREWLY_MENU } from '@/data/brewlyMenu';
import type {
  DemoCartItem,
  DemoSessionState,
  IntegrationSessionUpdateResponse,
} from '@/types/integrationApi';

function thumbForSku(sku: string): { image?: string; emoji: string } {
  const menuItem = BREWLY_MENU.find(m => m.sku === sku);
  if (menuItem) return { image: menuItem.image, emoji: menuItem.emoji };
  return { emoji: '☕️' };
}

interface BrewlyCartProps {
  open: boolean;
  onClose: () => void;
  cartItems: DemoCartItem[];
  cartSubtotal: number;
  discountTotal: number;
  couponCodes: string[];
  applyCoupon: (code: string) => void;
  removeCoupon: (code: string) => void;
  updateCartItem: (sku: string, updates: Partial<DemoCartItem>) => void;
  removeCartItem: (sku: string) => void;
  lastResponse: IntegrationSessionUpdateResponse | null;
  isLoading: boolean;
  onCheckout: () => Promise<unknown>;
  sessionState: DemoSessionState;
  onNewSession: () => void;
  onBrowse: () => void;
}

export function BrewlyCart(props: BrewlyCartProps) {
  const {
    open,
    onClose,
    cartItems,
    cartSubtotal,
    discountTotal,
    couponCodes,
    applyCoupon,
    removeCoupon,
    updateCartItem,
    removeCartItem,
    lastResponse,
    isLoading,
    onCheckout,
    sessionState,
    onNewSession,
    onBrowse,
  } = props;

  const [couponInput, setCouponInput] = useState('');
  const total = Math.max(0, cartSubtotal - discountTotal);
  const triggeredCampaigns = lastResponse?.triggeredCampaigns ?? [];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleApply = () => {
    const code = couponInput.trim();
    if (!code) return;
    applyCoupon(code);
    setCouponInput('');
  };

  const handleCheckout = async () => {
    try {
      await onCheckout();
      toast.success(`Order placed · $${total.toFixed(2)}`);
    } catch {
      // already toasted by the hook's logger
    }
  };

  return (
    <>
      <div
        className={
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity ' +
          (open ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={
          'fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
            <p className="text-xs text-slate-500">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-stone-100 hover:text-slate-700"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {sessionState === 'closed' ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Sparkles className="h-10 w-10 text-green-800" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Order placed</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your order is being prepared. We'll let you know when it's ready for pick-up.
            </p>
            <Button
              onClick={() => {
                onNewSession();
                onClose();
                onBrowse();
              }}
              className="mt-6 bg-green-800 text-white hover:bg-green-900"
            >
              Start a new order
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2 px-4 py-4">
                {cartItems.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
                    <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">Your cart is empty.</p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onBrowse();
                      }}
                      className="mt-3 text-xs font-bold text-green-800 hover:text-green-900"
                    >
                      Browse the menu →
                    </button>
                  </div>
                )}
                {cartItems.map(item => {
                  const thumb = thumbForSku(item.sku);
                  return (
                    <div
                      key={item.sku}
                      className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3"
                    >
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50">
                        <span className="absolute inset-0 flex items-center justify-center text-2xl">
                          {thumb.emoji}
                        </span>
                        {thumb.image && (
                          <img
                            src={thumb.image}
                            alt={item.name}
                            loading="lazy"
                            className="relative h-full w-full object-cover"
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem(item.sku, {
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 text-slate-500 hover:bg-stone-50"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem(item.sku, { quantity: item.quantity + 1 })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 text-slate-500 hover:bg-stone-50"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.sku)}
                          className="ml-1 text-slate-300 hover:text-red-500"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 pb-3">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Tag className="h-3.5 w-3.5 text-green-800" />
                    Promo code
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleApply();
                      }}
                    />
                    <Button
                      onClick={handleApply}
                      disabled={!couponInput.trim()}
                      className="bg-green-800 text-white hover:bg-green-900"
                    >
                      Apply
                    </Button>
                  </div>

                  {couponCodes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {couponCodes.map(code => (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800"
                        >
                          {code}
                          <button
                            type="button"
                            onClick={() => removeCoupon(code)}
                            className="text-green-500 hover:text-green-800"
                            aria-label={`Remove ${code}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {triggeredCampaigns.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <Sparkles className="h-3.5 w-3.5" />
                      Rules fired
                    </p>
                    <ul className="mt-2 space-y-1">
                      {triggeredCampaigns.map(c => (
                        <li key={c.id} className="text-xs text-amber-900">
                          ✓ {c.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-stone-200 bg-white px-5 py-4">
              <div className="rounded-2xl bg-stone-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Discounts</span>
                  <span
                    className={
                      discountTotal > 0
                        ? 'tabular-nums font-semibold text-green-800'
                        : 'tabular-nums text-slate-400'
                    }
                  >
                    {discountTotal > 0 ? '−' : ''}${discountTotal.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 border-t border-stone-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-xl font-bold tabular-nums text-slate-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || isLoading}
                className="mt-3 w-full bg-green-800 py-6 text-base font-bold text-white shadow-md hover:bg-green-900"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing…
                  </>
                ) : (
                  <>Place Order · ${total.toFixed(2)}</>
                )}
              </Button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
