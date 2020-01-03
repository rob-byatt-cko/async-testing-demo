const MessagePack = require("msgpack5");

class MessagePackHelper {
    static decodeMessagePackData(encodedData) {
        return MessagePack().decode(encodedData);
    }
    static encodeMessagePackData(data) {
        return MessagePack().encode(data);
    }
}

exports.MessagePackHelper = MessagePackHelper;
