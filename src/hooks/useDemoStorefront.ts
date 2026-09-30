import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IntegrationApiError,
  integrationApiEndpoints,
  integrationApiFetch,
} from '@/api/integrationClient';
import { DEFAULT_DEMO_CART } from '@/data/demoCart';
import { diffJourneys } from '@/lib/journeys';
import type {
  CustomerJourney,
  CustomerJourneysResponse,
  DemoCartItem,
  DemoFreeItem,
  DemoRequestSnapshot,
  DemoSessionState,
  DemoStorefrontConfig,
  EventLogEntry,
  IntegrationCustomerUpsertBody,
  IntegrationCustomerUpsertResponse,
  IntegrationSessionUpdateBody,
  IntegrationSessionUpdateResponse,
  JourneyUpdate,
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

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof IntegrationApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return fallback;
}

export interface JourneyUpdateBatch {
  id: number;
  source: 'signup' | 'checkout' | 'refresh';
  updates: JourneyUpdate[];
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

  // Customer + journeys. A fresh profileId is "signed up" (customer upsert with
  // the rule engine) before its first session call, so user_signed_up journeys
  // can enroll it — a session upsert would otherwise create the customer silently.
  const [customerReady, setCustomerReady] = useState(false);
  const [lastSignupResponse, setLastSignupResponse] =
    useState<IntegrationCustomerUpsertResponse | null>(null);
  const [journeys, setJourneys] = useState<CustomerJourney[]>([]);
  const [journeysLoaded, setJourneysLoaded] = useState(false);
  const [journeysLoading, setJourneysLoading] = useState(false);
  const [journeysError, setJourneysError] = useState<string | null>(null);
  const [lastJourneyUpdates, setLastJourneyUpdates] = useState<JourneyUpdate[]>([]);
  const [journeyUpdateBatch, setJourneyUpdateBatch] = useState<JourneyUpdateBatch | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSequence = useRef(0);
  const journeysRef = useRef<CustomerJourney[]>([]);
  const journeysProfileRef = useRef(profileId);
  const journeyBatchSequence = useRef(0);

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

  // Switch to a brand-new customer: drop everything known about the previous
  // one. The sign-up effect below picks up the new profileId.
  const startNewCustomer = useCallback(() => {
    const next = generateId('demo-customer');
    journeysProfileRef.current = next;
    journeysRef.current = [];
    setProfileId(next);
    setCustomerReady(false);
    setLastSignupResponse(null);
    setJourneys([]);
    setJourneysLoaded(false);
    setJourneysLoading(false);
    setJourneysError(null);
    setLastJourneyUpdates([]);
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
    startNewCustomer();
    setCartItems([...DEFAULT_DEMO_CART]);
  }, [startNewCustomer]);

  const publishJourneyUpdates = useCallback(
    (source: JourneyUpdateBatch['source'], updates: JourneyUpdate[]) => {
      if (source === 'checkout') setLastJourneyUpdates(updates);
      if (updates.length === 0) return;
      setJourneyUpdateBatch({ id: ++journeyBatchSequence.current, source, updates });
    },
    []
  );

  // Fetch the customer's journeys and diff against the previous snapshot. A 404
  // means the customer doesn't exist yet (or the backend predates journeys) —
  // either way there is nothing to show, so it is treated as an empty list.
  const loadJourneys = useCallback(
    async (
      source: JourneyUpdateBatch['source'],
      forProfileId: string = profileId
    ): Promise<JourneyUpdate[]> => {
      if (!config) return [];
      setJourneysLoading(true);
      try {
        let next: CustomerJourney[];
        try {
          const response = await integrationApiFetch<CustomerJourneysResponse>(
            config.apiBaseUrl,
            integrationApiEndpoints.customers.journeys(forProfileId),
            config.apiKey
          );
          next = response?.journeys ?? [];
        } catch (err) {
          if (err instanceof IntegrationApiError && err.status === 404) {
            next = [];
          } else {
            throw err;
          }
        }

        // The customer changed while this request was in flight — drop it.
        if (journeysProfileRef.current !== forProfileId) return [];

        const updates = diffJourneys(journeysRef.current, next);
        journeysRef.current = next;
        setJourneys(next);
        setJourneysLoaded(true);
        setJourneysError(null);
        publishJourneyUpdates(source, updates);
        return updates;
      } catch (err) {
        if (journeysProfileRef.current !== forProfileId) return [];
        const message = errorMessage(err, 'Failed to load journeys');
        setJourneysError(message);
        addLogEntry('Load journeys', 'error', message);
        return [];
      } finally {
        if (journeysProfileRef.current === forProfileId) setJourneysLoading(false);
      }
    },
    [config, profileId, addLogEntry, publishJourneyUpdates]
  );

