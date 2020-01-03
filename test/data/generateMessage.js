const messagePackHelper = require('../lib/messagePackHelper').MessagePackHelper;

class AwsMessageBuilder {
    stream;
    data;
    partitionKey;

    constructor() {
        this.stream = process.env.STREAM_TO_READ;
        this.data = 'Test data';
        this.partitionKey = 'Test partition key';
    }

    withStream(stream) {
        this.stream = stream;
        return this;
    }

    withData(data) {
        this.data = data;
        return this;
    }

    withPartitionKey(partitionKey) {
        this.partitionKey = partitionKey;
        return this;
    }

    build() {
        return {
                StreamName: this.stream,
                Data: messagePackHelper.encodeMessagePackData(this.data),
                PartitionKey: this.partitionKey,
        };
    }
}

module.exports.AwsMessageBuilder = AwsMessageBuilder;