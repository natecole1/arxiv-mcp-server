
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getServer } from "./index.js";

import { randomUUID } from "node:crypto";

import { mcpAuthMetadataRouter, getOAuthProtectedResourceMetadataUrl } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { checkResourceAllowed } from "@modelcontextprotocol/sdk/shared/auth-utils.js";

import express from "express";



const arxivMCPServer = getServer();

const app = express();
const transports: { [sessionId: string ]: StreamableHTTPServerTransport} = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id, Authorization');
  res.header('Access-Control-Expose-Headers', 'Mcp-Session-Id, WWW-Authenticate');

  if(req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});



app.post("/mcp", async (req: express.Request, res: express.Response) => {
  console.log("Received MCP POST request");

  try {
    const isInitRequest = req.body && req.body.method === "initialize";

    let transport: StreamableHTTPServerTransport;
    let sessionId: string;

    if (isInitRequest) {
      transport = new StreamableHTTPServerTransport({
        enableJsonResponse: true,

      });
      sessionId = randomUUID();

      transports[sessionId] = transport;

      req.headers["mcp-session-id"] = sessionId
      res.setHeader("Mcp-Session-Id", sessionId);

      await arxivMCPServer.connect(transport);

      await transport.handleRequest(req, res, req.body);

    } else {
      sessionId = req.headers["mcp-session-id"] as string;

      transport = transports[sessionId];

      if (!transport) {
        return res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: {
              code: -32000,
              message: "Bad Request: No valid session ID provided",
            },
          },
        });
      };

      console.log("Handling initialization request...");
      await transport.handleRequest(req, res, req.body);
      console.log("Initializatiion request completed");


    } 
    
  } catch (error) {
    console.log("Error handling MCP request: ", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: req?.body?.id,
      });
    }
  }
});


app.delete("/mcp", async (req: express.Request, res: express.Response) => {
  console.log("Received MCP DELETE request");

  try {
    const sessionId = req.headers["mcp-session-id"] as string ;

    if (transports[sessionId]) {
       delete transports[sessionId]; 
      
       res.status(204).end();
    }
    

  
  } catch (error) {
    console.error("Error handling DELETE request: ", error);

    res.status(404).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Error handling session termination",
        },
        id: req?.body?.id,
      });
      return;
    }
  
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`MCP Server is running on http://localhost:${PORT}/mcp`);
});


