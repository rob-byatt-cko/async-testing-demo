export class Logger {
    static info(messageToLog: string): void {
        console.log('--------------------------');
        console.log(messageToLog);
        console.log('--------------------------');
    }
    static debug(debugMessage: string): void {
        console.log(`DEBUG LOG: ${debugMessage}`);
    }
}