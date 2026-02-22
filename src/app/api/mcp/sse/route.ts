import { NextRequest, NextResponse } from "next/server";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { mcpServer } from "@/lib/mcp";

// We need to keep track of active sessions. In a real app with multiple concurrent agents, 
// you would want to use Redis or a database to manage connection lifecycles robustly.
// For this single-instance local demo, a simple in-memory Map works.
export const activeTransports = new Map<string, SSEServerTransport>();

export async function GET(req: NextRequest) {
    try {
        console.log("[MCP] New SSE Connection Request Incoming...");

        // Ensure this endpoint does not get cached by Next.js
        req.headers.set('Cache-Control', 'no-cache, no-transform');

        // Create a new SSE Transport instance
        // This helper class sets up the native Web API stream expected by clients
        const transport = new SSEServerTransport(
            '/api/mcp/message', // The relative webhook URL the client will POST JSON-RPC payloads to
            NextResponse as any // Pass the environment's Response constructor so the transport can build the outgoing SSE flow
        );

        // Start the transport connection and wire it securely to our configured MCP Server
        await mcpServer.connect(transport);

        // Stash the local transport reference so the message POST route can locate it
        activeTransports.set(transport.sessionId, transport);

        console.log(`[MCP] SSE Connection Established - Session ID: ${transport.sessionId}`);

        // Handle disconnects gracefully to prevent memory leaks
        transport.onclose = () => {
            console.log(`[MCP] Connection Closed - Session ID: ${transport.sessionId}`);
            activeTransports.delete(transport.sessionId);
        };

        return transport.start(); // Returns the active text/event-stream Response
    } catch (error) {
        console.error("[MCP] SSE Route Initialization Error:", error);
        return new NextResponse("Failed to initialize MCP SSE connection.", { status: 500 });
    }
}
