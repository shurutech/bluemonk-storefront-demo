import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EffectCard } from './EffectCard';
import { CreatedCouponCard } from './CreatedCouponCard';
import { RequestPanel } from './RequestPanel';
import type { DemoRequestSnapshot, IntegrationSessionUpdateResponse } from '@/types/integrationApi';

interface InspectorPanelProps {
  response: IntegrationSessionUpdateResponse | null;
  request: DemoRequestSnapshot | null;
}

type ViewKey = 'effects' | 'campaigns' | 'failures' | 'created' | 'request' | 'raw';

interface ViewMeta {
  label: string;
  description: string;
}

const VIEWS: Record<ViewKey, ViewMeta> = {
  effects: {
    label: 'Effects',
    description:
      'Things the engine decided to do because your rules matched — discounts, free items, accepted coupons, notifications.',
  },
  campaigns: {
    label: 'Campaigns evaluated',
    description:
      'Promotion campaigns that were active and considered against this cart, even if their rules did not all fire.',
  },
  failures: {
    label: 'Rule failures',
    description:
      'Rules whose conditions did not match this cart, so they never ran. Coupon rejections show in Effects, not here — a rejected coupon is a rule that did fire.',
  },
  created: {
    label: 'Coupons created',
    description:
      'Brand-new coupon codes the engine generated this session, with the full code, usage limit, and expiry.',
  },
  request: {
    label: 'API request',
    description:
      'The exact HTTP request being sent to the engine. Click "Copy as cURL" to replay it from a terminal.',
  },
  raw: {
    label: 'Raw response',
    description: 'The full JSON response from the engine, unmodified.',
  },
};

export function InspectorPanel({ response, request }: InspectorPanelProps) {
  const [view, setView] = useState<ViewKey>('effects');
  const effects = response?.effects ?? [];
  const campaigns = response?.triggeredCampaigns ?? [];
  const failures = response?.ruleFailureReasons ?? [];
  const created = response?.createdCoupons ?? [];

  const counts: Partial<Record<ViewKey, number>> = {
    effects: effects.length,
    campaigns: campaigns.length,
    failures: failures.length,
    created: created.length,
  };

  return (
    <div className="space-y-3">
      <Select value={view} onValueChange={v => setView(v as ViewKey)}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(VIEWS) as ViewKey[]).map(key => (
            <SelectItem key={key} value={key}>
              <div className="flex w-full items-center justify-between gap-3">
                <span>{VIEWS[key].label}</span>
                {counts[key] !== undefined && counts[key]! > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                    {counts[key]}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="px-1 text-[11px] leading-relaxed text-slate-500">{VIEWS[view].description}</p>

      <div className="space-y-3">
        {view === 'effects' &&
          (effects.length === 0 ? (
            <Empty
              title="Nothing has triggered yet"
              body="Edit the cart or apply a coupon — the engine will evaluate your rules and the results will appear here."
            />
          ) : (
            effects.map((effect, i) => <EffectCard key={i} effect={effect} />)
          ))}

        {view === 'campaigns' &&
          (campaigns.length === 0 ? (
            <Empty
              title="No campaigns evaluated"
              body="No active campaigns matched this cart. Make sure a campaign is running on this application."
            />
          ) : (
            campaigns.map(campaign => (
              <div
                key={campaign.id}
                className="rounded-md border border-slate-100 bg-slate-50/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{campaign.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {campaign.frontendState || campaign.state}
                  </Badge>
                </div>
                {campaign.startTime && (
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(campaign.startTime).toLocaleDateString()} —{' '}
                    {campaign.endTime
                      ? new Date(campaign.endTime).toLocaleDateString()
                      : 'No end date'}
                  </p>
                )}
              </div>
            ))
          ))}

        {view === 'failures' &&
          (failures.length === 0 ? (
            <Empty
              title="No rule failures"
              body="Every rule that was evaluated passed its conditions. If a coupon was just rejected, the explanation lives under Effects — coupon rejection is itself a rule outcome."
            />
          ) : (
            failures.map((failure, i) => (
              <div key={i} className="rounded-md border border-amber-100 bg-amber-50/50 p-3">
                <p className="text-sm font-medium text-amber-800">{failure.campaignName}</p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Rule <span className="font-mono">{failure.ruleName}</span> didn't fire
                </p>
                <p className="mt-1 text-xs text-amber-600">{failure.details}</p>
              </div>
            ))
          ))}

        {view === 'created' &&
          (created.length === 0 ? (
            <Empty
              title="No coupons generated"
              body="If a rule with a 'create coupon' effect fires, the new code will appear here automatically."
            />
          ) : (
            created.map(coupon => <CreatedCouponCard key={coupon.id} coupon={coupon} />)
          ))}

        {view === 'request' && <RequestPanel request={request} />}

        {view === 'raw' &&
          (response ? (
            <pre className="overflow-auto rounded-md bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <Empty
              title="No response yet"
              body="The engine hasn't been called this session. Update the cart to trigger one."
            />
          ))}
      </div>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{body}</p>
    </div>
  );
}
