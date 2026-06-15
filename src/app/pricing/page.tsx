import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: `Pricing — ${SITE_NAME}`,
  description:
    'Get listed on CyberBench for free, or upgrade to Verified or Featured for more buyer visibility, a verified badge, and priority matching.',
  alternates: { canonical: `${SITE_URL}/pricing` },
};

export default function PricingPage() {
  return <PricingClient />;
}
