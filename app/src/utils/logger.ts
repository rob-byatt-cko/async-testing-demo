export class Logger {
    static info(messageToLog: string): void {
        console.log('--------------------------');
        console.log(messageToLog);
        console.log('--------------------------');
    }
}