module.exports = class Logger {
    static log(msg) {
        console.log(msg);
    }

    static err(msg) {
        console.error(msg);
    }

    static info(msg) {
        console.log('[INFO] ' + msg);
    }
}