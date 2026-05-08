import { useState } from 'react';
import { Check, Copy, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CreatedCoupon } from '@/types/integrationApi';

interface CreatedCouponCardProps {
  coupon: CreatedCoupon;
}

export function CreatedCouponCard({ coupon }: CreatedCouponCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Badge
            variant="outline"
            className="mb-2 border-amber-200 bg-amber-50 text-xs text-amber-700"
          >
            <Ticket className="mr-1 h-3 w-3" />
            New Coupon
          </Badge>
          <div className="flex items-center gap-2">
            <code className="rounded bg-white px-2 py-1 font-mono text-sm font-medium text-amber-900">
              {coupon.value}
            </code>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              className="text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              aria-label="Copy coupon code"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-amber-800">
            <span>
              Usage: {coupon.usageCounter}/{coupon.usageLimit || '∞'}
            </span>
            {coupon.endTime && (
              <span>Expires: {new Date(coupon.endTime).toLocaleDateString()}</span>
            )}
            {coupon.recipientIntegrationId && (
              <span className="col-span-2 truncate">
                Recipient: <span className="font-mono">{coupon.recipientIntegrationId}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
