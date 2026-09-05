module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-svg|@react-navigation|jotai-tanstack-query|jotai-family)/)',
  ],
};
