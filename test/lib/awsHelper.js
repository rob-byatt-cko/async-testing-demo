const AWS = require("aws-sdk");

class AwsConnectionHelper {

    KinesisInstance;

    constructor() {
        this.KinesisInstance = this.generateKinesisInstance();
    }
        
    generateKinesisInstance() {
        const config = {
            endpoint: process.env.KINESIS_ENDPOINT, 
            region: process.env.AWS_REGION,
        };
        return new AWS.Kinesis(config);
    }

    async getShardIterator(streamName) {
        let describeStreamParams = {
            StreamName: streamName
        }
        let describeStream = await this.describeStream(streamName);
        let shards = describeStream.StreamDescription.Shards;
        let getShardIteratorParams = shards.map((shard) => {
            return {
                ShardId: shard.ShardId,
                ShardIteratorType: 'LATEST',
                StreamName: describeStreamParams.StreamName,
            }
        })
        let promises = getShardIteratorParams.map((params) => {
            return new Promise((resolve, reject) => {
                this.KinesisInstance.getShardIterator(params, (err, data) => {
                    if(err) {return reject(err)}
                    else {return resolve(data)}
                })
            });
        })
        return Promise.all(promises);
    }

    describeStream(stream) {
        let describeStreamInput= {
            StreamName: stream
        }
        return new Promise((resolve, reject) => {
            this.KinesisInstance.describeStream(describeStreamInput, (err, data) => {
                if(err)
                    return reject(err)
                return resolve(data)
            });
        });
    }

    putRecordOnKinesisStream(record) {
        return new Promise((resolve, reject) => {
            this.KinesisInstance.putRecord(record, (err, data) => {
                if(err) {return reject(err)}
                else {return resolve(data)}
            })
        });
    }

    async waitForRecordOnKinesisStream(ShardIteratorResponse, partitionKey, maxRetry = 30, timeout = 500) {
        let kinesisData = await this.getMessageFromMultipleShards(ShardIteratorResponse);
        let returnedPartitionKeys = this.pushAllPartitionKeysToArray(kinesisData);
        if(returnedPartitionKeys.indexOf(partitionKey) === -1 && maxRetry > 0) {
            console.log('Unable find record on Kinesis stream. Retries remaining: ' + maxRetry + '. Retry Interval: ' + timeout + 'ms.');
            await new Promise(resolve => setTimeout(resolve, timeout));
            maxRetry--;
            return this.waitForRecordOnKinesisStream(ShardIteratorResponse, partitionKey, maxRetry, timeout)
        }
        if(returnedPartitionKeys.indexOf(partitionKey) === -1) throw 'Record not found on Kinesis. Expected record: ' + partitionKey;
        return kinesisData
    }

    async getMessageFromMultipleShards(ShardIteratorResponses) {
        let records = await Promise.all(ShardIteratorResponses.map(response => this.getMessageFromKinesisStream(response)))
        return records.reduce(function(left, right) { return left.concat(right) });
    }

    getMessageFromKinesisStream(ShardIteratorResponse) {
        let recordParams = {ShardIterator: ShardIteratorResponse.ShardIterator}
        return new Promise((resolve, reject) => {
            this.KinesisInstance.getRecords(recordParams, (err, data) => {
                if(err) {return reject(err)}
                else {return resolve(data.Records)}
            })
        });
    }

    pushAllPartitionKeysToArray(kinesisRecords) {
        return kinesisRecords.map((record) => {
            return record.PartitionKey
        })
    }
}

exports.AwsConnectionHelper = AwsConnectionHelper;