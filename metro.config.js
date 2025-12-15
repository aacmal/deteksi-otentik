const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add .tflite file support
config.resolver.assetExts.push('tflite');

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  config.transformer.minifierConfig = {
    compress: {
      // Remove console.log in production
      drop_console: true,
    },
  };
}

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
