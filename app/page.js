'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to '/dashboard' after the component has rendered
    router.push('/dashboard');
  }, [router]);

  return (
    <div className='flex'></div>
  );
}
