import {EnvironmentData} from '../utils/environment';
import {KinesisManager} from '../utils/kinesisManager';
import {MessagePackHelper} from '../utils/messagePackHelper';
import {Logger} from '../utils/logger';

export class Producer {
    private environmentData: EnvironmentData;
    private kinesisManager: KinesisManager;
    
    constructor(environment: EnvironmentData, kinesisManager: KinesisManager) {
        this.environmentData = environment;
        this.kinesisManager = kinesisManager;
    }

    public produceResult(records: AWS.Kinesis.Record[]): Promise<AWS.Kinesis.PutRecordsOutput> {
        const putRecordsRequest = this.generatePutRecordRequest(records);
        return this.kinesisManager.putMultipleRecordsOnKinesisStream(putRecordsRequest);
    }

    private generatePutRecordRequest(records: AWS.Kinesis.Record[]) {
        let putRecordsInput: AWS.Kinesis.PutRecordsInput = {
            StreamName: this.environmentData.streamToWrite,
            Records: []
        };
        for(let record of records) {
            let decodedMessage = MessagePackHelper.decodeMessagePackData(record.Data);
            Logger.debug('Data from consumed message: ' + decodedMessage);
            let formattedMessage = 'MESSAGE FOUND: ' + decodedMessage;
            let recordToAdd: AWS.Kinesis.PutRecordsRequestEntry = {
                Data: MessagePackHelper.encodeMessagePackData(formattedMessage),
                PartitionKey: record.PartitionKey
            }
            putRecordsInput.Records.push(recordToAdd);
        }
        return putRecordsInput;
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