const { createLogger, format, transports } = require('winston');

function logger(runId, logProfile) {
    let transportParams = {};
    let levelParams = { 
        error: 0, 
        info: 1,
        verbose: 2, 
        debug: 3,
        test: 4,
        silly: 5
    };
    if (logProfile === "production") {
        transportParams = {
            console: new transports.Console({ 
                level: 'verbose',
                format: format.combine(
                    format.simple(),
                    format.printf(info =>  `${runId} - [${info.level.toUpperCase()}]: ${info.message}`)
                )
            })
        };
    } else if (logProfile === "homolog") {
        transportParams = {
            console: new transports.Console({ 
                level: 'debug',
                format: format.combine(
                    format.simple(),
                    format.printf(info =>  `${runId} - [${info.level.toUpperCase()}]: ${info.message}`)
                )
            })
        };
    } else if (logProfile === "performance") {
        levelParams = { 
            error: 0, 
            test: 1, 
            info: 2,
            verbose: 3, 
            debug: 4,
            silly: 5
        };
        transportParams = {
            file: new transports.File({ 
                maxsize: 5120000,
                maxFiles: 5,
                filename: `${__dirname}/../logs/log-validator-performance.log`,
                level: 'test',
                format: format.combine(
                    format.simple(), 
                    format.timestamp(),
                    format.printf(info => `[${info.timestamp}] - ${runId} - [${info.level.toUpperCase()}]: ${info.message}`)
                )
            }),   
            console: new transports.Console({
                level: 'test',
                format: format.combine(
                    format.simple(), 
                    format.printf(info =>  `${runId}: ${info.message}`)
                )
            })
        };
    } else {
        transportParams = {
            file: new transports.File({ 
                maxsize: 5120000,
                maxFiles: 5,
                filename: `${__dirname}/../logs/3sillyRun.log`,
                level: 'silly',
                format: format.combine(
                    format.simple(), 
                    format.timestamp(),
                    format.printf(info => `${runId} - [${info.level.toUpperCase()}]: ${info.message}`)
                )
            }), 
            file: new transports.File({ 
                maxsize: 5120000,
                maxFiles: 5,
                filename: `${__dirname}/../logs/2debugRun.log`,
                level: 'debug',
                format: format.combine(
                    format.simple(), 
                    format.timestamp(),
                    format.printf(info => `${runId} - [${info.level.toUpperCase()}]: ${info.message}`)
                )
            }), 
            file: new transports.File({ 
                maxsize: 5120000,
                maxFiles: 5,
                filename: `${__dirname}/../logs/1verboseRun.log`,
                level: 'info',
                format: format.combine(
                    format.simple(), 
                    format.timestamp(),
                    format.printf(info => `${info.message}`)
                )
            }), 
            console: new transports.Console({
                level: 'info',
                format: format.combine(
                    format.simple(), 
                    format.printf(info =>  `${info.message}`)
                )
            })
        };  
    }
    var logger;
    if(transportParams.file == undefined) {
        logger = createLogger({
            levels: levelParams,
            transports: [
                transportParams.console
            ]
        });
    } else {
        logger = createLogger({
            levels: levelParams,
            transports: [
                transportParams.console,
                transportParams.file
            ]
        });
    }
    return logger;
};

class Logger {
    constructor(runId, logProfile) {
        this.runId = runId;
        this.logProfile = logProfile;
        this.logger = logger(runId, logProfile);
    }
}

module.exports = Logger;