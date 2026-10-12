/**
 * Server API Plugin for Vite
 * Securely handles /api/* routes on the server without exposing GEMINI_API_KEY to the client.
 */
import { Plugin } from 'vite';
import { executeAiTask } from './geminiService';

export function omniApiPlugin(): Plugin {
  return {
    name: 'omni-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        if (!url.startsWith('/api/')) {
          return next();
        }

        // Helper to send JSON response
        const sendJson = (statusCode: number, data: any) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        // Helper to read request body
        const readBody = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (err) {
                reject(err);
              }
            });
            req.on('error', reject);
          });
        };

        try {
          if (url === '/api/health') {
            return sendJson(200, {
              status: 'ok',
              hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
              timestamp: Date.now(),
            });
          }

          if (url === '/api/gemini/task' && req.method === 'POST') {
            const body = await readBody();
            const result = await executeAiTask(body);
            return sendJson(200, result);
          }

          if (url.startsWith('/api/science/uniprot/')) {
            const accession = url.split('/').pop() || 'P04637';
            try {
              const upstream = await fetch(
                `https://rest.uniprot.org/uniprotkb/${encodeURIComponent(accession)}.json`
              );
              if (!upstream.ok) {
                return sendJson(upstream.status, { error: 'UniProt upstream error' });
              }
              const data = await upstream.json();
              return sendJson(200, data);
            } catch (err: any) {
              return sendJson(500, { error: err.message });
            }
          }

          sendJson(404, { error: 'Not Found' });
        } catch (err: any) {
          console.error('[API Middleware Error]:', err);
          sendJson(500, { error: err.message || 'Internal Server Error' });
        }
      });
    },
  };
}
