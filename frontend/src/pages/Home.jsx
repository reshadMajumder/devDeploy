import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Github, Pocket as Docker, Rocket, Shield, Globe, ArrowRight, CheckCircle, Star } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Connect your repositories and deploy with every push. Automatic deployments made simple.',
      color: 'from-gray-600 to-gray-800'
    },
    {
      icon: Docker,
      title: 'Docker Containers',
      description: 'Every deployment runs in isolated containers for maximum security and reliability.',
      color: 'from-blue-600 to-blue-800'
    },
    {
      icon: Rocket,
      title: 'Instant Deployments',
      description: 'Deploy applications in seconds with zero configuration required.',
      color: 'from-purple-600 to-purple-800'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Built-in security features and compliance standards for peace of mind.',
      color: 'from-green-600 to-green-800'
    },
    {
      icon: Globe,
      title: 'Global CDN',
      description: 'Lightning-fast content delivery with our worldwide network.',
      color: 'from-orange-600 to-orange-800'
    },
    {
      icon: Star,
      title: 'Premium Support',
      description: '24/7 expert support to help you succeed with your deployments.',
      color: 'from-pink-600 to-pink-800'
    }
  ];

  const frameworks = [
    {
      name: 'React',
      description: 'Deploy React applications with automatic build optimization and CDN distribution.',
      color: 'bg-blue-500',
      letter: 'R'
    },
    {
      name: 'Django',
      description: 'Deploy Django applications with database support and automatic scaling.',
      color: 'bg-green-600',
      letter: 'D'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                Deploy your apps
                <br />
                <span className="text-gradient">
                  instantly
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Deploy Django and React applications from GitHub with zero configuration. 
                Built with Docker containers for reliable, scalable deployments.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {user ? (
                  <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                      <span>Get Started Free</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-6">
                No credit card required • Deploy in under 30 seconds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to deploy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From code to production in seconds. Our platform handles the complexity so you can focus on building amazing applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover p-8 text-center group">
                <div className={`bg-gradient-to-r ${feature.color} rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supported Frameworks */}
      <div className="py-24 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Supported Frameworks
            </h2>
            <p className="text-xl text-gray-600">
              Deploy your favorite frameworks with confidence and ease
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {frameworks.map((framework, index) => (
              <div key={index} className="card-hover p-10 text-center group">
                <div className={`${framework.color} rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <span className="text-white font-bold text-2xl">{framework.letter}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{framework.name}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {framework.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600 font-medium">Deployments</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">30s</div>
              <div className="text-gray-600 font-medium">Avg Deploy Time</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to deploy your next project?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of developers who trust our platform for their deployments. 
            Start building the future today.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 text-lg flex items-center space-x-2">
                <span>Start Deploying Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors duration-200 text-lg">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;