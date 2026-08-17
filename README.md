# Tomo Streaming MCP

Use Tomo Streaming from Codex, Claude Code, Cursor, Windsurf, Antigravity and other MCP-compatible agents.

The server runs locally over **stdio** and calls a Tomo Streaming control plane over HTTP. It exposes room and runtime operations without coupling an agent to the social network.

## Setup

```bash
npm install
npm run build
```

Set the control-plane URL and API key in the MCP client's environment:

```json
{
  "mcpServers": {
    "tomo-streaming": {
      "command": "npx",
      "args": ["-y", "@tomo-social/streaming-mcp"],
      "env": {
        "TOMO_STREAM_URL": "https://stream.example.com",
        "TOMO_STREAM_API_KEY": "replace-with-a-secret"
      }
    }
  }
}
```

If npm is not available in your registry yet, install the pinned GitHub release instead:

```bash
git clone --branch v0.1.0 https://github.com/Tomo-Social/tomo-streaming-mcp.git
cd tomo-streaming-mcp
npm install && npm run build
```

For a local checkout, replace `npx` with `node` and the absolute path to `dist/index.js`.

## Tools

| Tool | Purpose |
| --- | --- |
| `tomo_health` | Check control-plane reachability |
| `tomo_list_stream_servers` | Discover camera, desktop and plugin experiences |
| `tomo_list_rooms` | List rooms and live status |
| `tomo_create_room` | Create a room for an experience |
| `tomo_get_room` | Inspect status and connection details |
| `tomo_control_room` | Pause, resume or restart a room |
| `tomo_delete_room` | Stop and remove a room |

## Security

The API key is read only from the process environment and is never returned as tool output. Run the MCP server with the minimum control-plane permissions and keep the control plane behind TLS. Deleting rooms is exposed as an explicit tool so an agent can request confirmation in its own UI.

## Compatibility

MCP is the integration boundary. The same server configuration works with Codex, Claude Code, Cursor, Windsurf, Antigravity and any client that supports MCP stdio servers. The control plane and streaming SDK remain usable without MCP.

## License

Source-available under the [PolyForm Noncommercial License](LICENSE.md). Commercial agent integrations require a separate license from Tomo.
