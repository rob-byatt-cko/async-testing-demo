import * as dotenv from 'dotenv'; dotenv.config();
import {Environment, EnvironmentData} from './utils/environment';
import {Consumer} from './consumer/consumer';
import {Producer} from './producer/producer';
import { KinesisManager } from './utils/kinesisManager';
import {Logger} from './utils/logger';

const program = async () => {
    try {
        const environment: EnvironmentData = Environment.getEnvironment();
        const kinesisManager: KinesisManager = new KinesisManager(environment);
        const consumer = new Consumer(environment, kinesisManager);
        const producer = new Producer(environment, kinesisManager);
        await kinesisManager.checkKinesisConnection();
        while(true) {
            let messages = await consumer.readFromStream();
            // await producer.generateTestReadRecord(5);
            if(messages.length >= 1) {
                Logger.info(`${messages.length} messages consumed from queue`);
                await producer.produceResult(messages);
            }
            else {
                Logger.info(`No records found. Waiting ${environment.consumeIntervalMs}ms before retry`);
            }
            await new Promise(resolve => setTimeout(resolve, environment.consumeIntervalMs));
        }
    }
    catch(e) {
        Logger.info(`Error state encountered '${e}'. Stopping program.`);
        process.exit();
    }
}

program();