import {EnvironmentData} from '../utils/environment';
import {KinesisManager} from '../utils/kinesisManager';

export class Consumer {

    private shardIteratorOutput: AWS.Kinesis.GetShardIteratorOutput[];
    private environmentData: EnvironmentData;
    private kinesisManager: KinesisManager;
    
    constructor(environment: EnvironmentData, kinesisManager: KinesisManager) {
        this.environmentData = environment;
        this.kinesisManager = kinesisManager;
    }

    public async readFromStream(): Promise<AWS.Kinesis.Record[]> {
        await this.checkShardIterator();
        const messages = await this.kinesisManager.getMessagesFromKinesisStream(this.shardIteratorOutput);
        await this.setShardIterator();
        return messages;
    }

    private async checkShardIterator(): Promise<void> {
        if(!this.shardIteratorOutput) {
            this.shardIteratorOutput = await this.kinesisManager.getShardIterator(this.environmentData.streamToRead);
        }
    }

    private async setShardIterator(): Promise<void> {
        this.shardIteratorOutput = await this.kinesisManager.getShardIterator(this.environmentData.streamToRead);
    }
}