import { useState } from 'react';
import { toast } from 'sonner';
import { useDemoStorefront } from '@/hooks/useDemoStorefront';
import { BrewlySetup } from '@/components/brewly/BrewlySetup';
import { BrewlyHeader, type BrewlyView } from '@/components/brewly/BrewlyHeader';
import { BrewlyHome } from '@/components/brewly/BrewlyHome';
import { BrewlyMenu } from '@/components/brewly/BrewlyMenu';
import { BrewlyWallet } from '@/components/brewly/BrewlyWallet';
import { BrewlyAccount } from '@/components/brewly/BrewlyAccount';
import { BrewlyCart } from '@/components/brewly/BrewlyCart';
import { BrewlyDevDrawer } from '@/components/brewly/BrewlyDevDrawer';
import type { MenuItem } from '@/data/brewlyMenu';

export function BrewlyStorefront() {
  const [view, setView] = useState<BrewlyView>('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  const storefront = useDemoStorefront();

  if (!storefront.config) {
    return (
      <BrewlySetup
        onConnect={storefront.configure}
        validateApiKey={storefront.validateApiKey}
      />
    );
  }

  const cartCount =
    storefront.cartItems.reduce((sum, item) => sum + item.quantity, 0) +
    storefront.freeItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAdd = (item: MenuItem) => {
    const existing = storefront.cartItems.find(c => c.sku === item.sku);
    if (existing) {
      storefront.updateCartItem(item.sku, { quantity: existing.quantity + 1 });
    } else {
      storefront.addCartItem({
        sku: item.sku,
        name: item.name,
        price: item.price,
        quantity: 1,
        attributes: item.attributes,
      });
    }
    toast.success(`${item.name} added`, { duration: 1500 });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <BrewlyHeader
        active={view}
        onNavigate={setView}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenDev={() => setDevOpen(true)}
        onReconfigure={storefront.resetConfig}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {view === 'home' && <BrewlyHome onBrowse={() => setView('menu')} />}
        {view === 'menu' && <BrewlyMenu onAdd={handleAdd} />}
        {view === 'wallet' && <BrewlyWallet />}
        {view === 'account' && <BrewlyAccount onReconfigure={storefront.resetConfig} />}
      </main>

      <BrewlyCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={storefront.cartItems}
        freeItems={storefront.freeItems}
        cartSubtotal={storefront.cartSubtotal}
        discountTotal={storefront.discountTotal}
        couponCodes={storefront.couponCodes}
        applyCoupon={storefront.applyCoupon}
        removeCoupon={storefront.removeCoupon}
        updateCartItem={storefront.updateCartItem}
        removeCartItem={storefront.removeCartItem}
        lastResponse={storefront.lastResponse}
        isLoading={storefront.isLoading}
        onCheckout={storefront.checkout}
        sessionState={storefront.sessionState}
        onNewSession={storefront.newSession}
        onBrowse={() => setView('menu')}
      />

      <BrewlyDevDrawer
        open={devOpen}
        onClose={() => setDevOpen(false)}
        lastRequest={storefront.lastRequest}
        lastResponse={storefront.lastResponse}
        eventLog={storefront.eventLog}
      />
    </div>
  );
}
