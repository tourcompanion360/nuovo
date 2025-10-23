import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  BarChart3, 
  MessageSquare, 
  Eye, 
  Users, 
  Globe,
  Smartphone,
  Download,
  Bell,
  Shield,
  Zap,
  Star,
  X,
  Play,
  TrendingUp,
  Clock
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface FirstTimeVisitorOnboardingProps {
  projectId: string;
  clientName: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const FirstTimeVisitorOnboarding: React.FC<FirstTimeVisitorOnboardingProps> = ({
  projectId,
  clientName,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Welcome to Your Dashboard, ${clientName}!`,
      description: 'Let\'s get you familiar with your project portal',
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your Project Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">
              This is your personal command center where you can track your project's performance, 
              view analytics, and manage your virtual tour experience.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Secure Access</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Real-time Data</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Analytics Overview',
      description: 'Track your project performance',
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your project's performance with detailed insights and metrics.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Visitor Tracking</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">See who's viewing your project</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Lead Generation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track potential customers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Performance Metrics</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement and conversion rates</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Dashboard Navigation',
      description: 'Learn how to navigate your dashboard',
      icon: <Globe className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Globe className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Dashboard Tabs</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use the tabs below to navigate between different sections of your dashboard.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Overview</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Project summary and key metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Detailed performance data</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Requests</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submit and track requests</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mobile',
      title: 'Mobile Access',
      description: 'Access your dashboard on mobile',
      icon: <Smartphone className="h-6 w-6 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Smartphone className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Mobile Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your dashboard is fully responsive and works great on mobile devices.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Download className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Mobile Optimized</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Touch-friendly interface</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Real-time Updates</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stay updated on the go</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Fast Loading</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Optimized for mobile performance</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start exploring your dashboard',
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to Your Dashboard!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You now have full access to your project dashboard. Explore all the features and 
              start tracking your project's success.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track performance</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Requests</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Submit requests</p>
            </div>
          </div>
        </div>
      ),
      action: {
        text: 'Start Exploring',
        onClick: () => {
          localStorage.setItem(`first-visit-completed-${projectId}`, 'true');
          onComplete();
        }
      }
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem(`first-visit-completed-${projectId}`, 'true');
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`first-visit-completed-${projectId}`, 'true');
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <div>
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

