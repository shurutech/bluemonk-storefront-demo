import {
  Bell,
  CheckCircle2,
  Gift,
  Percent,
  Ticket,
  UserCog,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TriggeredEffect } from '@/types/integrationApi';

interface EffectCardProps {
  effect: TriggeredEffect;
}

type Tone = 'green' | 'red' | 'amber' | 'purple' | 'blue' | 'slate';

interface EffectMeta {
  label: string;
  icon: LucideIcon;
  tone: Tone;
  title: (props: Record<string, unknown>) => string;
  body: (props: Record<string, unknown>) => string;
}

const TONE_STYLES: Record<Tone, { card: string; icon: string; pill: string }> = {
  green: {
    card: 'border-emerald-100 bg-emerald-50/50',
    icon: 'bg-emerald-100 text-emerald-700',
    pill: 'bg-emerald-100 text-emerald-700',
  },
  red: {
    card: 'border-red-100 bg-red-50/50',
    icon: 'bg-red-100 text-red-700',
    pill: 'bg-red-100 text-red-700',
  },
  amber: {
    card: 'border-amber-100 bg-amber-50/50',
    icon: 'bg-amber-100 text-amber-700',
    pill: 'bg-amber-100 text-amber-700',
  },
  purple: {
    card: 'border-violet-100 bg-violet-50/50',
    icon: 'bg-violet-100 text-violet-700',
    pill: 'bg-violet-100 text-violet-700',
  },
  blue: {
    card: 'border-sky-100 bg-sky-50/50',
    icon: 'bg-sky-100 text-sky-700',
    pill: 'bg-sky-100 text-sky-700',
  },
  slate: {
    card: 'border-slate-200 bg-slate-50/50',
    icon: 'bg-slate-100 text-slate-700',
    pill: 'bg-slate-100 text-slate-700',
  },
};

const EFFECT_META: Record<string, EffectMeta> = {
  setDiscount: {
    label: 'Discount applied',
    icon: Percent,
    tone: 'green',
    title: p => `$${Number(p.value ?? 0).toFixed(2)} off`,
    body: p => `${(p.name as string) || 'A discount'} was applied to the customer's order.`,
  },
  setDiscountAdditionalCost: {
    label: 'Add-on discount applied',
    icon: Percent,
    tone: 'green',
    title: p => `$${Number(p.value ?? 0).toFixed(2)} off add-on`,
    body: p =>
      `${(p.name as string) || 'A discount'} was applied to an additional cost (e.g. shipping).`,
  },
  acceptCoupon: {
    label: 'Coupon accepted',
    icon: CheckCircle2,
    tone: 'green',
    title: p => (p.value ? `Code ${p.value} is valid` : 'The coupon is valid'),
    body: () =>
      "The customer's coupon code passed all validation rules and was applied to the cart.",
  },
  rejectCoupon: {
    label: 'Coupon rejected',
    icon: XCircle,
    tone: 'red',
    title: p => (p.value ? `Code ${p.value} was rejected` : 'The coupon was not applied'),
    body: p => describeRejection(p),
  },
  addFreeItem: {
    label: 'Free item added',
    icon: Gift,
    tone: 'purple',
    title: p => String(p.name || p.sku || 'Free item'),
    body: () => 'A complimentary product was added to the cart at no cost.',
  },
  createNotification: {
    label: 'Customer notified',
    icon: Bell,
    tone: 'blue',
    title: p => String(p.title || p.name || 'Notification queued'),
    body: p => String(p.message || 'A notification was queued to be sent to the customer.'),
  },
  createCoupon: {
    label: 'New coupon generated',
    icon: Ticket,
    tone: 'amber',
    title: () => 'A new coupon was issued',
    body: p =>
      p.couponPattern
        ? `Generated a fresh coupon code using the pattern ${p.couponPattern}. The full code appears in the Created tab.`
        : 'A new coupon code was issued for this customer. See the Created tab for details.',
  },
  updateAttributeValue: {
    label: 'Profile updated',
    icon: UserCog,
    tone: 'slate',
    title: p => String(p.attributeName || 'Customer attribute updated'),
    body: p =>
      `Set ${(p.attributeName as string) || 'an attribute'} to ${
        p.value === undefined ? 'a new value' : JSON.stringify(p.value)
      }.`,
  },
};

// Engine rejection reason enum → plain-English explanation.
// Source: internal/enums/coupon.go (CouponRejectionReason).
const REJECTION_REASONS: Record<string, string> = {
  CouponNotFound: 'No coupon with that code exists for this application.',
  CouponRecipientDoesNotMatch:
    'This code was reserved for a different customer and cannot be redeemed by this one.',
  CouponReservationRequired: 'This code must be reserved for a customer before it can be redeemed.',
  CouponStartDateInFuture: "It's too early to use this code — its start date hasn't arrived yet.",
  CouponExpired: 'This code is past its expiry date.',
  CouponLimitReached: 'This code has reached its overall redemption limit and is no longer valid.',
  ProfileLimitReached:
    'This customer has already redeemed this code as many times as the per-customer limit allows.',
  CouponRejectedByCondition:
    "The cart did not meet this rule's conditions, so the code was not accepted.",
};

function describeRejection(props: Record<string, unknown>): string {
  const reason = typeof props.rejectionReason === 'string' ? props.rejectionReason : '';
  const details = typeof props.details === 'string' ? props.details : '';
  const human = REJECTION_REASONS[reason];
  if (human && details) return `${human} (${details})`;
  if (human) return human;
  if (details) return details;
  return "The coupon couldn't be applied to this cart.";
}

const FALLBACK_META: EffectMeta = {
  label: 'Effect triggered',
  icon: CheckCircle2,
  tone: 'slate',
  title: () => 'A rule effect was triggered',
  body: p => JSON.stringify(p),
};

export function EffectCard({ effect }: EffectCardProps) {
  const meta = EFFECT_META[effect.effectType] || FALLBACK_META;
  const tone = TONE_STYLES[meta.tone];
  const Icon = meta.icon;

  return (
    <div className={cn('rounded-md border p-3', tone.card)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            tone.icon
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                tone.pill
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{meta.title(effect.props || {})}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            {meta.body(effect.props || {})}
          </p>
          {effect.ruleName && (
            <p className="mt-2 border-t border-slate-200/60 pt-2 text-[11px] text-slate-400">
              Triggered by rule <span className="font-mono text-slate-500">{effect.ruleName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
