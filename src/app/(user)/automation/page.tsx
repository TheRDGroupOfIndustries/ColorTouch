"use client";

import React from "react";
import { Sparkles, Zap, Clock, Bell } from "lucide-react";

export default function Automation() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated Gradient Background */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl opacity-30">
            <div className="w-64 h-64 mx-auto rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 animate-pulse" />
          </div>
          
          {/* Icon */}
          <div className="relative z-10 w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-1">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <Zap className="w-16 h-16 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text" style={{ stroke: "url(#gradient)" }} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Coming Soon Text with Gradient */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          Coming Soon
        </h1>

        <p className="text-xl text-gray-400 mb-8">
          Powerful automation features are on the way
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">Smart Workflows</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-pink-600/20 border border-pink-500/30">
            <Clock className="w-4 h-4 text-pink-400" />
            <span className="text-pink-300 text-sm">Scheduled Tasks</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30">
            <Bell className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 text-sm">Auto Notifications</span>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-3">
            What to expect
          </h3>
          <ul className="text-left space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
              <span>Automated lead follow-ups based on custom triggers</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 flex-shrink-0" />
              <span>Scheduled WhatsApp campaigns with intelligent timing</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
              <span>Workflow automation to streamline your sales process</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
              <span>AI-powered lead scoring and prioritization</span>
            </li>
          </ul>
        </div>

        {/* Subtle animated dots */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
