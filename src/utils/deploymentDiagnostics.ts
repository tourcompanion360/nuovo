/**
 * Deployment Diagnostics Tool
 * Helps identify differences between local and deployed environments
 */

export const runDeploymentDiagnostics = () => {
  const diagnostics = {
    environment: {
      isLocal: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      isProduction: import.meta.env.PROD,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port,
      pathname: window.location.pathname,
    },
    assets: {
      basePath: import.meta.env.BASE_URL,
      viteEnv: import.meta.env.MODE,
    },
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    },
    errors: [] as string[],
    warnings: [] as string[],
  };

  // Check for common deployment issues
  console.log('🔍 Running deployment diagnostics...');
  console.log('Environment:', diagnostics.environment);
  console.log('Assets:', diagnostics.assets);
  console.log('Supabase:', diagnostics.supabase);

  // Check if we're in a subdirectory
  if (diagnostics.environment.pathname !== '/' && !diagnostics.environment.isLocal) {
    diagnostics.warnings.push('App is running in a subdirectory - check base path configuration');
  }

  // Check for HTTPS in production
  if (diagnostics.environment.isProduction && diagnostics.environment.protocol !== 'https:') {
    diagnostics.warnings.push('Production app is not using HTTPS');
  }

  // Check Supabase configuration
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    diagnostics.errors.push('Supabase environment variables are missing');
  }

  // Test asset loading
  const testAsset = document.createElement('script');
  testAsset.src = './assets/index-CU0xPZjg.js';
  testAsset.onerror = () => {
    diagnostics.errors.push('Main application script failed to load');
  };
  testAsset.onload = () => {
    console.log('✅ Main application script loaded successfully');
  };
  document.head.appendChild(testAsset);

  // Test CSS loading
  const testCSS = document.createElement('link');
  testCSS.rel = 'stylesheet';
  testCSS.href = './assets/index-CGA1F0yl.css';
  testCSS.onerror = () => {
    diagnostics.errors.push('Main CSS file failed to load');
  };
  testCSS.onload = () => {
    console.log('✅ Main CSS file loaded successfully');
  };
  document.head.appendChild(testCSS);

  // Log results
  if (diagnostics.errors.length > 0) {
    console.error('❌ Deployment errors found:', diagnostics.errors);
  }
  if (diagnostics.warnings.length > 0) {
    console.warn('⚠️ Deployment warnings:', diagnostics.warnings);
  }

  return diagnostics;
};

// Auto-run diagnostics in development
if (import.meta.env.DEV) {
  console.log('🔧 Development mode - running diagnostics...');
  setTimeout(runDeploymentDiagnostics, 1000);
}
