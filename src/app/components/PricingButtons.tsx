'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PricingButton({
  plan,
  label,
  className,
}: {
  plan: 'pro' | 'agency' | null;
  label: string;
  className: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!plan) {
      router.push('/dashboard');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (res.status === 401) {
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent('/#pricing')}`);
      return;
    }
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? 'Redirecting...' : label}
    </button>
  );
}
