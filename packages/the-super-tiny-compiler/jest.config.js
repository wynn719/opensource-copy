module.exports = {
  rootDir: __dirname,
  preset: 'ts-jest',
  bail: true,
  verbose: true,
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^~test/(.*)$': '<rootDir>/test/$1'
  },
  testTimeout: 50000,
  testMatch: ['<rootDir>/test/**/*.spec.{js,ts}'],
  collectCoverage: true
}
