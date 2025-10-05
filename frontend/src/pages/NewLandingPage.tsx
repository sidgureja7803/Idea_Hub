import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Code, 
  Server,
  ChevronRight, 
  ArrowRight,
  MessageSquare, 
  Users,
  LineChart,
  FileText,
  Check,
  Zap,
  Target,
  TrendingUp,
  Star,
  Play,
  Sparkles,
  BarChart,
  PieChart,
  Search,
  Rocket,
  Workflow,
  Lightbulb,
  DollarSign
} from 'lucide-react';
import ChatBot from '../components/ChatBot';

const FoundrIQLandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);

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
      color: "from-blue-600 to-indigo-600"
    },
    {
      icon: Target,
      title: "Market Intelligence",
      description: "Deep market sizing, competitive analysis, and opportunity assessment",
      color: "from-purple-600 to-violet-600"
    },
    {
      icon: TrendingUp,
      title: "Growth Insights",
      description: "Strategic recommendations and feasibility analysis for rapid scaling",
      color: "from-cyan-600 to-blue-600"
    },
    {
      icon: FileText,
      title: "Export Everything",
      description: "Download comprehensive reports in PDF and Markdown formats",
      color: "from-emerald-600 to-green-600"
    }
  ];

  const stats = [
    { number: "8", label: "Specialized Agents", icon: Brain },
    { number: "2min", label: "Analysis Time", icon: Zap },
    { number: "100%", label: "Real-time Data", icon: LineChart },
    { number: "24/7", label: "AI Support", icon: MessageSquare }
  ];

  const technologies = [
    {
      title: "Cerebras AI",
      logo: "https://raw.githubusercontent.com/cerebras/cerebras/master/docs/images/logo.svg",
      description: "Our platform integrates the Cerebras Inference API as the core of our multi-agent AI system, powering specialized analysis agents with 1.5-2.0 second average latency and 99.7% completion rate.",
      color: "from-orange-500 to-red-500",
      // metrics: [
      //   { label: "Avg. Latency", value: "1.5-2.0s" },
      //   { label: "Success Rate", value: "99.7%" },
      //   { label: "Concurrent Tasks", value: "5-10" }
      // ]
    },
    {
      title: "Meta Llama",
      logo: "https://seeklogo.com/images/M/meta-logo-8CAE21A432-seeklogo.com.png",
      description: "We leverage Meta's open-source Llama language models for natural language understanding, market analysis, and strategy generation, enabling our agents to provide insightful recommendations.",
      color: "from-blue-600 to-indigo-600",
      // metrics: [
      //   { label: "Models Used", value: "Llama 3" },
      //   { label: "Analysis Tasks", value: "5+" },
      //   { label: "Response Quality", value: "High" }
      // ]
    },
    {
      title: "Docker",
      logo: "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png",
      description: "Our containerized microservices architecture with Docker Compose orchestration provides scalable, reliable deployment with Traefik API Gateway for efficient routing and load balancing.",
      color: "from-sky-500 to-blue-500",
      // metrics: [
      //   { label: "Microservices", value: "3+" },
      //   { label: "Deployment", value: "Simple" },
      //   { label: "Scaling", value: "Automatic" }
      // ]
    }
  ];

  const agents = [
    {
      name: "Market Research Agent",
      description: "Analyzes current market trends, size, and opportunities",
      icon: Search
    },
    {
      name: "TAM/SAM Agent",
      description: "Calculates total and serviceable addressable market sizes",
      icon: PieChart
    },
    {
      name: "Competition Scan Agent",
      description: "Maps competitive landscape and identifies market gaps",
      icon: Users
    },
    {
      name: "Feasibility Evaluator",
      description: "Assesses technical and financial viability of your idea",
      icon: Check
    },
    {
      name: "Strategy Recommender",
      description: "Provides actionable go-to-market strategies",
      icon: Rocket
    },
    {
      name: "Report Generator",
      description: "Compiles comprehensive analysis into detailed reports",
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen text-gray-900 dark:text-white overflow-hidden relative bg-gray-50 dark:bg-gray-900">
      {/* Subtle Gradient Background */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-900"></div>
      
      {/* Moving Gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-15">
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-16 md:pt-24 pb-16 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2 mb-8">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">AI-Powered Startup Validation</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-gray-900 dark:text-white">
              Transform Your Startup 
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ideas Into Reality
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Get comprehensive market analysis and validation for your business concept in 
            <span className="text-blue-700 dark:text-blue-400 font-semibold"> minutes, not months</span>. 
            Powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Link to="/sign-up" className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg text-white shadow-lg shadow-blue-600/20 transition-all duration-300">
              <span className="relative z-10 flex items-center space-x-2">
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <button className="group flex items-center space-x-3 px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="relative z-10 py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to validate and scale your startup idea
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-500`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                <button className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  <span>Learn More</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div id="technology" className="relative z-10 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Powered By Cutting-Edge Tech
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform leverages industry-leading technologies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-500 h-full"
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-6 w-24 h-24 mb-6 flex items-center justify-center shadow-md">
                    <img 
                      src={tech.logo} 
                      alt={`${tech.title} logo`} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${tech.color} bg-clip-text text-transparent`}>
                    {tech.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8 flex-grow">
                    {tech.description}
                  </p>
                
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Agents Section */}
      <div id="agents" className="relative z-10 py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              8 Specialized AI Agents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI Agent Pipeline works together to validate your idea
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                    <agent.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{agent.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our agents work in sequence, each specializing in a different aspect of startup validation
            </p>
            <Link 
              to="/sign-up"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all"
            >
              Try It For Free
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Simple, powerful, and lightning fast</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
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
              <div key={index} className="relative group bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${item.color} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-4">{item.step}</div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {item.description}
                  </p>
                </div>

                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-12 h-0.5 bg-gradient-to-r from-gray-300 dark:from-gray-600 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="relative z-10 py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Pricing Plans
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the plan that works for your startup journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$29",
                period: "per month",
                description: "Perfect for early-stage founders",
                features: [
                  "3 idea analyses per month",
                  "Basic market research",
                  "Competition analysis",
                  "PDF reports",
                  "Email support"
                ],
                color: "border-gray-200 dark:border-gray-700",
                buttonColor: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                popular: false
              },
              {
                name: "Pro",
                price: "$79",
                period: "per month",
                description: "For founders ready to scale",
                features: [
                  "10 idea analyses per month",
                  "Advanced market sizing",
                  "Competitive landscape mapping",
                  "Strategic recommendations",
                  "PDF & Markdown reports",
                  "Priority support"
                ],
                color: "border-blue-200 dark:border-blue-900 shadow-blue-500/10 shadow-xl",
                buttonColor: "bg-blue-600 text-white hover:bg-blue-700",
                popular: true
              },
              {
                name: "Enterprise",
                price: "$199",
                period: "per month",
                description: "For startup studios & accelerators",
                features: [
                  "Unlimited idea analyses",
                  "Custom market filters",
                  "Deep feasibility studies",
                  "Advanced strategy planning",
                  "API access",
                  "Dedicated account manager"
                ],
                color: "border-gray-200 dark:border-gray-700",
                buttonColor: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                popular: false
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-xl border ${plan.color} bg-white dark:bg-gray-800 p-8 transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">{plan.period}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/sign-up" className={`block w-full py-3 rounded-lg font-medium text-center transition-all ${plan.buttonColor}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-12 lg:p-16 text-center overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ready to Validate Your Next Big Idea?
              </h2>
              
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                Join thousands of founders who've transformed their concepts into successful startups with IdeaHub
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/sign-up" className="px-10 py-4 bg-white hover:bg-gray-100 rounded-lg font-medium text-xl text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Free Analysis
                </Link>
                
                <Link to="/sign-in" className="flex items-center space-x-3 px-10 py-4 border border-white/30 rounded-lg font-medium text-xl text-white hover:bg-white/10 transition-all">
                  <MessageSquare className="h-6 w-6" />
                  <span>Talk to an Expert</span>
                </Link>
              </div>
            </div>
            
            {/* Background Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-16 -mr-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -mb-20 -ml-20"></div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

export default FoundrIQLandingPage;