'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogIn, Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Toaster, toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    if (status === 'authenticated') {
      redirect();
    }
  }, [status]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Login Failed', {
          description: res.error,
          duration: 3000,
          style: { background: '#181C14', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
      } else if (res?.ok) {
        toast.success('Login Successful', {
          description: 'Redirecting to dashboard...',
          duration: 2000,
          style: { background: '#181C14', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
        redirect();
      }
    } catch (err) {
      toast.error('Error', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 3000,
        style: { background: '#181C14', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-[#181C14]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-white/90 font-medium"
        >
          Loading HR Management System...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181C14] p-4">
      <Toaster 
        position="top-center" 
        expand={true} 
        theme="dark"
        toastOptions={{
          style: { 
            background: '#181C14', 
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10"
      >
        <Card className="w-[450px] shadow-2xl bg-[#181C14]/95 backdrop-blur border-[#ffffff1a]">
          <CardHeader className="space-y-3 pb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto"
            >
              <Building2 className="w-16 h-16 text-white mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-center text-white">
              
              Dash Payroll Software
            </CardTitle>
            <CardDescription className="text-center text-gray-400 text-base">
              Access your workspace securely
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="h-12 pl-10 bg-[#ffffff0a] border-[#ffffff1a] text-white placeholder:text-gray-500
                             focus:border-white/30 focus:ring-white/20"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="h-12 pl-10 bg-[#ffffff0a] border-[#ffffff1a] text-white placeholder:text-gray-500
                             focus:border-white/30 focus:ring-white/20"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white text-[#181C14] hover:bg-white/90 font-medium rounded-lg
                            transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center"
                    >
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center text-sm text-gray-500"
              >
                Protected by enterprise-grade security
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}