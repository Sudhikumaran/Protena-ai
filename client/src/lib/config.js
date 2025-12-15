export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  enableAiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
}

// Validate required config
if (!config.clerkPublishableKey) {
  console.error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable')
}

export default config
