import { useState } from 'react';
import { Coffee, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BREWLY_BRAND } from '@/data/brewlyMenu';
import type { DemoStorefrontConfig } from '@/types/integrationApi';

interface BrewlySetupProps {
  onConnect: (config: DemoStorefrontConfig) => Promise<void> | void;
  validateApiKey: (apiBaseUrl: string, apiKey: string) => Promise<boolean>;
}

export function BrewlySetup({ onConnect, validateApiKey }: BrewlySetupProps) {
  const [apiBaseUrl, setApiBaseUrl] = useState('/api');
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleConnect = async () => {
    if (!apiBaseUrl.trim() || !apiKey.trim()) {
      toast.error('Both fields are required');
      return;
    }
    setIsValidating(true);
    const ok = await validateApiKey(apiBaseUrl.trim(), apiKey.trim());
    setIsValidating(false);
    if (!ok) {
      toast.error('Could not reach the Integration API. Check the URL and key.');
      return;
    }
    await onConnect({ apiBaseUrl: apiBaseUrl.trim(), apiKey: apiKey.trim() });
    toast.success(`Connected to ${BREWLY_BRAND.name}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 via-white to-green-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-800 text-white shadow-lg">
            <Coffee className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-4xl font-black tracking-tight text-slate-900">
            {BREWLY_BRAND.name.toLowerCase()}
          </h1>
          <p className="text-sm text-slate-500">{BREWLY_BRAND.tagline}</p>
        </div>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Connect to BlueMonk
          </p>
          <p className="mt-1 mb-5 text-xs text-slate-500">
            Paste your Integration API base URL and key. Brewly will sync the cart to your
            campaigns and rules in real time.
          </p>

          <label className="block text-xs font-medium text-slate-700">API base URL</label>
          <Input
            value={apiBaseUrl}
            onChange={e => setApiBaseUrl(e.target.value)}
            placeholder="/api"
            className="mt-1 mb-3"
          />

          <label className="block text-xs font-medium text-slate-700">Integration API key</label>
          <Input
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="bm_..."
            type="password"
            className="mt-1"
          />

          <Button
            onClick={handleConnect}
            disabled={isValidating}
            className="mt-5 w-full bg-green-800 text-white hover:bg-green-900"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              'Connect'
            )}
          </Button>

          <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
            Hosted demos use <code className="rounded bg-stone-100 px-1 py-0.5 font-mono">/api</code> as the
            base URL — Netlify proxies to the deployed backend so no CORS change is needed. For
            local dev, paste{' '}
            <code className="rounded bg-stone-100 px-1 py-0.5 font-mono">http://localhost:8080/api</code>.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Internal demo · Not a real customer app
        </p>
      </div>
    </div>
  );
}
