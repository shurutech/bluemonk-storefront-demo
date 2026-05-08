import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { DemoSessionState } from '@/types/integrationApi';

interface CartSummaryProps {
  subtotal: number;
  discountTotal: number;
  sessionTotal: number | null;
  sessionState: DemoSessionState;
  isLoading: boolean;
  onCheckout: () => void;
  onCancel: () => void;
  onNewSession: () => void;
}

const STATE_STYLES: Record<DemoSessionState, string> = {
  open: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-slate-50 text-slate-700 border-slate-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export function CartSummary({
  subtotal,
  discountTotal,
  sessionTotal,
  sessionState,
  isLoading,
  onCheckout,
  onCancel,
  onNewSession,
}: CartSummaryProps) {
  // The engine returns sessionTotal as the pre-discount cart total;
  // discounts come as separate effects we subtract here. Floor at 0 so a
  // discount larger than the cart never shows a negative total.
  const baseTotal = sessionTotal ?? subtotal;
  const displayTotal = Math.max(0, baseTotal - discountTotal);
  const isSessionEnded = sessionState === 'closed' || sessionState === 'cancelled';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">Session</span>
        <Badge variant="outline" className={STATE_STYLES[sessionState]}>
          {sessionState}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600">-${discountTotal.toFixed(2)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>${displayTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {isSessionEnded ? (
          <Button variant="primary" className="w-full" onClick={onNewSession} disabled={isLoading}>
            New session
          </Button>
        ) : (
          <>
            <Button variant="primary" className="w-full" onClick={onCheckout} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Checkout'
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel session
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
