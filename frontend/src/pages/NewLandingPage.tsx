import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  Users, 
  Target,
  Play,
  ArrowRight,
  Check,
  Lightbulb,
  Sparkles
} from 'lucide-react';

const NewLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: BarChart3,
      title: "Market Analysis",
      description: "Real-time market research and trend analysis"
    },
    {
      icon: Target,
      title: "TAM/SAM",
      description: "Comprehensive market sizing calculations"
    },
    {
      icon: Users,
      title: "Competition",
      description: "Competitive landscape mapping"
    },
    {
      icon: Brain,
      title: "Strategy",
      description: "Strategic recommendations and insights"
    }
  ];

  const technologies = [
    {
      name: "Cerebras",
      logo: "https://raw.githubusercontent.com/cerebras/cerebras/master/docs/images/logo.svg",
      description: "Built the world's largest and fastest AI chip, designed to power breakthrough performance in training and inference. Their platform makes working with massive models accessible and lightning fast, helping developers and researchers move from idea to results in record time.",
      color: "from-orange-500 to-red-500",
      buttonText: "Sign Up!"
    },
    {
      name: "Meta",
      logo: "https://seeklogo.com/images/M/meta-logo-8CAE21A432-seeklogo.com.png",
      description: "Meta is behind the Llama family of open-source large language models, bringing cutting-edge AI to developers and researchers everywhere. Llama is designed to be flexible, efficient, and community-driven, enabling innovation across a wide range of applications and projects.",
      color: "from-blue-600 to-indigo-600",
      buttonText: "Learn more"
    },
    {
      name: "Docker",
      logo: "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png",
      description: "Docker is the industry standard for containerization, making it simple to build, share, and run applications anywhere. By streamlining development workflows and improving scalability, Docker empowers developers to bring their ideas to life faster and more reliably.",
      color: "from-sky-500 to-blue-500",
      buttonText: "Learn more"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Describe your idea",
      description: "Input your business idea. Our AI asks clarifying questions.",
      icon: Lightbulb
    },
    {
      step: "2", 
      title: "AI Analysis",
      description: "Watch real-time market research and competitive analysis.",
      icon: Brain
    },
    {
      step: "3",
      title: "Get Insights",
      description: "Receive actionable insights and strategic recommendations.",
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            An AI researcher for your projects
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Document well researched ideas with AI
          </p>
          
          {/* Example Idea */}
          <div className="text-green-400 text-lg mb-12">
            Tropical Mosquito-Proof Travel Socks
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <feature.icon className="h-8 w-8 text-white mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/submit" 
              className="flex items-center space-x-2 px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition-colors"
            >
              <span>+ Add Idea</span>
            </Link>
            
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition-colors"
            >
              <span>Dashboard</span>
            </Link>
            
            <button className="flex items-center space-x-2 px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition-colors">
              <span>Public Gallery</span>
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-black text-2xl font-bold mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ready to Validate Section */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Validate Your Business Idea?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join entrepreneurs turning ideas into successful businesses.
          </p>
          
          <Link 
            to="/submit" 
            className="inline-flex items-center space-x-2 px-8 py-4 border border-white rounded-lg hover:bg-white hover:text-black transition-colors text-lg"
          >
            <span>Add Your Idea</span>
          </Link>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sponsors
            </h2>
            <p className="text-xl text-gray-300">
              Meet our amazing sponsors powering this hackathon
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-8 text-black"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={tech.logo} 
                    alt={`${tech.name} logo`} 
                    className="w-12 h-12 mr-4"
                  />
                  <h3 className="text-2xl font-bold">{tech.name}</h3>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {tech.description}
                </p>
                
                <button className={`px-6 py-2 rounded-lg bg-gradient-to-r ${tech.color} text-white font-medium hover:opacity-90 transition-opacity`}>
                  {tech.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLandingPage;