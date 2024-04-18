module.exports = {
  globalSetup: './jest.global-setup.js',
  globalTeardown: './jest.global-teardown.js',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
};
