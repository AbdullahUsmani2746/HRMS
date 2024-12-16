'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {

  const { data: session } = useSession();

  const router = useRouter();

  useEffect(() => {
    // Navigate to '/dashboard' after the component has rendered

    if(!session)
      router.push('/login');
    else if( session.user.role === "SuperAdmin"){
      router.push('/admin/dashboard'); 
  }

  else if( session.user.role === "Admin"){
     router.push('/client/dashboard'); 
  }

  else if( session.user.role === "User"){
    router.push('/employee/dashboard'); 
  }
    
  }, [router]);

  return (
    <div className='flex'></div>
  );
}
