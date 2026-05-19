import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, BarChart3, Zap, ShieldCheck, Mail } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-8 mx-auto max-w-7xl">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Bot size={24} />
          </div>
          <span>AutoSEO.ai</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <Link 
          href="/dashboard" 
          className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-200 transition-colors"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 mx-auto max-w-7xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Zap size={14} />
          <span>The Future of Search is Autonomous</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
          The World's First Fully <br className="hidden md:block" /> Autonomous SEO Engine.
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          No dashboards to check. No tasks to manage. Just plug in your domain, and our AI works 24/7 to research, audit, and rank your site while you sleep.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto bg-indigo-600 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all group"
          >
            Start Your Free Trial
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="w-full sm:w-auto border border-neutral-800 px-8 py-4 rounded-xl font-bold hover:bg-neutral-900 transition-all">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-24 bg-neutral-900/50 border-y border-neutral-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Set it and Forget it.</h2>
            <p className="text-neutral-400">Our agents handle the entire SEO lifecycle autonomously.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500/50 transition-colors">
              <div className="bg-indigo-500/10 p-3 rounded-xl w-fit mb-6 text-indigo-500">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Predictive Keyword Research</h3>
              <p className="text-neutral-400 leading-relaxed">AI analyzes search trends before they peak, finding low-competition opportunities for your niche.</p>
            </div>
            <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500/50 transition-colors">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit mb-6 text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Tech Audits</h3>
              <p className="text-neutral-400 leading-relaxed">Continuous monitoring of Core Web Vitals and technical health with automatic fix suggestions.</p>
            </div>
            <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500/50 transition-colors">
              <div className="bg-purple-500/10 p-3 rounded-xl w-fit mb-6 text-purple-500">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Monthly Intelligent Reports</h3>
              <p className="text-neutral-400 leading-relaxed">Get a comprehensive, actionable report in your inbox every month. Zero human interaction required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-neutral-800">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold tracking-tighter opacity-50">
            <Bot size={20} />
            <span>AutoSEO.ai</span>
          </div>
          <p className="text-neutral-500 text-sm">© 2026 AutoSEO Inc. All rights reserved.</p>
          <div className="flex gap-6 text-neutral-500 text-sm">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
