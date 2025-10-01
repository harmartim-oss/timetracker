import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Scale, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import * as authService from '../services/authService.js'

const Login = ({ onLoginSuccess, onShowSignup, onBack }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setIsLoading(true)
    
    // Simulate async operation for better UX
    setTimeout(() => {
      const result = authService.login(email, password)
      
      if (result.success) {
        onLoginSuccess(result.user)
      } else {
        setError(result.message)
      }
      
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Landing
          </Button>
        )}
        
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Scale className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your Tim Harmar Legal account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@lawfirm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-11 text-base shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                  onClick={onShowSignup}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign up for free
                </button>
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-center text-slate-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help? <a href="mailto:support@timharmar.com" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
