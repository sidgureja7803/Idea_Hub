import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  BarChart3,
  Users,
  Target,
  Zap,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Cpu,
  Rocket,
  TrendingUp,
  Shield,
  Globe,
  Code,
} from "lucide-react";

const NewLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "AI-powered market research with real-time data analysis",
      gradient: "from-primary-500 to-accent-cyan",
    },
    {
      icon: Target,
      title: "TAM/SAM Analysis",
      description: "Precise market sizing using advanced ML algorithms",
      gradient: "from-accent-purple to-primary-500",
    },
    {
      icon: Users,
      title: "Competitive Mapping",
      description: "Deep competitor analysis and positioning insights",
      gradient: "from-accent-emerald to-accent-cyan",
    },
    {
      icon: Brain,
      title: "Strategic AI",
      description: "Llama-powered strategic recommendations via Cerebras",
      gradient: "from-accent-orange to-accent-purple",
    },
  ];

  const technologies = [
    {
      name: "Cerebras",
      icon: Cpu,
      description:
        "Ultra-fast AI inference with the world's largest AI chip. Powers our Llama models for lightning-fast startup validation and market analysis.",
      gradient: "from-orange-500 to-red-500",
      stats: "1.5s avg latency",
    },
    {
      name: "Llama 3",
      icon: Brain,
      description:
        "Meta's most advanced open-source language model. Delivers human-like reasoning for complex business analysis and strategic insights.",
      gradient: "from-blue-600 to-indigo-600",
      stats: "70B parameters",
    },
    {
      name: "Multi-Agent AI",
      icon: Zap,
      description:
        "Specialized AI agents working in parallel. Each agent focuses on specific aspects: market research, competition, feasibility, and strategy.",
      gradient: "from-purple-600 to-pink-600",
      stats: "5 AI agents",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Describe Your Vision",
      description:
        "Share your startup idea. Our AI conducts intelligent follow-up questions to understand your vision completely.",
      icon: Lightbulb,
      color: "text-accent-cyan",
    },
    {
      step: "02",
      title: "AI Analysis Pipeline",
      description:
        "Watch as 5 specialized AI agents analyze your idea in real-time using Llama models on Cerebras infrastructure.",
      icon: Cpu,
      color: "text-accent-purple",
    },
    {
      step: "03",
      title: "Strategic Insights",
      description:
        "Receive comprehensive market analysis, competitive positioning, and actionable go-to-market strategies.",
      icon: Target,
      color: "text-accent-emerald",
    },
  ];

  const stats = [
    { label: "Ideas Analyzed", value: "10,000+", icon: Lightbulb },
    { label: "Avg Analysis Time", value: "2.3 min", icon: Zap },
    { label: "Success Rate", value: "99.7%", icon: TrendingUp },
    { label: "AI Agents", value: "5", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800"></div>
        <div
          className="absolute w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: "all 0.3s ease-out",
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent-purple/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent-cyan/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-effect mb-8">
            <Sparkles className="h-4 w-4 text-accent-cyan" />
            <span className="text-sm font-medium">
              Powered by Cerebras + Llama 3
            </span>
            <Sparkles className="h-4 w-4 text-accent-purple" />
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="gradient-text">Validate</span>
            <br />
            <span className="text-white">Your Startup</span>
            <br />
            <span className="gradient-text">In Minutes</span>
          </h1>

          <p className="text-xl md:text-2xl text-dark-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform raw business ideas into comprehensive, data-driven market
            analyses with
            <span className="text-accent-cyan font-semibold">
              {" "}
              AI-powered insights
            </span>{" "}
            and
            <span className="text-accent-purple font-semibold">
              {" "}
              strategic recommendations
            </span>
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="card-dark rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-200"
              >
                <stat.icon className="h-8 w-8 text-primary-400 mx-auto mb-3 group-hover:animate-pulse" />
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
            <Link to="/submit" className="btn-primary group">
              <Rocket className="h-5 w-5 mr-2 group-hover:animate-bounce" />
              <span>Validate Your Idea</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/hackathon-demo" className="btn-ghost group">
              <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              <span>Live Demo</span>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-dark rounded-xl p-8 group hover:scale-105 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:animate-glow`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-dark-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 py-32 bg-gradient-to-b from-transparent to-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Our AI-powered pipeline analyzes your startup idea through
              multiple specialized agents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-2xl glass-effect mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className={`h-12 w-12 ${step.color}`} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-cyan flex items-center justify-center text-xs font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-dark-300 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="gradient-text">Powered By</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto">
              Cutting-edge AI infrastructure delivering unprecedented speed and
              accuracy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="card-dark rounded-2xl p-8 group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${tech.gradient} p-4 mr-4 group-hover:animate-glow`}
                  >
                    <tech.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                      {tech.name}
                    </h3>
                    <div className="text-sm text-accent-cyan font-medium">
                      {tech.stats}
                    </div>
                  </div>
                </div>

                <p className="text-dark-300 leading-relaxed mb-6">
                  {tech.description}
                </p>

                <div
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r ${tech.gradient} text-white font-medium text-sm`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Enterprise Grade</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-32 bg-gradient-to-t from-dark-900 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card-dark rounded-3xl p-16">
            <Globe className="h-16 w-16 text-primary-400 mx-auto mb-8 animate-pulse-slow" />
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="gradient-text">Ready to Launch?</span>
            </h2>
            <p className="text-xl text-dark-300 mb-12 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who've validated their ideas with
              AI-powered insights
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/submit"
                className="btn-primary group text-lg px-8 py-4"
              >
                <Rocket className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                <span>Start Validation</span>
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/dashboard"
                className="btn-ghost group text-lg px-8 py-4"
              >
                <Code className="h-6 w-6 mr-3" />
                <span>View Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLandingPage;
