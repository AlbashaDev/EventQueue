// Configuration for deployment environments

// Allow for Cross-Origin Resource Sharing (CORS) settings based on environment
export const getAllowedOrigins = (): string[] => {
  const origins = [];

  // Development origin (localhost)
  origins.push('http://localhost:3000');
  origins.push('http://localhost:5000');
  
  // Frontend deployment URL - replace with your actual Vercel deployment URL when known
  // This should be updated after deploying your frontend to Vercel
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    origins.push(frontendUrl);
  }
  
  return origins;
};

// Function to get the proper port for different environments
export const getPort = (): number => {
  return parseInt(process.env.PORT || '5000', 10);
};

// Function to determine if we're in production mode
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};