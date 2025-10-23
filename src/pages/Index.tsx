
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import Support from '@/components/Support';
import TourVirtuali from '@/components/TourVirtuali';
import Richieste from '@/components/Richieste';
import MediaLibrary from '@/components/MediaLibrary';
import Settings from '@/components/Settings';
import ChatbotManagement from '@/components/ChatbotManagement';
import ClientDashboard from '@/components/ClientDashboard';
import ClientManagement from '@/components/ClientManagement';
import ChatbotRequestsView from '@/components/creator/ChatbotRequestsView';
import SEOStructuredData from '@/components/SEOStructuredData';
import { AgencyProvider } from '@/contexts/AgencyContext';
import { handleShortcuts } from '@/utils/pwaUtils';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('projects');
  const [prefilledRequest, setPrefilledRequest] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Handle PWA shortcuts on component mount
  useEffect(() => {
    handleShortcuts(setCurrentPage);
  }, []);

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
    setCurrentPage('client-dashboard');
  };

  const handleBackToProjects = () => {
    setSelectedClient(null);
    setCurrentPage('projects');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'projects':
        return <TourVirtuali onPageChange={setCurrentPage} onCreateRequest={setPrefilledRequest} onClientClick={handleClientClick} />;
      case 'client-dashboard':
        return <ClientDashboard client={selectedClient} onBack={handleBackToProjects} />;
      case 'client-requests':
        return <Richieste prefilledData={prefilledRequest} onDataUsed={() => setPrefilledRequest(null)} />;
      case 'media-library':
        return <MediaLibrary />;
      case 'clients':
        return <ClientManagement onClientSelect={handleClientClick} />;
      case 'analytics':
        return <Dashboard />;
      case 'chatbots':
        return <ChatbotRequestsView />;
      case 'support':
        return <Support />;
      case 'settings':
        return <Settings />;
      default:
        return <TourVirtuali onPageChange={setCurrentPage} onCreateRequest={setPrefilledRequest} onClientClick={handleClientClick} />;
    }
  };

  return (
    <AgencyProvider>
      <SEOStructuredData type="website" />
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </AgencyProvider>
  );
};

export default Index;
