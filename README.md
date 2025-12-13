# Arxiv MCP Server

An MCP server implementation that integrates arxiv's public api to provide search, and research capabilities.

## Features

- Paper Search: Scientific paper queries with pagination
- Author Search: Research author(s) queries with pagination
- Literature Review: Search and review top papers in a chosen category

## Tools

- getArxivPapersByAuthor
  - Execute author paper search with pagination
  - Inputs
    - author (string): author name
    - maxResult (number): maximum number of results to return

- getArxivPapersByTitle
  - Execute paper title search with pagination
  - Inputs
    - title (string): paper title
    - maxResult (number): maximum number of results to return

- getArxivPapersByCategory 
  - Execute paper search by category with pagination
  - Inputs
    - category (string): top papers in category
    - maxResult (number): maximum number of results to return

- getArxivPapersByKeyword
  - Execute paper search by keyword(s) with pagination
  - Inputs
    - keyword(s) (string): keyword to search for
    - maxResult (number): maximum number of results to return

## Configuration

### Usage with Claude Desktop

Add this to claude_desktop_config.json:

### Docker

```
{
  "mcpServers": {
    "arxiv-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-p",
        "--rm",
        "natercole/arxiv-mcp-server:latest"
      ]
    }
  }
}

```

### NPX

```
{
  "mcpServers": {
    "arxiv-mcp-server": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://arxiv-mcp-server-suhj.onrender.com"
      ]
    }
  }
}
```

### Usage with VS Code

Add the following JSON block to a file callld .vscode/mcp.json in your workspace.

### Docker

```
{
  "servers": {
    "arxiv-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "-p",
        "--rm",
        "natercole/arxiv-mcp-server"
      ]
    }
  }
}

```

### NPX

```
{
  "servers": {
    "arxiv-mcp-server": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://arxiv-mcp-server-suhj.onrender.com"
      ]
    }
  }
}
```

## Build

### Docker Build:

```

docker build -t natercole/arxiv-mcp-server:latest -f src/arxiv-mcp-server/Dockerfile .

```

## License

This MCP server is licensed under the MIT license. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LiCENSE file in the project repository.