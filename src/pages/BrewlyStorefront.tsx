import { useEffect, useState } from 'react';
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
import { BrewlyJourneys } from '@/components/brewly/BrewlyJourneys';
import type { MenuItem } from '@/data/brewlyMenu';
import { activeJourneyVouchers, groupJourneyUpdates } from '@/lib/journeys';

export function BrewlyStorefront() {
  const [view, setView] = useState<BrewlyView>('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  const storefront = useDemoStorefront();
  const { journeyUpdateBatch } = storefront;

  // One toast per journey that moved (enrolled, step redeemed/unlocked, finished).
  useEffect(() => {
    if (!journeyUpdateBatch) return;
    for (const u of groupJourneyUpdates(journeyUpdateBatch.updates)) {
      toast.success(u.journeyName, {
        description: u.message,
        duration: 5000,
        action: { label: 'View', onClick: () => setView('journeys') },
      });
    }
  }, [journeyUpdateBatch]);

  if (!storefront.config) {
    return (
      <BrewlySetup onConnect={storefront.configure} validateApiKey={storefront.validateApiKey} />
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

  const handleUseVoucher = (code: string) => {
    storefront.applyJourneyVoucher(code);
    setCartOpen(true);
    toast.success(`${code} added to your cart`, { duration: 1500 });
  };

  const handleNewCustomer = () => {
    storefront.newCustomer();
    toast.success('Signed up a new customer', { duration: 1500 });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <BrewlyHeader
        active={view}
        onNavigate={setView}
        cartCount={cartCount}
        journeyVoucherCount={activeJourneyVouchers(storefront.journeys).length}
        onOpenCart={() => setCartOpen(true)}
        onOpenDev={() => setDevOpen(true)}
        onNewCustomer={handleNewCustomer}
        onReconfigure={storefront.resetConfig}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {view === 'home' && <BrewlyHome onBrowse={() => setView('menu')} />}
        {view === 'menu' && <BrewlyMenu onAdd={handleAdd} />}
        {view === 'journeys' && (
          <BrewlyJourneys
            profileId={storefront.profileId}
            customerReady={storefront.customerReady}
            journeys={storefront.journeys}
            journeysLoaded={storefront.journeysLoaded}
            journeysLoading={storefront.journeysLoading}
            journeysError={storefront.journeysError}
            couponCodes={storefront.sessionState === 'open' ? storefront.couponCodes : []}
            onUseVoucher={handleUseVoucher}
            onRefresh={storefront.refreshJourneys}
            onNewCustomer={handleNewCustomer}
            onBrowse={() => setView('menu')}
          />
        )}
        {view === 'wallet' && (
          <BrewlyWallet
            journeys={storefront.journeys}
            couponCodes={storefront.sessionState === 'open' ? storefront.couponCodes : []}
            onUseVoucher={handleUseVoucher}
            onViewJourneys={() => setView('journeys')}
          />
        )}
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
        onRefund={storefront.cancelSession}
        sessionState={storefront.sessionState}
        onNewSession={storefront.newSession}
        onBrowse={() => setView('menu')}
        journeyUpdates={storefront.lastJourneyUpdates}
        onViewJourneys={() => setView('journeys')}
      />

      <BrewlyDevDrawer
        open={devOpen}
        onClose={() => setDevOpen(false)}
        lastRequest={storefront.lastRequest}
        lastResponse={storefront.lastResponse}
        eventLog={storefront.eventLog}
        profileId={storefront.profileId}
        customerReady={storefront.customerReady}
        lastSignupResponse={storefront.lastSignupResponse}
        journeys={storefront.journeys}
      />
    </div>
  );
}
