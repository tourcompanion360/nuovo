import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientOnboarding } from './ClientOnboarding';
import { 
  Play, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Users,
  BarChart3,
  MessageSquare,
  Smartphone
} from 'lucide-react';

export const ClientOnboardingDemo: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleStartDemo = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Client Onboarding System
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Experience the new onboarding flow for end clients
        </p>
        <Button 
          onClick={handleStartDemo}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Demo
        </Button>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Welcome Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Personalized welcome with project overview and key features
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Analytics Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Learn how to track performance and understand your data
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Discover your 24/7 AI chatbot and its capabilities
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Mobile App</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Learn how to install and use the mobile app
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-center">Why This Onboarding Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">For Clients:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Clear understanding of available features
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Reduced confusion and support requests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Better engagement with the platform
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Professional first impression
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">For You:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Fewer support tickets and questions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Higher client satisfaction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Better feature adoption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Professional brand image
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <ClientOnboarding
          projectId="demo-project-123"
          clientName="Demo Client"
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
};

