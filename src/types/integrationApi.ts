// Public Integration API types — mirrors backend DTOs at PUT /v1/sessions/{id}.
// Used by the demo storefront page to call the engine directly from the browser.

export interface SessionCartItem {
  sku: string;
  quantity: number;
  price: number;
  product?: { name: string };
  attributes?: Record<string, unknown>;
}

export interface SessionUpdateData {
  state: 'open' | 'closed' | 'cancelled';
  profileId: string;
  storeIntegrationId?: string;
  couponCodes?: string[];
  identifiers?: string[];
  attributes?: Record<string, unknown>;
  cartItems: SessionCartItem[];
  additionalCosts?: Record<string, { price: number }>;
}

export interface IntegrationSessionUpdateBody {
  customerSession: SessionUpdateData;
  evaluableCampaignIds?: number[];
  responseContent?: string[];
}

export interface IntegrationSessionResponse {
  id: number;
  applicationId: number;
  integrationId: string;
  profileId: string;
  state: 'open' | 'closed' | 'cancelled';
  storeIntegrationId: string;
  couponCodes: string[];
  identifiers: string[];
  cartItems: SessionCartItem[];
  additionalCosts: Record<string, { price: number }>;
  attributes: Record<string, unknown>;
  cartItemsTotal: number;
  additionalCostsTotal: number;
  sessionTotal: number;
  created: string;
  updated: string;
}

export interface TriggeredEffect {
  campaignId: number;
  rulesetId: number;
  ruleIndex: number;
  ruleName: string;
  conditionIndex: number;
  effectType: string;
  props: Record<string, unknown>;
}

export interface TriggeredCampaign {
  id: number;
  name: string;
  state: string;
  frontendState: string;
  startTime: string;
  endTime: string;
  attributes: Record<string, unknown>;
  created: string;
  updated: string;
}

export interface RuleFailureReason {
  campaignId: number;
  campaignName: string;
  rulesetId: number;
  ruleIndex: number;
  ruleName: string;
  conditionIndex: number;
  effectIndex?: number;
  details: string;
}

export interface CreatedCoupon {
  id: number;
  created: string;
  campaignId: number;
  value: string;
  startTime: string;
  endTime: string;
  usageCounter: number;
  usageLimit: number;
  recipientIntegrationId: string;
  reservationCounter: number;
  reservationLimit: number;
  reservation: boolean;
  implicitlyReserved: boolean;
  isReservationMandatory: boolean;
  limits: Array<{
    action: string;
    entities: string[];
    limit: number;
    period: string;
  }>;
  attributes: Record<string, unknown>;
  updated: string;
}

export interface IntegrationSessionUpdateResponse {
  effects: TriggeredEffect[];
  createdCoupons: CreatedCoupon[];
  customerSession: IntegrationSessionResponse;
  triggeredCampaigns: TriggeredCampaign[];
  ruleFailureReasons: RuleFailureReason[];
}

// --- Demo storefront UI types ---

export interface DemoStorefrontConfig {
  apiBaseUrl: string;
  apiKey: string;
}

export interface DemoCartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  attributes?: Record<string, unknown>;
}

export type DemoSessionState = 'open' | 'closed' | 'cancelled';

export interface EventLogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error';
  detail?: string;
}

export interface DemoRequestSnapshot {
  method: 'PUT';
  url: string;
  headers: Record<string, string>;
  body: IntegrationSessionUpdateBody;
}
