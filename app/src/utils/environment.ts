
export interface EnvironmentData {
    consumeIntervalMs: number;
    streamToWrite: string;
    streamToRead: string;
    awsRegion: string;
    kinesisEndpoint: string;
}

export class Environment { 

    public static getEnvironment(): EnvironmentData {
        return this.setEnv();
    }

    private static setEnv(): EnvironmentData {
        const env: EnvironmentData = {
            consumeIntervalMs: Number(process.env.CONSUME_INTERVAL_MS),
            streamToWrite: process.env.STREAM_TO_WRITE,
            streamToRead: process.env.STREAM_TO_READ,
            awsRegion: process.env.AWS_REGION,
            kinesisEndpoint: process.env.KINESIS_ENDPOINT
        }
        if(!env.consumeIntervalMs) throw 'consumeIntervalMs env not set';
        if(!env.streamToWrite) throw 'streamToWrite env not set';
        if(!env.streamToRead) throw 'streamToRead env not set';
        if(!env.awsRegion) throw 'awsRegion env not set';
        if(!env.kinesisEndpoint) throw 'kinesisEndpoint env not set';
        return env;
    }
}