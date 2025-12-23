module.exports = function (api) {
  // Check if we're running tests BEFORE caching
  const isTest = process.env.NODE_ENV === 'test' || api.caller((caller) => caller?.name === 'babel-jest');

  api.cache(true);

  if (isTest) {
    // For tests, use minimal babel config - jest-expo will handle the rest
    return {
      presets: ['babel-preset-expo'],
      // Skip reanimated plugin for tests
    };
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};

