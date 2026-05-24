import { useEffect } from 'react';
import { Terminal, X } from 'lucide-react';
import { InspectorPanel } from '@/components/demo-storefront/InspectorPanel';
import { EventLog } from '@/components/demo-storefront/EventLog';
import type {
  DemoRequestSnapshot,
  EventLogEntry,
  IntegrationSessionUpdateResponse,
} from '@/types/integrationApi';

interface BrewlyDevDrawerProps {
  open: boolean;
  onClose: () => void;
  lastRequest: DemoRequestSnapshot | null;
  lastResponse: IntegrationSessionUpdateResponse | null;
  eventLog: EventLogEntry[];
}

export function BrewlyDevDrawer({
  open,
  onClose,
  lastRequest,
  lastResponse,
  eventLog,
}: BrewlyDevDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity ' +
          (open ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={
          'fixed top-0 right-0 z-50 flex h-full w-full max-w-xl flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Terminal className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">BlueMonk Inspector</h2>
              <p className="text-xs text-slate-500">Live request and response from the engine</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            <InspectorPanel request={lastRequest} response={lastResponse} />
          </div>

          {eventLog.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <EventLog entries={eventLog} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
