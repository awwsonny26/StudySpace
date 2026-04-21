const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs');
const errorLogFile = path.join(logsDir, 'error.log');

const ensureLogsDir = () => {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
};

const logError = (error, context = {}) => {
  ensureLogsDir();

  const payload = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context
  };

  const line = `${JSON.stringify(payload)}\n`;
  fs.appendFileSync(errorLogFile, line);
  console.error('[StudySpace Error]', payload);
};

module.exports = {
  logError
};
