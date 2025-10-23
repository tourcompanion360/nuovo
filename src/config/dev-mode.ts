/**
 * Developer Mode Configuration
 * Allows full testing of the app without Stripe payments or restrictions
 */

export interface DevModeConfig {
  enabled: boolean;
  testUser: {
    email: string;
    password: string;
    fullName: string;
  };
  bypasses: {
    subscription: boolean;
    payment: boolean;
    authentication: boolean;
    featureLimits: boolean;
  };
  features: {
    showDevBanner: boolean;
    allowTestData: boolean;
    enableDebugLogs: boolean;
  };
}

// Development mode configuration
export const devModeConfig: DevModeConfig = {
  // Dev mode disabled; remain false in all builds
  enabled: false,
  testUser: {
    email: 'samirechchttioui@gmail.com',
    password: 'test123456',
    fullName: 'Samir Echchttioui (Developer)'
  },
  bypasses: {
    subscription: false,
    payment: false,
    authentication: false,
    featureLimits: false
  },
  features: {
    showDevBanner: false,
    allowTestData: false,
    enableDebugLogs: false
  }
};

// Helper functions
export const isDevMode = (): boolean => false;

export const canBypassSubscription = (): boolean => false;

export const canBypassPayment = (): boolean => false;

export const canBypassFeatureLimits = (): boolean => false;

export const shouldShowDevBanner = (): boolean => false;

export const isTestUser = (email: string): boolean => false;

export const getTestUserCredentials = () => devModeConfig.testUser;


