// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

// module.exports = getDefaultConfig(__dirname);

// See https://github.com/tensorflow/tfjs/tree/master/tfjs-react-native
module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const { assetExts } = defaultConfig.resolver;
  return {
    resolver: {
      // Add bin to assetExts
      assetExts: [...assetExts, 'bin'],
    }
  };
})();
