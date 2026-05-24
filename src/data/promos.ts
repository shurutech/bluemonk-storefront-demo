// Hardcoded promo content keyed by coupon code.
//
// On a real customer integration this content would come from the coupon's
// custom attributes returned by the BlueMonk API (couponBannerImage,
// couponTitle, couponDescription). The demo storefront hardcodes it so the
// hero banner can render BEFORE the customer applies the code — i.e. as
// promotional material on the home screen.
//
// When the customer DOES apply the code, the API response includes the
// real attributes for that coupon — see the inspector / dev tools to show
// the round-trip.

export interface FeaturedPromo {
  couponCode: string;
  title: string;
  description: string;
  bannerImage: string;
  badgeText: string;
}

export const FEATURED_PROMOS: FeaturedPromo[] = [
  {
    couponCode: 'COLDBREW-SUMMER',
    title: 'Cold Brew Summer Days',
    description: '20% off all cold brews · Gold members get an extra 10%.',
    bannerImage:
      'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&h=720&q=80',
    badgeText: 'Code · COLDBREW-SUMMER',
  },
];