  // Sign up every new customer. Runs on connect, reconfigure, reload and "New
  // customer". Session calls wait for this (customerReady) so the customer is
  // created by the sign-up — firing customerProfileCreated — not by a session.
  useEffect(() => {
    if (!config) return;

    let cancelled = false;
    (async () => {
      const body: IntegrationCustomerUpsertBody = {
        attributes: {},
        responseContent: ['triggeredCampaigns'],
      };
      try {
        const response = await integrationApiFetch<IntegrationCustomerUpsertResponse>(
          config.apiBaseUrl,
          integrationApiEndpoints.customers.upsert(profileId),
          config.apiKey,
          { method: 'PUT', body: JSON.stringify(body) }
        );
        if (cancelled) return;
        setLastSignupResponse(response);
        const entryRules = (response?.effects ?? []).filter(
          e => e.effectType === 'enrollInJourney'
        ).length;
        addLogEntry(
          'Customer sign-up',
          'success',
          entryRules === 0
            ? `${profileId} · no sign-up journeys`
            : `${profileId} · ${entryRules} journey entry ${entryRules === 1 ? 'rule' : 'rules'} fired`
        );
      } catch (err) {
        if (cancelled) return;
        // Non-fatal: the first session upsert still creates the customer, just
        // without sign-up journeys.
        addLogEntry('Customer sign-up', 'error', errorMessage(err, 'Failed to sign up customer'));
      }
      if (cancelled) return;
      await loadJourneys('signup', profileId);
      if (!cancelled) setCustomerReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // loadJourneys is keyed on profileId/config already; re-running on its
    // identity would re-sign-up the same customer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, profileId]);

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
    if (!customerReady) return;
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
  }, [cartItems, couponCodes, config, sessionState, customerReady]);

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

  // A closed session is what enrolls first_purchase / coupon_redeemed journeys
  // and advances a step whose voucher was redeemed, so re-read journeys after it.
  // Not awaited: the order is placed regardless of how the journey read goes.
  const checkout = useCallback(async () => {
    const response = await sendSession({ nextState: 'closed', actionLabel: 'Checkout' });
    void loadJourneys('checkout');
    return response;
  }, [sendSession, loadJourneys]);

  const cancelSession = useCallback(async () => {
    const response = await sendSession({ nextState: 'cancelled', actionLabel: 'Cancel session' });
    void loadJourneys('refresh');
    return response;
  }, [sendSession, loadJourneys]);

  const refreshJourneys = useCallback(() => loadJourneys('refresh'), [loadJourneys]);

  // New Session keeps the same customer (profileId) so per-customer redemption
  // limits, lifetime usage counters, customer attributes and journey progress
  // persist across demo carts. To start as a brand-new customer, use newCustomer.
  const newSession = useCallback(() => {
    setSessionIntegrationId(generateId('demo-session'));
    setSessionState('open');
    setCouponCodes([]);
    setLastResponse(null);
    setLastRequest(null);
    setLastJourneyUpdates([]);
    addLogEntry('New session', 'success', 'New cart, same customer');
  }, [addLogEntry]);

  // A new profileId re-runs the sign-up effect above, which fires sign-up journeys.
  const newCustomer = useCallback(() => {
    startNewCustomer();
    setSessionIntegrationId(generateId('demo-session'));
    setSessionState('open');
    setCouponCodes([]);
    setLastResponse(null);
    setLastRequest(null);
    addLogEntry('New customer', 'success', 'Fresh customer profile');
  }, [addLogEntry, startNewCustomer]);

  // Put a journey voucher into the cart. After an order is placed or refunded
  // the cart is read-only, so start a new order (same customer) first.
  const applyJourneyVoucher = useCallback(
    (code: string) => {
      if (sessionState !== 'open') newSession();
      setCouponCodes(prev => (prev.includes(code) ? prev : [...prev, code]));
    },
    [sessionState, newSession]
  );

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
    // customer + journeys
    customerReady,
    lastSignupResponse,
    journeys,
    journeysLoaded,
    journeysLoading,
    journeysError,
    lastJourneyUpdates,
    journeyUpdateBatch,
    refreshJourneys,
    applyJourneyVoucher,
    // observability
    lastResponse,
    lastRequest,
    eventLog,
    isLoading,
  };
}
