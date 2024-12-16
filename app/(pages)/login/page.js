'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  // Redirection logic based on session and role
  const redirect = () => {
    if (!session) {
      console.log('User not logged in');
      router.push('/login');
    } else if (session.user.role === 'SuperAdmin') {
      router.push('/admin/dashboard');
    } else if (session.user.role === 'Admin') {
      router.push('/client/dashboard');
    } else if (session.user.role === 'User') {
      router.push('/employee/dashboard');
    }
  };

  // Check session status and redirect on load
  useEffect(() => {
    if (status === 'authenticated') {
      redirect();
    }
  }, [status]);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      username: credentials.username,
      password: credentials.password,
      redirect: false, // Prevent auto redirection
    });

    if (res?.error) {
      alert(`Invalid login credentials. ${res.error}`);
    } else if (res.ok) {
      redirect();
    }
  };

  // If session status is loading, display a loader
  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="p-6 border rounded-md shadow-md">
        <h1 className="text-xl mb-4">Login</h1>
        <Input
          type="text"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          className="mb-4"
        />
        <Input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="mb-4"
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
