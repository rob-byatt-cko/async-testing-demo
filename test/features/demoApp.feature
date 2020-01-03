Feature: Demo app reads from kinesis
As a demo app user
I want to see an output from the demo app
so that I know that my message has been consumed

Scenario: New messages are consumed correctly
Given A message is posted to the demo app
Then The demo app reads and responds to the message