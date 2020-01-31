import {EnvironmentData} from '../utils/environment';
import {KinesisManager} from '../utils/kinesisManager';
import {MessagePackHelper} from '../utils/messagePackHelper';
import {Logger} from '../utils/logger';

export type ExpectedMessageStructure = {
    id: number;
    keyToProduce: string;
}

export class Producer {
    private environmentData: EnvironmentData;
    private kinesisManager: KinesisManager;
    private consumedMessages: number = 0;
    
    constructor(environment: EnvironmentData, kinesisManager: KinesisManager) {
        this.environmentData = environment;
        this.kinesisManager = kinesisManager;
    }

    public async produceResult(records: AWS.Kinesis.Record[]): Promise<any> {
        const putRecordsRequest = this.generatePutRecordRequest(records);
        if(putRecordsRequest.Records.length >=1)
            await this.kinesisManager.putMultipleRecordsOnKinesisStream(putRecordsRequest);
    }

    private generatePutRecordRequest(records: AWS.Kinesis.Record[]) {
        let putRecordsInput: AWS.Kinesis.PutRecordsInput = {
            StreamName: this.environmentData.streamToWrite,
            Records: []
        };
        for(let record of records) {
            let decodedMessage: ExpectedMessageStructure = MessagePackHelper.decodeMessagePackData(record.Data);
            if(this.validateMessage(decodedMessage)) {
                let messageToPut = this.createResponseMessage(decodedMessage);
                putRecordsInput.Records.push(messageToPut);
            }
        }
        return putRecordsInput;
    }

    private validateMessage(message: ExpectedMessageStructure): boolean {
        if(!message.id) {
            Logger.info('Unable to process message. \'id\' is not defined');
            return false;
        }
        if(!message.keyToProduce) {
            Logger.info('Unable to process message. \'keyToProduce\' is not defined');
            return false;
        }
        return true;
    }

    private createResponseMessage(record: ExpectedMessageStructure): AWS.Kinesis.PutRecordsRequestEntry {
        this.consumedMessages++;
        return {
            Data: MessagePackHelper.encodeMessagePackData({id: record.id, messagesProcessedByService: this.consumedMessages}),
            PartitionKey: record.keyToProduce
        }
    }

    public generateTestReadRecord(numberToProduce: number) {
        let putRecordsInput: AWS.Kinesis.PutRecordsInput = {
            StreamName: this.environmentData.streamToRead,
            Records: []
        };
        for(let number = 1; number <= numberToProduce; number++) {
            let recordToAdd = {
                Data: MessagePackHelper.encodeMessagePackData('TEST READ RECORD #' + number),
                PartitionKey: 'TEST PARTITION KEY #' + number
            }
            putRecordsInput.Records.push(recordToAdd);
        }
        return this.kinesisManager.putMultipleRecordsOnKinesisStream(putRecordsInput);
    }
}