const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  // Fix for tslib module resolution on web
  unstable_enablePackageExports: false,
  // Custom resolver to intercept problematic imports
  resolveRequest: (context, moduleName, platform) => {
    // Force tslib to resolve to CommonJS version for web
    if (platform === 'web' && moduleName === 'tslib') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
        type: 'sourceFile',
      };
    }
    
    // Use default resolver for everything else
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
