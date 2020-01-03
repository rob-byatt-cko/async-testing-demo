
# Message queue testing demo

This is a demo project to demonstrate the technical approach to building an integration test suite for micro-services which communicate using message queues.

# Project structure

## Local stack

Local stack is a tool we use to simulate AWS services on a local machine. In this project local stack is configured to create two kinesis streams. One for the demo application to read from and one for it to write to.

Learn more about local stack [at their github](https://github.com/localstack/localstack).

## Demo application

The app directory contains a basic application written in Typescript. When running the application reads from the 'read' queue once every Xms (default one read per second). If the application reads a message it will then produce another message to the write queue.

The application is an extremely simple modal of a micro-service which would be under test in an infrastructure where services use message queues to communicate. 

The application takes an input and creates an output but there is no confirmation that a message has been received or processed.

## Test project

The test directory contains a simple cucumber test project written in JavaScript for testing the the demo application. There are helper methods present for interacting with AWS (local stack).

# Run project

## Prerequisites

### Docker
In order to run Local Stack and the demo application you'll need docker desktop installed and running. [Get docker desktop](https://www.docker.com/products/docker-desktop).

### Node JS
Install Node JS LTS. [Get Node](https://nodejs.org/en/).

## Start Local Stack

To start local stack navigate to the root directory in the command line and run: `docker-compose up -d localstack`.

## Start application

Once local stack is running and fully initialised the demo application can be started.

To start the application run: `docker-compose up demo-application`. 

If the service has started correctly you will see the following:
```
demo-application    | --------------------------
demo-application    | Connected to Kinesis. Listening to queue.
demo-application    | --------------------------
demo-application    | --------------------------
demo-application    | Service active 03/01/20 15:52:04
demo-application    | --------------------------
```

## Run tests

To run tests CD to the `/test` directory. Run `npm install` to get all dependencies.

To run tests run `npm run test`. Note the test steps will not pass by default as the methods return `pending`.