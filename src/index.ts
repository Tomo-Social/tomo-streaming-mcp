import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const baseUrl = (process.env.TOMO_STREAM_URL ?? "http://127.0.0.1:8090").replace(/\/$/, "");
const apiKey = process.env.TOMO_STREAM_API_KEY;

async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (apiKey) headers.set("x-api-key", apiKey);
  if (init.body) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await response.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(`Tomo Streaming API ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

function result(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({ name: "tomo-streaming", version: "0.1.0" });

server.registerTool("tomo_health", {
  description: "Check whether the Tomo Streaming control plane is reachable.",
  inputSchema: {},
}, async () => result(await request("/health")));

server.registerTool("tomo_list_stream_servers", {
  description: "List the stream-server experiences available on this control plane.",
  inputSchema: {},
}, async () => result(await request("/api/v1/stream-servers")));

server.registerTool("tomo_list_rooms", {
  description: "List the authenticated client's streaming rooms and their live status.",
  inputSchema: {},
}, async () => result(await request("/api/v1/streams")));

server.registerTool("tomo_create_room", {
  description: "Create a streaming room for an experience such as camera, desktop or a plugin.",
  inputSchema: {
    type: z.string().describe("Registered stream-server type, for example camera-stream-server"),
    name: z.string().optional().describe("Human-readable room name"),
    source: z.string().optional().describe("Source identifier or device configuration"),
  },
}, async ({ type, name, source }) => result(await request("/api/v1/streams", {
  method: "POST",
  body: JSON.stringify({ type, ...(name ? { name } : {}), ...(source ? { source } : {}) }),
})));

server.registerTool("tomo_get_room", {
  description: "Read one room's status, connected peer count and browser connection details.",
  inputSchema: { roomId: z.string() },
}, async ({ roomId }) => result(await request(`/api/v1/streams/${encodeURIComponent(roomId)}`)));

server.registerTool("tomo_control_room", {
  description: "Pause, resume or restart a streaming room.",
  inputSchema: {
    roomId: z.string(),
    action: z.enum(["pause", "resume", "restart"]),
  },
}, async ({ roomId, action }) => result(await request(`/api/v1/streams/${encodeURIComponent(roomId)}/actions`, {
  method: "POST",
  body: JSON.stringify({ action }),
})));

server.registerTool("tomo_delete_room", {
  description: "Stop and remove a streaming room after confirming the room ID.",
  inputSchema: { roomId: z.string() },
}, async ({ roomId }) => result(await request(`/api/v1/streams/${encodeURIComponent(roomId)}`, { method: "DELETE" })));

const transport = new StdioServerTransport();
await server.connect(transport);
