import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { AgencyProviderSimplified } from "@/contexts/AgencyContextSimplified";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRouteSimplified from "./components/ProtectedRouteSimplified";
import AdminRoute from "./components/AdminRoute";
import DevModeBanner from "./components/DevModeBanner";
import UltimateFallback from "./UltimateFallback";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Billing = lazy(() => import("./pages/Billing"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TestClientPortal = lazy(() => import("./pages/TestClientPortalView"));
const TestClientPortalView = lazy(() => import("./pages/TestClientPortalView"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));

// Enhanced loading component - use UltimateFallback
const LoadingFallback = () => <UltimateFallback />;

// Enhanced error fallback - use UltimateFallback
const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => <UltimateFallback />;

const AppSimplified = () => {
  console.log('🎯 [AppSimplified] Rendering simplified app...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DevModeBanner />
        <ErrorBoundary fallback={ErrorFallback}>
          <BrowserRouter>
            <AgencyProviderSimplified>
              <NotificationProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route
                      path="/pricing"
                      element={
                        <ProtectedRouteSimplified requiredRole="creator">
                          <Pricing />
                        </ProtectedRouteSimplified>
                      }
                    />
                    <Route
                      path="/billing"
                      element={
                        <ProtectedRouteSimplified requiredRole="creator">
                          <Billing />
                        </ProtectedRouteSimplified>
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <ErrorBoundary fallback={ErrorFallback}>
                          <ProtectedRouteSimplified>
                            <Index />
                          </ProtectedRouteSimplified>
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ErrorBoundary fallback={ErrorFallback}>
                          <ProtectedRouteSimplified>
                            <Index />
                          </ProtectedRouteSimplified>
                        </ErrorBoundary>
                      }
                    />
                    {/* Client dashboard - completely public, no authentication */}
                    <Route
                      path="/client/:projectId"
                      element={<ClientDashboard />}
                    />
                    {/* Legacy dashboard route - redirects to main client route */}
                    <Route
                      path="/client/:projectId/dashboard"
                      element={<ClientDashboard />}
                    />
                    {/* Test route for client portal - bypasses magic link requirement */}
                    <Route
                      path="/test-client/:projectId"
                      element={<TestClientPortalView />}
                    />
                    <Route
                      path="/test-portal"
                      element={
                        <ProtectedRouteSimplified>
                          <TestClientPortal />
                        </ProtectedRouteSimplified>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ErrorBoundary fallback={ErrorFallback}>
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/portal/:projectId"
                      element={
                        <ProtectedRouteSimplified>
                          <ClientPortal />
                        </ProtectedRouteSimplified>
                      }
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </NotificationProvider>
            </AgencyProviderSimplified>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppSimplified;
