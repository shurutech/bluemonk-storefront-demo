import {
  AlertCircle,
  Check,
  Loader2,
  Lock,
  RefreshCw,
  Route,
  ShoppingBag,
  Ticket,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateTime, formatDuration, formatRelative } from '@/lib/journeys';
import type {
  CustomerJourney,
  CustomerJourneyStep,
  JourneyInstanceStatus,
} from '@/types/integrationApi';

interface BrewlyJourneysProps {
  profileId: string;
  customerReady: boolean;
  journeys: CustomerJourney[];
  journeysLoaded: boolean;
  journeysLoading: boolean;
  journeysError: string | null;
  couponCodes: string[];
  onUseVoucher: (code: string) => void;
  onRefresh: () => void;
  onNewCustomer: () => void;
  onBrowse: () => void;
}

const STATUS_META: Record<JourneyInstanceStatus, { label: string; className: string }> = {
  enrolled: { label: 'Enrolled', className: 'border-green-200 bg-green-50 text-green-800' },
  in_progress: { label: 'In progress', className: 'border-green-200 bg-green-50 text-green-800' },
  completed: { label: 'Completed', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  exited: { label: 'Ended', className: 'border-stone-200 bg-stone-100 text-slate-500' },
  cancelled: { label: 'Cancelled', className: 'border-stone-200 bg-stone-100 text-slate-500' },
};

const HOW_TO_ENROLL = [
  { title: 'Sign up', body: 'New customers join sign-up journeys automatically.' },
  { title: 'Place your first order', body: 'Your first checkout unlocks first-purchase journeys.' },
  { title: 'Redeem a qualifying code', body: 'Some journeys start when you use a specific promo.' },
];

export function BrewlyJourneys({
  profileId,
  customerReady,
  journeys,
  journeysLoaded,
  journeysLoading,
  journeysError,
  couponCodes,
  onUseVoucher,
  onRefresh,
  onNewCustomer,
  onBrowse,
}: BrewlyJourneysProps) {
  const settingUp = !customerReady || (!journeysLoaded && journeysLoading);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Brewly journeys
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Your reward journeys</h1>
          <p className="mt-1 text-sm text-slate-500">Redeem each voucher to unlock the next one.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={!customerReady || journeysLoading}
            className="border-stone-200 text-slate-700"
          >
            <RefreshCw className={cn('h-4 w-4', journeysLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={onNewCustomer}
            disabled={!customerReady}
            className="border-stone-200 text-slate-700"
          >
            <UserPlus className="h-4 w-4" />
            New customer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-800">
          {customerReady ? (
            <Check className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {customerReady ? 'Signed in as' : 'Signing up customer…'}
          </p>
          <p className="truncate font-mono text-xs text-slate-500">{profileId}</p>
        </div>
        <p className="text-xs text-slate-400">
          New orders keep this customer · “New customer” signs up a fresh one
        </p>
      </div>

      {journeysError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Couldn't load journeys</p>
            <p className="text-xs text-red-700">{journeysError}</p>
          </div>
        </div>
      )}

      {settingUp ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map(i => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-stone-200 bg-white shadow-sm"
            />
          ))}
        </div>
      ) : journeys.length === 0 ? (
        !journeysError && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-800">
              <Route className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">No journeys yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              You'll see your reward journeys here as soon as you're enrolled.
            </p>
            <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left md:grid-cols-3">
              {HOW_TO_ENROLL.map((item, idx) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                >
                  <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                    Way {idx + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.body}</p>
                </div>
              ))}
            </div>
            <Button onClick={onBrowse} className="mt-6 bg-green-800 text-white hover:bg-green-900">
              <ShoppingBag className="h-4 w-4" />
              Browse the menu
            </Button>
          </div>
        )
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {journeys.map(journey => (
            <JourneyCard
              key={journey.journeyId}
              journey={journey}
              couponCodes={couponCodes}
              onUseVoucher={onUseVoucher}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JourneyCard({
  journey,
  couponCodes,
  onUseVoucher,
}: {
  journey: CustomerJourney;
  couponCodes: string[];
  onUseVoucher: (code: string) => void;
}) {
  const status = STATUS_META[journey.status] ?? STATUS_META.in_progress;
  const completed = journey.steps.filter(s => s.state === 'completed').length;
  const total = journey.totalSteps || journey.steps.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const finished = journey.status !== 'enrolled' && journey.status !== 'in_progress';

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-green-900 to-green-700 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-80">
              Journey{journey.instanceNumber > 1 ? ` · run ${journey.instanceNumber}` : ''}
            </p>
            <h2 className="mt-1 text-lg leading-tight font-bold">{journey.journeyName}</h2>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold',
              status.className
            )}
          >
            {status.label}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-amber-300 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="shrink-0 text-xs font-semibold tabular-nums opacity-90">
            {completed}/{total} redeemed
          </p>
        </div>
      </div>

      <ol className="divide-y divide-stone-100">
        {journey.steps.map(step => (
          <JourneyStepRow
            key={step.position}
            step={step}
            previous={journey.steps.find(s => s.position === step.position - 1)}
            finished={finished}
            inCart={!!step.couponCode && couponCodes.includes(step.couponCode)}
            onUseVoucher={onUseVoucher}
          />
        ))}
      </ol>
    </div>
  );
}

function lockedHint(
  step: CustomerJourneyStep,
  previous: CustomerJourneyStep | undefined,
  finished: boolean
): string {
  if (finished) return 'Not reached';
  if (step.expectedUnlockAt) {
    return `Unlocks ${formatRelative(step.expectedUnlockAt)} · ${formatDateTime(step.expectedUnlockAt)}`;
  }
  if (previous?.state === 'completed') return 'Unlocking soon';
  return previous ? `Unlocks when step ${previous.position} is redeemed` : 'Unlocks soon';
}

function JourneyStepRow({
  step,
  previous,
  finished,
  inCart,
  onUseVoucher,
}: {
  step: CustomerJourneyStep;
  previous: CustomerJourneyStep | undefined;
  finished: boolean;
  inCart: boolean;
  onUseVoucher: (code: string) => void;
}) {
  const isActive = step.state === 'active';
  const isCompleted = step.state === 'completed';

  return (
    <li className={cn('flex gap-4 px-5 py-4', isActive && 'bg-green-50/60')}>
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          isCompleted && 'bg-green-800 text-white',
          isActive && 'bg-green-100 text-green-800',
          !isCompleted && !isActive && 'bg-stone-100 text-slate-400'
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : isActive ? (
          <Ticket className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Step {step.position}
        </p>
        <p
          className={cn(
            'text-sm font-semibold',
            !isCompleted && !isActive ? 'text-slate-500' : 'text-slate-900'
          )}
        >
          {step.rewardLabel ?? `Reward ${step.position}`}
        </p>

        {isCompleted && (
          <p className="mt-0.5 text-xs text-slate-500">
            Redeemed{step.completedAt ? ` · ${formatDateTime(step.completedAt)}` : ''}
            {step.couponCode && (
              <span className="ml-1 font-mono text-slate-400 line-through">{step.couponCode}</span>
            )}
          </p>
        )}

        {isActive && step.couponCode && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-dashed border-green-300 bg-white px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-green-900">
              {step.couponCode}
            </span>
            {step.expiresAt && (
              <span className="text-xs text-slate-500">
                Expires {formatRelative(step.expiresAt)}
              </span>
            )}
            <button
              type="button"
              onClick={() => onUseVoucher(step.couponCode!)}
              disabled={inCart}
              className={cn(
                'ml-auto rounded-full px-3 py-1 text-xs font-bold transition-colors',
                inCart
                  ? 'border border-green-200 bg-white text-green-800'
                  : 'bg-green-800 text-white hover:bg-green-900'
              )}
            >
              {inCart ? '✓ In cart' : 'Use in cart'}
            </button>
          </div>
        )}

        {!isCompleted && !isActive && (
          <p className="mt-0.5 text-xs text-slate-400">
            {lockedHint(step, previous, finished)}
            {!finished && step.validityPeriodSeconds
              ? ` · valid ${formatDuration(step.validityPeriodSeconds)} once unlocked`
              : ''}
          </p>
        )}
      </div>
    </li>
  );
}
