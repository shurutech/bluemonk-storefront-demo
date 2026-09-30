import { Loader2, Route, UserRound } from 'lucide-react';
import { EffectCard } from '@/components/demo-storefront/EffectCard';
import type { CustomerJourney, IntegrationCustomerUpsertResponse } from '@/types/integrationApi';

interface BrewlyCustomerInspectorProps {
  profileId: string;
  customerReady: boolean;
  lastSignupResponse: IntegrationCustomerUpsertResponse | null;
  journeys: CustomerJourney[];
}

// Dev-drawer panel for the customer the storefront is acting as: what the
// sign-up call triggered and the raw journey view the Journeys tab renders.
export function BrewlyCustomerInspector({
  profileId,
  customerReady,
  lastSignupResponse,
  journeys,
}: BrewlyCustomerInspectorProps) {
  const signupEffects = lastSignupResponse?.effects ?? [];

  return (
    <div className="space-y-3 p-2">
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <UserRound className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800">Customer</p>
          <p className="truncate font-mono text-[11px] text-slate-500">{profileId}</p>
        </div>
        {!customerReady && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      </div>

      <div className="space-y-2">
        <p className="px-1 text-[11px] leading-relaxed text-slate-500">
          <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-amber-800">
            PUT
          </span>{' '}
          <span className="font-mono">/v1/customers/{'{id}'}?runRuleEngine=true</span> — sign-up. A
          first-time customer fires customerProfileCreated, which enrolls sign-up journeys.
        </p>
        {signupEffects.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 p-3 text-xs text-slate-500">
            {customerReady ? 'No sign-up rules fired for this customer.' : 'Signing up…'}
          </div>
        ) : (
          signupEffects.map((effect, i) => <EffectCard key={i} effect={effect} />)
        )}
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-3">
        <p className="flex items-center gap-1.5 px-1 text-[11px] leading-relaxed text-slate-500">
          <Route className="h-3.5 w-3.5 text-slate-400" />
          <span className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-sky-800">
            GET
          </span>
          <span className="font-mono">/v1/customers/{'{id}'}/journeys</span>
          <span className="ml-auto shrink-0">
            {journeys.length} {journeys.length === 1 ? 'journey' : 'journeys'}
          </span>
        </p>
        <details className="group">
          <summary className="cursor-pointer px-1 text-[11px] font-medium text-slate-600 hover:text-slate-900">
            Raw response
          </summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
            {JSON.stringify({ journeys }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
