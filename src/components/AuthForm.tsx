
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const { login, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '' },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    await login(data.username, data.password);
    setIsSubmitting(false);
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    await register(data.username, data.password);
    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-250px)]">
      <Card className="w-full max-w-md shadow-2xl">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="text-center">
            <TabsList className="grid w-full grid-cols-2 mx-auto">
              <TabsTrigger value="login" className="text-base py-2.5">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-base py-2.5">
                <UserPlus className="mr-2 h-5 w-5" /> Register
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabsContent value="login">
            <CardContent className="space-y-6 pt-2 pb-6 px-6">
              <CardTitle className="text-2xl font-bold text-center text-primary mb-1">Welcome Back!</CardTitle>
              <CardDescription className="text-center text-muted-foreground mb-6">Enter your credentials to access your account.</CardDescription>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input 
                    id="login-username" 
                    placeholder="admin" 
                    {...loginForm.register('username')} 
                    autoComplete="username"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="admin" 
                    {...loginForm.register('password')} 
                    autoComplete="current-password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </TabsContent>

          <TabsContent value="register">
            <CardContent className="space-y-6 pt-2 pb-6 px-6">
               <CardTitle className="text-2xl font-bold text-center text-primary mb-1">Create an Account</CardTitle>
               <CardDescription className="text-center text-muted-foreground mb-6">Join EventLink to start creating your events.</CardDescription>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input 
                    id="register-username" 
                    placeholder="Choose a username" 
                    {...registerForm.register('username')} 
                    autoComplete="username"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    placeholder="Create a password" 
                    {...registerForm.register('password')} 
                    autoComplete="new-password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
