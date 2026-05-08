import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import type { EventLogEntry } from '@/types/integrationApi';

interface EventLogProps {
  entries: EventLogEntry[];
}

export function EventLog({ entries }: EventLogProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  if (entries.length === 0) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <span>Event Log ({entries.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {isExpanded && (
        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {entries.map(entry => (
            <li key={entry.id} className="flex items-start gap-2 px-4 py-2.5 text-xs">
              {entry.status === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-slate-700">{entry.action}</span>
                  <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {entry.detail && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                    {entry.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
