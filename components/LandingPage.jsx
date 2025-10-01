import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { 
  Clock, 
  Brain, 
  FileText, 
  BarChart3, 
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Scale,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Globe
} from 'lucide-react'

const LandingPage = ({ onShowLogin, onShowSignup }) => {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    {
      icon: Clock,
      title: 'Smart Time Tracking',
      description: 'Real-time timer with automatic entry suggestions and intelligent billable hour tracking.',
      color: 'bg-blue-500'
    },
    {
      icon: Brain,
      title: 'AI-Powered Assistant',
      description: 'Natural language processing for time entries, task suggestions, and legal research assistance.',
      color: 'bg-purple-500'
    },
    {
      icon: FileText,
      title: 'Professional Invoicing',
      description: 'Generate branded invoices with custom templates, HST calculation, and payment tracking.',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards with revenue forecasting, efficiency metrics, and trend analysis.',
      color: 'bg-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Bank-level security with encrypted data storage and role-based access control.',
      color: 'bg-red-500'
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks, overdue invoice notifications, and client communications.',
      color: 'bg-yellow-500'
    }
  ]

  const competitors = [
    {
      name: 'Tim Harmar Legal',
      features: [
        { name: 'AI Time Entry', included: true },
        { name: 'Natural Language Processing', included: true },
        { name: 'Predictive Billing', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'Legal Research AI', included: true },
        { name: 'Monthly Cost', value: 'Free Beta' }
      ]
    },
    {
      name: 'Clio',
      features: [
        { name: 'AI Time Entry', included: false },
        { name: 'Natural Language Processing', included: false },
        { name: 'Predictive Billing', included: false },
        { name: 'Custom Branding', included: true },
        { name: 'Legal Research AI', included: false },
        { name: 'Monthly Cost', value: '$69-$129' }
      ]
    },
    {
      name: 'MyCase',
      features: [
        { name: 'AI Time Entry', included: false },
        { name: 'Natural Language Processing', included: false },
        { name: 'Predictive Billing', included: false },
        { name: 'Custom Branding', included: true },
        { name: 'Legal Research AI', included: false },
        { name: 'Monthly Cost', value: '$39-$79' }
      ]
    },
    {
      name: 'PracticePanther',
      features: [
        { name: 'AI Time Entry', included: false },
        { name: 'Natural Language Processing', included: false },
        { name: 'Predictive Billing', included: false },
        { name: 'Custom Branding', included: true },
        { name: 'Legal Research AI', included: false },
        { name: 'Monthly Cost', value: '$49-$79' }
      ]
    }
  ]

  const benefits = [
    'Save 40% time on billing and administrative tasks',
    'Increase billable hours captured by up to 25%',
    'Reduce invoice errors with AI-powered validation',
    'Get paid faster with automated reminders',
    'Scale your practice without adding overhead',
    'Access anywhere on any device'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50">
      {/* Header/Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Scale className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Tim Harmar Legal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onShowLogin}
                className="text-slate-700 hover:text-blue-600"
              >
                Sign In
              </Button>
              <Button 
                onClick={onShowSignup}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Practice Management</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
            Practice Management
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Built for the Modern Lawyer
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Track time naturally with AI, generate professional invoices instantly, and grow your practice 
            with intelligent insights—all in one beautiful, easy-to-use platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={onShowSignup}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg px-8 py-6 shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={onShowLogin}
              className="text-lg px-8 py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Sign In
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            No credit card required • Free during beta • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white rounded-3xl shadow-xl my-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to Run Your Practice
          </h2>
          <p className="text-xl text-slate-600">
            Powerful features designed specifically for legal professionals
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 transform transition-transform ${hoveredFeature === index ? 'scale-110' : ''}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Lawyers Choose Us
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join hundreds of legal professionals who have transformed their practice management
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                <div>
                  <div className="text-5xl font-bold mb-2">40%</div>
                  <div className="text-blue-100">Time saved on admin tasks</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">25%</div>
                  <div className="text-blue-100">Increase in captured billable hours</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">15 min</div>
                  <div className="text-blue-100">Average time to generate invoice</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            How We Compare to Competitors
          </h2>
          <p className="text-xl text-slate-600">
            See why Tim Harmar Legal is the smarter choice
          </p>
        </div>
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-4 text-left text-slate-600 font-semibold">Feature</th>
                {competitors.map((comp, index) => (
                  <th 
                    key={index} 
                    className={`p-4 text-center font-bold ${index === 0 ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                  >
                    {comp.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors[0].features.map((_, featureIndex) => (
                <tr key={featureIndex} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700">
                    {competitors[0].features[featureIndex].name}
                  </td>
                  {competitors.map((comp, compIndex) => (
                    <td 
                      key={compIndex} 
                      className={`p-4 text-center ${compIndex === 0 ? 'bg-blue-50' : ''}`}
                    >
                      {comp.features[featureIndex].value ? (
                        <span className={compIndex === 0 ? 'text-blue-700 font-bold' : 'text-slate-600'}>
                          {comp.features[featureIndex].value}
                        </span>
                      ) : comp.features[featureIndex].included ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join the modern legal professionals using AI-powered tools to work smarter, 
            bill more accurately, and grow their practice.
          </p>
          <Button 
            onClick={onShowSignup}
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 shadow-xl"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-slate-400 mt-6">
            Free during beta • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-slate-900">Tim Harmar Legal</span>
              </div>
              <p className="text-slate-600 mb-4">
                AI-powered practice management for modern legal professionals.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-slate-400 cursor-pointer hover:text-blue-600" />
                <MessageSquare className="w-5 h-5 text-slate-400 cursor-pointer hover:text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="cursor-pointer hover:text-blue-600">Features</li>
                <li className="cursor-pointer hover:text-blue-600">Pricing</li>
                <li className="cursor-pointer hover:text-blue-600">Security</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="cursor-pointer hover:text-blue-600">About</li>
                <li className="cursor-pointer hover:text-blue-600">Contact</li>
                <li className="cursor-pointer hover:text-blue-600">Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-600">
            <p>&copy; 2024 Tim Harmar Legal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
