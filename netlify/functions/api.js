const serverless = require('serverless-http');
const app = require('../../backend/server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Let serverless-http handle the event
  return await handler(event, context);
};
