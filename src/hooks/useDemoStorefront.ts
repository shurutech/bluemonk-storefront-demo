import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IntegrationApiError,
  integrationApiEndpoints,
  integrationApiFetch,
} from '@/api/integrationClient';
import { DEFAULT_DEMO_CART } from '@/data/demoCart';
import type {
  DemoCartItem,
  DemoFreeItem,
  DemoRequestSnapshot,
  DemoSessionState,
  DemoStorefrontConfig,
  EventLogEntry,
  IntegrationSessionUpdateBody,
  IntegrationSessionUpdateResponse,
  SessionCartItem,
} from '@/types/integrationApi';

const CONFIG_STORAGE_KEY = 'bluemonk_demo_storefront_config';
const AUTO_UPDATE_DEBOUNCE_MS = 400;

function loadConfig(): DemoStorefrontConfig | null {
  try {
    const raw = sessionStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoStorefrontConfig) : null;
  } catch {
    return null;
  }
}

function saveConfig(config: DemoStorefrontConfig) {
  sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

function clearStoredConfig() {
  sessionStorage.removeItem(CONFIG_STORAGE_KEY);
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toSessionItems(items: DemoCartItem[]): SessionCartItem[] {
  return items.map(item => ({
    sku: item.sku,
    quantity: item.quantity,
    price: item.price,
    product: { name: item.name },
    ...(item.attributes ? { attributes: item.attributes } : {}),
  }));
}

function buildRequestSnapshot(args: {
  apiBaseUrl: string;
  apiKey: string;
  integrationId: string;
  body: IntegrationSessionUpdateBody;
}): DemoRequestSnapshot {
  return {
    method: 'PUT',
    url: `${args.apiBaseUrl.replace(/\/$/, '')}${integrationApiEndpoints.sessions.upsert(args.integrationId)}`,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': args.apiKey,
    },
    body: args.body,
  };
}

export function useDemoStorefront() {
  const [config, setConfig] = useState<DemoStorefrontConfig | null>(loadConfig);
  const [cartItems, setCartItems] = useState<DemoCartItem[]>(() => [...DEFAULT_DEMO_CART]);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [sessionIntegrationId, setSessionIntegrationId] = useState(() =>
    generateId('demo-session')
  );
  const [profileId, setProfileId] = useState(() => generateId('demo-customer'));
  const [sessionState, setSessionState] = useState<DemoSessionState>('open');
  const [lastResponse, setLastResponse] = useState<IntegrationSessionUpdateResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<DemoRequestSnapshot | null>(null);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSequence = useRef(0);

  useEffect(() => {
    if (config) saveConfig(config);
  }, [config]);

  const addLogEntry = useCallback(
    (action: string, status: 'success' | 'error', detail?: string) => {
      setEventLog(prev => [
        {
          id: generateId('log'),
          timestamp: new Date().toISOString(),
          action,
          status,
          detail,
        },
        ...prev,
      ]);
    },
    []
  );

  const configure = useCallback((next: DemoStorefrontConfig) => {
    setConfig(next);
    saveConfig(next);
  }, []);

  const resetConfig = useCallback(() => {
    clearStoredConfig();
    setConfig(null);
    setLastResponse(null);
    setLastRequest(null);
    setEventLog([]);
    setCouponCodes([]);
    setSessionState('open');
    setSessionIntegrationId(generateId('demo-session'));
    setProfileId(generateId('demo-customer'));
    setCartItems([...DEFAULT_DEMO_CART]);
  }, []);

  const sendSession = useCallback(
    async (
      args: {
        nextState?: DemoSessionState;
        nextCoupons?: string[];
        nextItems?: DemoCartItem[];
        actionLabel?: string;
      } = {}
    ) => {
      if (!config) return;

      const stateToSend = args.nextState ?? sessionState;
      const couponsToSend = args.nextCoupons ?? couponCodes;
      const itemsToSend = args.nextItems ?? cartItems;

      const body: IntegrationSessionUpdateBody = {
        customerSession: {
          state: stateToSend,
          profileId,
          couponCodes: couponsToSend,
          cartItems: toSessionItems(itemsToSend),
        },
        responseContent: ['triggeredCampaigns', 'effects', 'coupons', 'ruleFailureReasons'],
      };

      const snapshot = buildRequestSnapshot({
        apiBaseUrl: config.apiBaseUrl,
        apiKey: config.apiKey,
        integrationId: sessionIntegrationId,
        body,
      });
      setLastRequest(snapshot);

      const seq = ++requestSequence.current;
      setIsLoading(true);

      try {
        const response = await integrationApiFetch<IntegrationSessionUpdateResponse>(
          config.apiBaseUrl,
          integrationApiEndpoints.sessions.upsert(sessionIntegrationId),
          config.apiKey,
          {
            method: 'PUT',
            body: JSON.stringify(body),
          }
        );

        // Drop out-of-order responses caused by debounced rapid edits.
        if (seq !== requestSequence.current) return;

        setLastResponse(response);
        if (args.nextState) setSessionState(args.nextState);
        const effectCount = response.effects?.length ?? 0;
        const campaignCount = response.triggeredCampaigns?.length ?? 0;
        const detail =
          effectCount === 0 && campaignCount === 0
            ? 'No rules triggered'
            : `${effectCount} ${effectCount === 1 ? 'rule fired' : 'rules fired'} across ${campaignCount} ${campaignCount === 1 ? 'campaign' : 'campaigns'}`;
        addLogEntry(args.actionLabel ?? 'Session update', 'success', detail);
        return response;
      } catch (err) {
        if (seq !== requestSequence.current) return;
        const message =
          err instanceof IntegrationApiError
            ? `${err.status}: ${err.message}`
            : err instanceof Error
              ? err.message
              : 'Failed to call Integration API';
        addLogEntry(args.actionLabel ?? 'Session update', 'error', message);
        throw err;
      } finally {
        if (seq === requestSequence.current) setIsLoading(false);
      }
    },
    [config, cartItems, couponCodes, profileId, sessionIntegrationId, sessionState, addLogEntry]
  );

  // Debounced auto-update on cart / coupon changes while the session is open.
  useEffect(() => {
    if (!config) return;
    if (sessionState !== 'open') return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      sendSession({ actionLabel: 'Auto update' }).catch(() => {
        // already logged via addLogEntry
      });
    }, AUTO_UPDATE_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, couponCodes, config, sessionState]);

  const validateApiKey = useCallback(
    async (apiBaseUrl: string, apiKey: string): Promise<boolean> => {
      try {
        await integrationApiFetch(
          apiBaseUrl,
          integrationApiEndpoints.sessions.upsert(generateId('validate'), true),
          apiKey,
          {
            method: 'PUT',
            body: JSON.stringify({
              customerSession: {
                state: 'open',
                profileId: generateId('validate-profile'),
                cartItems: [],
              },
              responseContent: [],
            }),
          }
        );
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const upsertSession = useCallback(
    () => sendSession({ actionLabel: 'Manual update' }),
    [sendSession]
  );

  const checkout = useCallback(
    () => sendSession({ nextState: 'closed', actionLabel: 'Checkout' }),
    [sendSession]
  );

  const cancelSession = useCallback(
    () => sendSession({ nextState: 'cancelled', actionLabel: 'Cancel session' }),
    [sendSession]
  );

  // New Session keeps the same customer (profileId) so per-customer redemption
  // limits, lifetime usage counters, and customer attributes persist across
  // demo carts. To start as a brand-new customer, use Reconfigure.
  const newSession = useCallback(() => {
    setSessionIntegrationId(generateId('demo-session'));
    setSessionState('open');
    setCouponCodes([]);
    setLastResponse(null);
    setLastRequest(null);
    addLogEntry('New session', 'success', 'New cart, same customer');
  }, [addLogEntry]);

  const newCustomer = useCallback(() => {
    setProfileId(generateId('demo-customer'));
    setSessionIntegrationId(generateId('demo-session'));
    setSessionState('open');
    setCouponCodes([]);
    setLastResponse(null);
    setLastRequest(null);
    addLogEntry('New customer', 'success', 'Fresh customer profile');
  }, [addLogEntry]);

  const addCartItem = useCallback((item: DemoCartItem) => {
    setCartItems(prev => [...prev, item]);
  }, []);

  const removeCartItem = useCallback((sku: string) => {
    setCartItems(prev => prev.filter(item => item.sku !== sku));
  }, []);

  const updateCartItem = useCallback((sku: string, updates: Partial<DemoCartItem>) => {
    setCartItems(prev => prev.map(item => (item.sku === sku ? { ...item, ...updates } : item)));
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed || couponCodes.includes(trimmed)) return;
      setCouponCodes(prev => [...prev, trimmed]);
    },
    [couponCodes]
  );

  const removeCoupon = useCallback((code: string) => {
    setCouponCodes(prev => prev.filter(c => c !== code));
  }, []);

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountTotal =
    lastResponse?.effects
      ?.filter(e => e.effectType === 'setDiscount' || e.effectType === 'setDiscountAdditionalCost')
      .reduce((sum, e) => sum + (Number(e.props?.value) || 0), 0) ?? 0;

  const freeItems: DemoFreeItem[] =
    lastResponse?.effects
      ?.filter(e => e.effectType === 'addFreeItem')
      .map(e => {
        const props = e.props as {
          sku?: string;
          name?: string;
          desiredQuantity?: number;
        };
        return {
          sku: props.sku ?? '',
          discountName: props.name ?? 'FREE',
          quantity: props.desiredQuantity ?? 1,
        };
      })
      .filter(item => item.sku !== '') ?? [];

  return {
    // config
    config,
    configure,
    resetConfig,
    validateApiKey,
    // cart
    cartItems,
    addCartItem,
    removeCartItem,
    updateCartItem,
    cartSubtotal,
    discountTotal,
    freeItems,
    // coupons
    couponCodes,
    applyCoupon,
    removeCoupon,
    // session
    sessionIntegrationId,
    profileId,
    sessionState,
    upsertSession,
    checkout,
    cancelSession,
    newSession,
    newCustomer,
    // observability
    lastResponse,
    lastRequest,
    eventLog,
    isLoading,
  };
}
