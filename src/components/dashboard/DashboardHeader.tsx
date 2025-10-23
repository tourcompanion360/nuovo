import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="relative">
      <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute -top-2 -right-8 w-24 h-24 bg-metric-violet/20 rounded-full blur-2xl animate-pulse-glow" 
           style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-3">
          <span className="gradient-text-enhanced">Dashboard</span>
        </h1>
        <p className="text-foreground-secondary text-lg">
          Panoramica completa delle performance dei tuoi tour virtuali
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;