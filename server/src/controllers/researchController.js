import SSE from 'express-sse';

const sseConnections = new Map();

export const createSSEConnection = (req, res) => {
  const { jobId } = req.params;
  
  const sse = new SSE();
  sseConnections.set(jobId, sse);
  
  sse.init(req, res);
  
  req.on('close', () => {
    sseConnections.delete(jobId);
    console.log(`[SSE] Connection closed for job ${jobId}`);
  });
  
  console.log(`[SSE] Connection established for job ${jobId}`);
};

export const emitResearchEvent = (jobId, eventType, data) => {
  const sse = sseConnections.get(jobId);
  if (sse) {
    sse.send(data, eventType);
    console.log(`[SSE] Event ${eventType} sent to job ${jobId}`);
  }
};

export default { createSSEConnection, emitResearchEvent };
