import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { ArxivSearchResponse, formatPapers, makeArxivRequest } from "./utils.js";
import { randomUUID } from "node:crypto";

import express from "express";

const BASE_URL = "http://export.arxiv.org/api";

const getServer = () => {
  const server = new McpServer({
    name: "Arxiv MCP Server",
    version: "1.0.0",
    capabilities: {
      tools: {},
    },
  });

  server.tool(
    "getArxivPapersByAuthor",
    "Fetches a list of Arxiv papers by a given author.",
    {
      authorName: z.string().describe("The name of the papers author"),
      maxResults: z.number().describe("The maximum number of results to return")
    },
    async ({ authorName, maxResults }) => {

      const papersUrl = `${BASE_URL}/query?search_query=au:${authorName}&max_results=${maxResults}`
      const paperData = await makeArxivRequest<ArxivSearchResponse>(papersUrl);

      if(!paperData) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve Arxiv papers"
            },
          ],
        };
      }

      const paperDetails = paperData.feed.entry || [];

      if (paperDetails.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No papers by ${authorName}`
            },
          ],
        };
      }

     const formattedPapers = formatPapers(paperData);
     const paperText = `Papers by ${authorName}: \n\n ${formattedPapers.join("\n")}`; 
     return {
      content: [
        {
          type: "text",
          text: paperText,
        }
      ],
     };
    },
  );

  server.tool(
    "getArxivPapersByTitle",
    "Fetches a list of Arxiv papers by a given title.",
    {
      title: z.string().describe("The title of the papers to search"),
      maxResults: z.number().describe("The maximum number of results to return"),
    },
    async ({ title, maxResults = 100 }) => {
      const papersUrl = `${BASE_URL}/query?search_query=ti:${title}&max_results=${maxResults}`;
      const paperData = await makeArxivRequest<ArxivSearchResponse>(papersUrl);

      if (!paperData) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve Arxiv papers",
            },
          ],
        };
      }

      const paperDetails = paperData.feed.entry || [];

      if (paperDetails.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No papers with the title: ${title}`,
            },
          ],
        };
      }

      const formattedPapers = formatPapers(paperData);
      const paperText = `Papers with title ${title}: \n\n ${formattedPapers.join(
        "\n"
      )}`;
      return {
        content: [
          {
            type: "text",
            text: paperText,
          },
        ],
      };
    }
  );

  server.tool(
    "getArxivPapersByCategory",
    "Fetches a list of Arxiv papers by a given category.",
    {
      category: z.string().describe("The category of the papers to search for"),
      maxResults: z.number().describe("The maximum number of results to return"),
    },
    async ({ category, maxResults = 100 }) => {
      const papersUrl = `${BASE_URL}/query?search_query=cat:${category}&max_results=${maxResults}`;
      const paperData = await makeArxivRequest<ArxivSearchResponse>(papersUrl);

      if (!paperData) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve Arxiv papers",
            },
          ],
        };
      }

      const paperDetails = paperData.feed.entry || [];

      if (paperDetails.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No papers by ${category}`,
            },
          ],
        };
      }

      const formattedPapers = formatPapers(paperData);
      const paperText = `Papers by ${category}: \n\n ${formattedPapers.join(
        "\n"
      )}`;
      return {
        content: [
          {
            type: "text",
            text: paperText,
          },
        ],
      };
    }
  );

  server.tool(
    "getArxivPapersBykeywords",
    "Fetches a list of Arxiv papers by a given keywords.",
    {
      keywords: z.string().describe("The name of the papers author"),
      maxResults: z.number().describe("The maximum number of results to return"),
    },
    async ({ keywords, maxResults = 100 }) => {
      const papersUrl = `${BASE_URL}/query?search_query=all:${keywords}&max_results=${maxResults}`;
      const paperData = await makeArxivRequest<ArxivSearchResponse>(papersUrl);

      if (!paperData) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve Arxiv papers",
            },
          ],
        };
      }

      const paperDetails = paperData.feed.entry || [];

      if (paperDetails.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No papers include the keywords ${keywords}`,
            },
          ],
        };
      }

      const formattedPapers = formatPapers(paperData);
      const paperText = `Papers by ${keywords}: \n\n ${formattedPapers.join(
        "\n"
      )}`;
      return {
        content: [
          {
            type: "text",
            text: paperText,
          },
        ],
      };
    }
  );

  return server;
};

const app = express();
app.use(express.json());

app.all("/mcp", async (req: express.Request, res: express.Response) => {
  try {
    const server = getServer();

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
    });

    res.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });

    await server.connect(transport);

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling mcp request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


