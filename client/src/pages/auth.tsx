import { Layout } from "@/components/layout";
import { Button } from "@/components/button";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const login = useLogin();
  const register = useRegister();
  
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login.mutate({ email: formData.email, password: formData.password });
    } else {
      register.mutate(formData);
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex border-b mb-8 text-center text-sm font-bold uppercase tracking-widest">
            <button 
              className={`flex-1 pb-4 transition-colors ${isLogin ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 pb-4 transition-colors ${!isLogin ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={() => setIsLogin(false)}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-2">
                  {isLogin ? 'Welcome Back' : 'Join Aura'}
                </h1>
                <p className="text-muted-foreground">
                  {isLogin ? 'Sign in to access your orders and profile.' : 'Create an account for faster checkout.'}
                </p>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    required 
                    type="text"
                    className="w-full border border-border p-4 bg-transparent focus:outline-none focus:border-primary transition-colors"
                    value={formData.name} 
                    onChange={e=>setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  required 
                  type="email"
                  className="w-full border border-border p-4 bg-transparent focus:outline-none focus:border-primary transition-colors"
                  value={formData.email} 
                  onChange={e=>setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                <input 
                  required 
                  type="password"
                  className="w-full border border-border p-4 bg-transparent focus:outline-none focus:border-primary transition-colors"
                  value={formData.password} 
                  onChange={e=>setFormData({...formData, password: e.target.value})} 
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-4" 
                size="lg"
                isLoading={isLogin ? login.isPending : register.isPending}
              >
                {isLogin ? 'Sign In' : 'Register'}
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
