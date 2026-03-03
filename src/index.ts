import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from "zod";
import { ArxivSearchResponse, makeArxivRequest, formatPapers } from "./utils.js";



const BASE_URL = "http://export.arxiv.org/api";

export const getServer = () => {
  const server = new McpServer({
    name: "Arxiv MCP Server",
    version: "2.0.0",
  });

  server.registerTool(
    "getArxivPapersByAuthor",
    {
      description: "Fetches a list of Arxiv papers by a given author",
      inputSchema: {
        authorName: z.string().describe("The name of the papers author"),
        maxResults: z
          .number()
          .describe("The maximum number of results to return"),
      },
    },
    async ({ authorName, maxResults }) => {
      const papersUrl = `${BASE_URL}/query?search_query=au:${authorName}&max_results=${maxResults}`;
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
              text: `No papers by ${authorName}`,
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
          },
        ],
      };
    },
  );

  server.registerTool(
    "getArxivPapersByTitle",
    {
      description: "Fetches a list of Arxiv papers by a given title",
      inputSchema: {
        title: z.string().describe("The title of the papers to search"),
        maxResults: z
          .number()
          .describe("The maximum number of results to return"),
      },
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
        "\n",
      )}`;
      return {
        content: [
          {
            type: "text",
            text: paperText,
          },
        ],
      };
    },
  );

  server.registerTool(
    "getArxivPapersByCategory",
    {
      description: "Fetches a list of Arxiv papers by a given category",
      inputSchema: {
        category: z
          .string()
          .describe("The category of the papers to search for"),
        maxResults: z
          .number()
          .describe("The maximum number of results to return"),
      },
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
        "\n",
      )}`;
      return {
        content: [
          {
            type: "text",
            text: paperText,
          },
        ],
      };
    },
  );

  server.registerTool(
    "getArxivPapersBykeywords",
    {
      description: "Fetches a list of Arxiv papers by a given keywords",
      inputSchema: {
        keywords: z.string().describe("The name of the papers author"),
        maxResults: z
          .number()
          .describe("The maximum number of results to return"),
      },
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
        "\n",
      )}`;
      return {
        content: [
          {
            type: "text",
            text: paperText,
          },
        ],
      };
    },
  );

  return server;
};
