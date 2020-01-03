require('dotenv').config();

let common = [
    'features/**/*.feature', // Specify our feature files
    '--require steps/**/*.js', // Load step definitions
    '--format node_modules/cucumber-pretty', // Load custom formatter
  ].join(' ');
  module.exports = {
    default: common
  };