import type { DemoCartItem } from '@/types/integrationApi';

// Default starter cart for the demo storefront. Fully editable in-page —
// presenters can rename items, change SKUs, and adjust prices live to fit the
// industry of whichever prospect they are pitching to.
export const DEFAULT_DEMO_CART: DemoCartItem[] = [
  { sku: 'ITEM-001', name: 'Cold Brew Coffee', price: 5.49, quantity: 1 },
  { sku: 'ITEM-002', name: 'Iced Vanilla Latte', price: 6.29, quantity: 1 },
  { sku: 'ITEM-003', name: 'Matcha Green Tea', price: 5.99, quantity: 1 },
  { sku: 'ITEM-004', name: 'Butter Croissant', price: 3.49, quantity: 1 },
];
