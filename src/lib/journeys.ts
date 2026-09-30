import type { CustomerJourney, CustomerJourneyStep, JourneyUpdate } from '@/types/integrationApi';

// Compare two snapshots of GET /v1/customers/{id}/journeys and describe what
// changed. The engine's enrollInJourney effect only means an entry rule fired —
// the precise trigger check (first purchase, qualifying coupon) happens after —
// so the snapshot diff is the only reliable signal that something moved.
export function diffJourneys(before: CustomerJourney[], after: CustomerJourney[]): JourneyUpdate[] {
  const updates: JourneyUpdate[] = [];
  const previous = new Map(before.map(j => [j.journeyId, j]));

  for (const journey of after) {
    const base = { journeyId: journey.journeyId, journeyName: journey.journeyName };
    const prior = previous.get(journey.journeyId);

    if (!prior || journey.instanceNumber > prior.instanceNumber) {
      const firstActive = journey.steps.find(s => s.state === 'active');
      updates.push({
        ...base,
        kind: 'enrolled',
        message: firstActive
          ? `Enrolled · step ${firstActive.position} voucher is ready`
          : 'Enrolled · first voucher unlocks soon',
      });
      continue;
    }

    const priorSteps = new Map(prior.steps.map(s => [s.position, s]));
    for (const step of journey.steps) {
      const was = priorSteps.get(step.position)?.state;
      if (step.state === 'completed' && was !== 'completed') {
        updates.push({ ...base, kind: 'stepCompleted', message: `Step ${step.position} redeemed` });
      } else if (step.state === 'active' && was !== 'active') {
        updates.push({
          ...base,
          kind: 'stepUnlocked',
          message: `Step ${step.position} voucher unlocked`,
        });
      }
    }

    if (journey.status !== prior.status) {
      if (journey.status === 'completed') {
        updates.push({ ...base, kind: 'completed', message: 'Journey completed' });
      } else if (journey.status === 'exited') {
        updates.push({ ...base, kind: 'exited', message: 'Journey ended' });
      }
    }
  }

  return updates;
}

// Collapse per-step updates into one line per journey, for toasts.
export function groupJourneyUpdates(
  updates: JourneyUpdate[]
): Array<{ journeyId: number; journeyName: string; message: string }> {
  const grouped = new Map<number, { journeyId: number; journeyName: string; parts: string[] }>();
  for (const u of updates) {
    const entry = grouped.get(u.journeyId) ?? {
      journeyId: u.journeyId,
      journeyName: u.journeyName,
      parts: [],
    };
    entry.parts.push(u.message);
    grouped.set(u.journeyId, entry);
  }
  return [...grouped.values()].map(g => ({
    journeyId: g.journeyId,
    journeyName: g.journeyName,
    message: g.parts.join(' · '),
  }));
}

export function activeJourneyVouchers(
  journeys: CustomerJourney[]
): Array<{ journey: CustomerJourney; step: CustomerJourneyStep & { couponCode: string } }> {
  return journeys.flatMap(journey =>
    journey.steps
      .filter(
        (s): s is CustomerJourneyStep & { couponCode: string } =>
          s.state === 'active' && !!s.couponCode
      )
      .map(step => ({ journey, step }))
  );
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// "in 6 days", "in 3 hours", "in 12 minutes" — for voucher expiry / unlock hints.
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diffMs = new Date(iso).getTime() - now;
  const past = diffMs < 0;
  const minutes = Math.round(Math.abs(diffMs) / 60_000);
  let text: string;
  if (minutes < 1) text = 'less than a minute';
  else if (minutes < 60) text = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  else if (minutes < 60 * 24) {
    const hours = Math.round(minutes / 60);
    text = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    const days = Math.round(minutes / (60 * 24));
    text = `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  return past ? `${text} ago` : `in ${text}`;
}

export function formatDuration(seconds: number): string {
  const days = Math.round(seconds / 86_400);
  if (days >= 1) return `${days} ${days === 1 ? 'day' : 'days'}`;
  const hours = Math.max(1, Math.round(seconds / 3_600));
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}
