import * as MessagePack from 'msgpack5';

export class MessagePackHelper {

    public static decodeMessagePackData(encodedData):any {
        return MessagePack().decode(encodedData);
    }

    public static encodeMessagePackData(data):any {
        return MessagePack().encode(data);
    }
}