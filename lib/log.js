const winston = require("winston")


function logger(label, log_level) {
    const LABEL = label || "main"
    const LOG_LEVEL = log_level || process.env.LOG_LEVEL || "info"
    
    const log = winston.createLogger({  
        transports: [new winston.transports.Console()],
        format: winston.format.combine(
          winston.format.label({ label: LABEL }),
          winston.format.colorize(),
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
          winston.format.printf(info => `${info.timestamp} ${info.label} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
        ),    
        level: LOG_LEVEL
    });

    return log
}

module.exports = logger;