const {Given, When, Then} = require('cucumber');
const AwsMessageBuilder = require('../data/generateMessage').AwsMessageBuilder;
const awsHelper = require('../lib/awsHelper');
const awsConnectionHelper = new awsHelper.AwsConnectionHelper();
const messagePackHelper = require('../lib/messagePackHelper').MessagePackHelper;
const expect = require('chai').expect;

const availableStreams = {
  readStream: process.env.STREAM_TO_READ,
  writeStream: process.env.STREAM_TO_WRITE
}

Given('A message is posted to the demo app', async function () {
  return 'pending';
})

Then('The demo app reads and responds to the message', async function () {
  return 'pending';
})