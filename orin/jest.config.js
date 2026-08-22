module.exports = {
  preset: 'jest-expo',
  collectCoverageFrom: ['lib/**/*.{js,jsx}', 'utils/**/*.{js,jsx}', '!**/__tests__/**'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
