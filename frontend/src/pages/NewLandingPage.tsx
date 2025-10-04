import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb,
  ChevronRight, 
  ArrowRight,
  MessageSquare, 
  Users,
  LineChart,
  FileText,
  Check,
  Info,
  Eye,
  Zap,
  Target,
  TrendingUp,
  Star,
  Play,
  Sparkles
} from 'lucide-react';

const ModernLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "8 specialized AI agents analyze your startup idea across multiple dimensions",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Market Intelligence",
      description: "Deep market sizing, competitive analysis, and opportunity assessment",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Growth Insights",
      description: "Strategic recommendations and feasibility analysis for rapid scaling",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: FileText,
      title: "Export Everything",
      description: "Download comprehensive reports in PDF and Markdown formats",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Ideas Analyzed", icon: Brain },
    { number: "98%", label: "Accuracy Rate", icon: Target },
    { number: "5min", label: "Analysis Time", icon: Zap },
    { number: "24/7", label: "AI Support", icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_theme(colors.blue.500/20),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_theme(colors.purple.500/20),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_theme(colors.pink.500/10),_transparent_70%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-10 w-10 text-white" />
            <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            FoundrIQ
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-6 py-2 text-gray-300 hover:text-white transition-colors">
            Sign In
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">AI-Powered Startup Validation</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Transform
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Your Ideas
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Turn your startup concepts into validated business opportunities with our 
            <span className="text-purple-400 font-semibold"> AI-powered analysis platform</span>. 
            Get insights in minutes, not months.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25">
              <span className="relative z-10 flex items-center space-x-2">
                <span>Start Analysis</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button className="group flex items-center space-x-3 px-8 py-4 border border-white/20 rounded-full font-medium text-lg backdrop-blur-sm hover:bg-white/5 transition-all">
              <Play className="h-5 w-5 text-purple-400" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to validate and scale your startup idea
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-3xl border border-white/10 backdrop-blur-sm transition-all duration-500 hover:border-white/20 ${
                activeFeature === index ? 'bg-white/5' : 'bg-white/[0.02]'
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {feature.description}
              </p>
              
              <button className="flex items-center space-x-2 text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                <span>Learn More</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Hover Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            </div>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-400">Simple, powerful, and lightning fast</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {[
            {
              step: "01",
              title: "Submit Your Idea",
              description: "Share your startup concept with our AI platform",
              icon: Lightbulb,
              color: "from-blue-500 to-cyan-500"
            },
            {
              step: "02", 
              title: "AI Analysis",
              description: "8 specialized agents analyze market fit, competition, and feasibility",
              icon: Brain,
              color: "from-purple-500 to-pink-500"
            },
            {
              step: "03",
              title: "Get Insights",
              description: "Receive comprehensive reports and strategic recommendations",
              icon: FileText,
              color: "from-green-500 to-emerald-500"
            }
          ].map((item, index) => (
            <div key={index} className="relative group">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                
                <div className="text-6xl font-bold text-white/10 mb-4">{item.step}</div>
                
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {item.title}
                </h3>
                
                <p className="text-gray-400 text-lg">
                  {item.description}
                </p>
              </div>

              {/* Connection Line */}
              {index < 2 && (
                <div className="hidden lg:block absolute top-10 left-full w-12 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/10 backdrop-blur-sm p-12 lg:p-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
          
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Ready to Validate Your Next Big Idea?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of founders who've transformed their concepts into successful startups with FoundrIQ
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group relative px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium text-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25">
                <span className="relative z-10 flex items-center space-x-3">
                  <span>Start Free Analysis</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button className="flex items-center space-x-3 px-10 py-5 border border-white/20 rounded-full font-medium text-xl backdrop-blur-sm hover:bg-white/5 transition-all">
                <MessageSquare className="h-6 w-6 text-purple-400" />
                <span>Talk to an Expert</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-6 lg:mb-0">
              <Brain className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold">FoundrIQ</span>
            </div>
            
            <div className="flex items-center space-x-8 text-gray-400">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>© 2025 FoundrIQ</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;