'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';


export default function Login() {
    const { data: session } = useSession();

  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      username: credentials.username,
      password: credentials.password,
      redirect: false,
    });

    if (res?.error) {
      alert(`Invalid login credentials. ${res.error}` );
    } else {


        if( session.user.role === "SuperAdmin"){
            window.location.href = '/admin/dashboard'; 
        }

        else if( session.user.role === "Admin"){
            window.location.href = '/client/dashboard'; 
        }

        else if( session.user.role === "User"){
            window.location.href = '/employee/dashboard'; 
        }
        else{

        }
    //   window.location.href = '/'; 
      // Redirect on success
    }
  };

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
