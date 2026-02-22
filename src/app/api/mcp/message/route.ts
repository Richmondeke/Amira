import { NextRequest, NextResponse } from "next/server";
import { activeTransports } from "../sse/route";

export async function POST(req: NextRequest) {
    try {
        console.log("[MCP] Message Received on webhook.");

        // Grab the sessionId that ElevenLabs sends via query parameter
        const sessionId = req.nextUrl.searchParams.get("sessionId");

        if (!sessionId) {
            console.error("[MCP Error] Missing sessionId in POST request.");
            return new NextResponse("Missing sessionId.", { status: 400 });
        }

        // Find the active connected transport for this session
        const transport = activeTransports.get(sessionId);

        if (!transport) {
            console.error(`[MCP Error] Session ${sessionId} not found or expired.`);
            return new NextResponse("Session not found.", { status: 404 });
        }

        // Pass the incoming JSON-RPC payload directly to the established WebSocket/SSE pipeline
        const requestJSON = await req.json();
        console.log(`[MCP Message Data]:`, JSON.stringify(requestJSON, null, 2));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await transport.handlePostMessage(req as any, new NextResponse() as any, requestJSON);

        return new NextResponse("Accepted", { status: 202 });
    } catch (error) {
        console.error("[MCP] Message Route Error:", error);
        return new NextResponse("Internal Server Error processing MCP message.", { status: 500 });
    }
}
