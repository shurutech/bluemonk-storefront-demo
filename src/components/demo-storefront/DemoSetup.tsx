import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Eye, EyeOff, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/common/FormField';
import { getDefaultIntegrationApiBaseUrl } from '@/api/integrationClient';
import type { DemoStorefrontConfig } from '@/types/integrationApi';

interface DemoSetupProps {
  onConnect: (config: DemoStorefrontConfig) => Promise<void> | void;
  validateApiKey: (apiBaseUrl: string, apiKey: string) => Promise<boolean>;
}

interface SetupFormData {
  apiBaseUrl: string;
  apiKey: string;
}

export function DemoSetup({ onConnect, validateApiKey }: DemoSetupProps) {
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<SetupFormData>({
    mode: 'onSubmit',
    defaultValues: {
      apiBaseUrl: getDefaultIntegrationApiBaseUrl(),
      apiKey: '',
    },
  });

  const apiKeyValue = useWatch({ control, name: 'apiKey' });
  const apiBaseUrlValue = useWatch({ control, name: 'apiBaseUrl' });

  const onSubmit = async (data: SetupFormData) => {
    const trimmedUrl = data.apiBaseUrl.trim().replace(/\/$/, '');
    setIsValidating(true);
    try {
      const isValid = await validateApiKey(trimmedUrl, data.apiKey);
      if (!isValid) {
        setError('apiKey', {
          message: "Couldn't connect — check the API base URL and API key.",
        });
        return;
      }

      await onConnect({
        apiBaseUrl: trimmedUrl,
        apiKey: data.apiKey,
      });
      toast.success('Connected to BlueMonk Integration API');
    } catch {
      toast.error('Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg border-slate-200/60 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Demo Storefront</CardTitle>
          <CardDescription>
            Connect to a BlueMonk Integration API to simulate a customer cart against a live
            promotion engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="BlueMonk API base URL"
              name="apiBaseUrl"
              error={errors.apiBaseUrl?.message}
            >
              <Input
                {...register('apiBaseUrl', {
                  required: 'API base URL is required',
                })}
                placeholder="https://api.bluemonk.example.com"
                className="font-mono text-sm"
              />
            </FormField>

            <FormField label="Integration API Key" name="apiKey" error={errors.apiKey?.message}>
              <div className="relative">
                <Input
                  {...register('apiKey', { required: 'API key is required' })}
                  type={showKey ? 'text' : 'password'}
                  placeholder="Paste an Integration API key"
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!apiKeyValue?.trim() || !apiBaseUrlValue?.trim() || isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>

            <p className="text-center text-xs text-slate-400">
              The API key is scoped to a single application within a tenant. Generate one in the
              BlueMonk admin app under that application's Integration API Keys settings.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
