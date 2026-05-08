import { Settings2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemoStorefront } from '@/hooks/useDemoStorefront';
import { CartSummary } from '@/components/demo-storefront/CartSummary';
import { CouponInput } from '@/components/demo-storefront/CouponInput';
import { DemoSetup } from '@/components/demo-storefront/DemoSetup';
import { EventLog } from '@/components/demo-storefront/EventLog';
import { InspectorPanel } from '@/components/demo-storefront/InspectorPanel';
import { StorefrontCart } from '@/components/demo-storefront/StorefrontCart';

export function DemoStorefront() {
  const {
    config,
    configure,
    resetConfig,
    validateApiKey,
    cartItems,
    addCartItem,
    removeCartItem,
    updateCartItem,
    cartSubtotal,
    discountTotal,
    couponCodes,
    applyCoupon,
    removeCoupon,
    sessionState,
    checkout,
    cancelSession,
    newSession,
    newCustomer,
    profileId,
    lastResponse,
    lastRequest,
    eventLog,
    isLoading,
  } = useDemoStorefront();

  if (!config) {
    return <DemoSetup onConnect={configure} validateApiKey={validateApiKey} />;
  }

  const isSessionEnded = sessionState === 'closed' || sessionState === 'cancelled';

  const handleCheckout = async () => {
    try {
      await checkout();
      toast.success('Session closed — checkout complete');
    } catch {
      toast.error('Failed to checkout');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSession();
      toast.success('Session cancelled');
    } catch {
      toast.error('Failed to cancel session');
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
            Demo Storefront
          </span>
          <span className="hidden text-xs text-slate-500 md:inline">
            Customer <span className="font-mono text-slate-600">{profileId.slice(-6)}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-mono text-slate-600">{stripScheme(config.apiBaseUrl)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={newCustomer}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            New customer
          </Button>
          <Button variant="outline" size="sm" onClick={resetConfig}>
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Reconfigure
          </Button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <StorefrontCart
                items={cartItems}
                onUpdateItem={updateCartItem}
                onRemoveItem={removeCartItem}
                onAddItem={addCartItem}
                disabled={isSessionEnded}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Coupon Code</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CouponInput
                couponCodes={couponCodes}
                onApply={applyCoupon}
                onRemove={removeCoupon}
                disabled={isSessionEnded}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CartSummary
                subtotal={cartSubtotal}
                discountTotal={discountTotal}
                sessionTotal={lastResponse?.customerSession?.sessionTotal ?? null}
                sessionState={sessionState}
                isLoading={isLoading}
                onCheckout={handleCheckout}
                onCancel={handleCancel}
                onNewSession={newSession}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex w-[440px] shrink-0 flex-col gap-4">
          <Card className="shrink-0 border-slate-200/60 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-0">
              <CardTitle className="text-sm font-medium text-slate-700">Inspector</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-2">
              <InspectorPanel response={lastResponse} request={lastRequest} />
            </CardContent>
          </Card>

          {eventLog.length > 0 && (
            <Card className="flex min-h-0 flex-1 flex-col border-slate-200/60 shadow-sm">
              <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                <EventLog entries={eventLog} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '');
}
