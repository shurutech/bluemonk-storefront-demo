import type { DemoCartItem } from '@/types/integrationApi';

export interface MenuItem extends Omit<DemoCartItem, 'quantity'> {
  category: string;
  description: string;
  /** Emoji fallback if the image fails to load. */
  emoji: string;
  image: string;
  badge?: string;
}

export const BREWLY_BRAND = {
  name: 'Brewly',
  tagline: 'Coffee, comfort, every cup',
  primary: '#16a34a',
  primarySoft: '#dcfce7',
  accent: '#fb923c',
  storeName: 'Brewly · Orchard Central',
} as const;

export const MENU_CATEGORIES = [
  'Featured',
  'Coffee',
  'Tea & Matcha',
  'Bites',
  'Bundles',
] as const;

const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=240&h=240&q=80`;

export const BREWLY_MENU: MenuItem[] = [
  {
    sku: 'BREW-001',
    name: 'Iced Vanilla Latte',
    price: 6.5,
    category: 'Featured',
    description: 'Espresso, milk, vanilla, ice — our most-ordered drink.',
    emoji: '🥤',
    image: UNSPLASH('photo-1517701604599-bb29b565090c'),
    badge: 'Bestseller',
    attributes: { productCategory: 'espresso' },
  },
  {
    sku: 'BREW-002',
    name: 'Cold Brew',
    price: 5.5,
    category: 'Coffee',
    description: 'Slow-steeped 16 hours. Smooth, low-acid.',
    emoji: '☕️',
    image: UNSPLASH('photo-1497636577773-f1231844b336'),
    attributes: { productCategory: 'cold-brew' },
  },
  {
    sku: 'BREW-003',
    name: 'Flat White',
    price: 5.8,
    category: 'Coffee',
    description: 'Double ristretto with velvety steamed milk.',
    emoji: '☕️',
    image: UNSPLASH('photo-1461023058943-07fcbe16d735'),
    attributes: { productCategory: 'espresso' },
  },
  {
    sku: 'BREW-004',
    name: 'Hazelnut Mocha',
    price: 6.8,
    category: 'Coffee',
    description: 'Espresso, dark chocolate, toasted hazelnut.',
    emoji: '🍫',
    image: UNSPLASH('photo-1572442388796-11668a67e53d'),
    attributes: { productCategory: 'espresso' },
  },
  {
    sku: 'BREW-005',
    name: 'Matcha Latte',
    price: 6.2,
    category: 'Tea & Matcha',
    description: 'Ceremonial matcha with creamy oat milk.',
    emoji: '🍵',
    image: UNSPLASH('photo-1515823064-d6e0c04616a7'),
    badge: 'New',
    attributes: { productCategory: 'tea' },
  },
  {
    sku: 'BREW-006',
    name: 'Strawberry Yuzu Tea',
    price: 5.9,
    category: 'Tea & Matcha',
    description: 'Cold brew tea with strawberry purée and yuzu.',
    emoji: '🍓',
    image: UNSPLASH('photo-1556679343-c7306c1976bc'),
    attributes: { productCategory: 'tea' },
  },
  {
    sku: 'BREW-007',
    name: 'Butter Croissant',
    price: 4.2,
    category: 'Bites',
    description: 'Flaky, all-butter, baked fresh daily.',
    emoji: '🥐',
    image: UNSPLASH('photo-1555507036-ab1f4038808a'),
    attributes: { productCategory: 'pastry' },
  },
  {
    sku: 'BREW-008',
    name: 'Almond Biscotti',
    price: 3.5,
    category: 'Bites',
    description: 'Twice-baked with toasted almonds.',
    emoji: '🍪',
    image: UNSPLASH('photo-1499636136210-6f4ee915583e'),
    attributes: { productCategory: 'pastry' },
  },
  {
    sku: 'BREW-009',
    name: 'Avocado Toast',
    price: 7.8,
    category: 'Bites',
    description: 'Sourdough, smashed avocado, chili crisp.',
    emoji: '🥑',
    image: UNSPLASH('photo-1541519227354-08fa5d50c44d'),
    attributes: { productCategory: 'bites' },
  },
  {
    sku: 'BREW-010',
    name: 'Pair & Pastry Bundle',
    price: 9.5,
    category: 'Bundles',
    description: 'Any coffee + a fresh-baked pastry. Save $1.50.',
    emoji: '🎁',
    image: UNSPLASH('photo-1554118811-1e0d58224f24'),
    badge: 'Bundle',
    attributes: { productCategory: 'bundle' },
  },
  {
    sku: 'BREW-011',
    name: 'Morning Set',
    price: 11,
    category: 'Bundles',
    description: 'Coffee, pastry, and a piece of fruit. Save $2.',
    emoji: '🌅',
    image: UNSPLASH('photo-1525351484163-7529414344d8'),
    attributes: { productCategory: 'bundle' },
  },
];
