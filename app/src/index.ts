import * as dotenv from 'dotenv'; dotenv.config();
import {Environment, EnvironmentData} from './utils/environment';
import {Consumer} from './consumer/consumer';
import {Producer} from './producer/producer';
import { KinesisManager } from './utils/kinesisManager';
import {Logger} from './utils/logger';
import * as moment from 'moment';

const program = async () => {
    try {
        const environment: EnvironmentData = Environment.getEnvironment();
        const kinesisManager: KinesisManager = new KinesisManager(environment);
        const consumer = new Consumer(environment, kinesisManager);
        const producer = new Producer(environment, kinesisManager);
        let count = 0;
        await kinesisManager.checkKinesisConnection();
        Logger.info('Connected to Kinesis. Listening to queue.');
        while(true) {
            let messages = await consumer.readFromStream();
            if(messages.length >= 1) {
                Logger.info(`${messages.length} messages consumed from queue.`);
                await producer.produceResult(messages);
            }
            if(count % 60 === 0)
                Logger.info('Service active ' + moment().format('DD[/]MM[/]YY HH:mm:ss'));
            count++;
            await new Promise(resolve => setTimeout(resolve, environment.consumeIntervalMs));
        }
    }
    catch(e) {
        Logger.info(`Error state encountered '${e}'. Stopping program.`);
        process.exit();
    }
}
program();