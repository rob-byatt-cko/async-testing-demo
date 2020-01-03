import * as AWS from 'aws-sdk';
import {EnvironmentData} from './environment';
import { Logger } from './logger';

export class KinesisManager {

    private kinesisInstance: AWS.Kinesis;
    private environmentData: EnvironmentData;

    constructor(environment: EnvironmentData) {
        this.environmentData = environment;
        this.kinesisInstance = this.generateKinesisInstance();
    }

    private generateKinesisInstance(): AWS.Kinesis {
        const config = {
            endpoint: this.environmentData.kinesisEndpoint, 
            region: this.environmentData.awsRegion,
        };
        return new AWS.Kinesis(config);
    }

    private describeStream(stream:string): Promise<AWS.Kinesis.DescribeStreamOutput> {
        let describeStreamInput: AWS.Kinesis.DescribeStreamInput = {
            StreamName: stream
        }
        return new Promise((resolve, reject) => {
            this.kinesisInstance.describeStream(describeStreamInput, (err, data) => {
                if(err)
                    return reject(err)
                return resolve(data)
            });
        });
    }

    public async getShardIterator(streamName:string): Promise<AWS.Kinesis.GetShardIteratorOutput[]> {
        let describeStreamParams = {
            StreamName: streamName
        }
        let describeStream:AWS.Kinesis.DescribeStreamOutput = await this.describeStream(streamName);
        let shards = describeStream.StreamDescription.Shards;
        let getShardIteratorParams = shards.map((shard) => {
            return {
                ShardId: shard.ShardId,
                ShardIteratorType: 'LATEST',
                StreamName: describeStreamParams.StreamName,
            }
        })
        let promises = getShardIteratorParams.map((params) => {
            return new Promise<AWS.Kinesis.GetShardIteratorOutput>((resolve, reject) => {
                this.kinesisInstance.getShardIterator(params, (err, data) => {
                    if(err) {return reject(err)}
                    else {return resolve(data)}
                })
            });
        })
        return Promise.all(promises);
    }

    public async getMessagesFromKinesisStream(ShardIteratorResponses:AWS.Kinesis.GetShardIteratorOutput[]): Promise<AWS.Kinesis.Record[]> {
        let records = await Promise.all(ShardIteratorResponses.map(response => this.getMessage(response)))
        return records.reduce(function(left, right) { return left.concat(right) });
    }

    public putMultipleRecordsOnKinesisStream(records: AWS.Kinesis.PutRecordsInput): Promise<AWS.Kinesis.PutRecordsOutput> {
        return new Promise((resolve, reject) => {
            this.kinesisInstance.putRecords(records, (err, data) => {
                if(err) 
                    return reject(err);
                return resolve(data)
            })
        });
    }

    private getMessage(ShardIteratorResponse:AWS.Kinesis.GetShardIteratorOutput): Promise<AWS.Kinesis.Record[]> {
        let recordParams = {ShardIterator: ShardIteratorResponse.ShardIterator}
        return new Promise((resolve, reject) => {
            this.kinesisInstance.getRecords(recordParams, (err, data) => {
                if(err) {return reject(err)}
                else {return resolve(data.Records)}
            })
        });
    }

    public async checkKinesisConnection(retryCount = 5):Promise<void> {
        try { 
            await this.describeStream(this.environmentData.streamToRead);
        }
        catch(e) {
            if(retryCount > 0) {
                Logger.info(`Unable to connect to Kinesis. ${retryCount} retries remaining`);
                await new Promise(resolve => setTimeout(resolve, 500));
                retryCount--;
                await this.checkKinesisConnection(retryCount);
            }
            else {
                throw e;
            }
        }
    }
}