import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GuestModeButton from './GuestModeButton';
import { useAuthHook } from '@/hooks/useAuth';
import { useUI } from '@/store';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSwitchMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login, register } = useAuthHook();
  const { isLoading, error } = useUI();
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { email?: string; password?: string } = {};
    
    if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(password)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-fantasy-purple/50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-fantasy-decorative text-fantasy-gold mb-2">
          Vaeleth
        </h1>
        <h2 className="text-xl font-fantasy text-gray-300">
          {mode === 'login' ? 'Welcome Back, Divine One' : 'Ascend to Godhood'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={formErrors.email}
          required
          autoComplete="email"
        />
        
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={formErrors.password}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-md">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={!email || !password}
        >
          {mode === 'login' ? 'Enter the Realm' : 'Begin Your Ascension'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-fantasy-gold hover:text-yellow-300 transition-colors font-fantasy"
        >
          {mode === 'login' 
            ? "New to the divine realm? Create your deity"
            : "Already ascended? Return to your realm"
          }
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <GuestModeButton onGuestSessionStart={(session) => {
          // Handle guest session creation
          console.log('Guest session started:', session);
        }} />
      </div>
    </div>
  );
};

export default AuthForm;