import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { authFetch } from '@/lib/auth-fetch';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { z } from 'zod';

export function useAuth() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const res = await authFetch(api.auth.me.path);
      if (res.status === 401) {
        localStorage.removeItem('token');
        return null;
      }
      if (!res.ok) throw new Error('Failed to fetch user');

      const data = await res.json();
      return api.auth.me.responses[200].parse(data);
    },
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const validated = api.auth.login.input.parse(credentials);
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await res.json();
      return api.auth.login.responses[200].parse(data);
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ title: 'Welcome back', description: 'Successfully logged in.' });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (userData: z.infer<typeof api.auth.register.input>) => {
      const validated = api.auth.register.input.parse(userData);
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await res.json();
      return api.auth.register.responses[201].parse(data);
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ title: 'Account Created', description: 'Welcome to the club.' });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData([api.auth.me.path], null);
    queryClient.clear(); // Clear cart/orders
    toast({
      title: 'Logged out',
      description: 'You have been logged out securely.',
    });
    setLocation('/login');
  };

  return { logout };
}
