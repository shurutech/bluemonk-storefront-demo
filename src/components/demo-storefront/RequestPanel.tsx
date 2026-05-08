import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DemoRequestSnapshot } from '@/types/integrationApi';

interface RequestPanelProps {
  request: DemoRequestSnapshot | null;
}

function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

function buildCurl(request: DemoRequestSnapshot): string {
  const headerLines = Object.entries(request.headers)
    .map(([k, v]) => `  -H '${k}: ${v}'`)
    .join(' \\\n');
  const bodyJson = JSON.stringify(request.body, null, 2).replace(/'/g, "'\\''");
  return `curl -X ${request.method} '${request.url}' \\\n${headerLines} \\\n  -d '${bodyJson}'`;
}

export function RequestPanel({ request }: RequestPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!request) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        No request sent yet. Update the cart to see the request.
      </p>
    );
  }

  const maskedHeaders: Record<string, string> = {
    ...request.headers,
    'X-API-Key': maskApiKey(request.headers['X-API-Key'] || ''),
  };

  const handleCopyCurl = async () => {
    try {
      // Use the unmasked key in the cURL so it actually runs.
      await navigator.clipboard.writeText(buildCurl(request));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Terminal className="h-3.5 w-3.5" />
          Outgoing request
        </div>
        <Button variant="outline" size="sm" onClick={handleCopyCurl} className="h-7 text-xs">
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" />
              Copy as cURL
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/60 p-3 text-xs">
        <div className="flex items-baseline gap-2">
          <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-amber-800">
            {request.method}
          </span>
          <span className="font-mono break-all text-slate-700">{request.url}</span>
        </div>

        <div className="space-y-0.5 border-t border-slate-200 pt-2 font-mono text-[11px] text-slate-600">
          {Object.entries(maskedHeaders).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-slate-400">{k}:</span>
              <span className="break-all">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <pre className="overflow-auto rounded-md bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100">
        {JSON.stringify(request.body, null, 2)}
      </pre>
    </div>
  );
}
