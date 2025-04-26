module.exports = {
  // Run earlier than the Next.js plugin
  order: 0,
  
  // Override the Next.js plugin's onBuild hook
  async onPreBuild({ utils }) {
    console.log('🛑 Disabling Next.js plugin - using custom static export instead');
    
    // Set an environment variable to disable the Next.js plugin
    process.env.NETLIFY_NEXT_PLUGIN_SKIP = 'true';
    
    // Log success message
    utils.status.show({
      title: 'Next.js plugin disabled',
      summary: 'Using custom static export instead',
      text: 'The Next.js plugin has been disabled for this build.'
    });
  }
}; 