import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Instantiate the global MCP Server that will be exposed to ElevenLabs
export const mcpServer = new McpServer({
    name: "amira-backend-tools",
    version: "1.0.0",
});

// Tool: Get Lead Details
// This exposes an enhanced CRM lookup to the ElevenLabs conversational agent
mcpServer.tool(
    "get_lead_details",
    "Lookup detailed CRM information for a specific contact by their email address, including activity history and score.",
    {
        email: z.string().email().describe("The email address of the lead to lookup."),
    },
    async ({ email }) => {
        console.log(`[MCP Server] ElevenLabs Agent requested lead details for: ${email}`);

        // Enhanced Mocked CRM Database query
        let leadData;
        const emailLower = email.toLowerCase();

        if (emailLower.includes("john")) {
            leadData = {
                name: "John Doe",
                company: "TechFlow Inc.",
                status: "Qualified",
                score: 85,
                interest_level: "High",
                industry: "SaaS",
                last_contact: "2 hours ago",
                phone: "+1 (555) 012-3456",
                notes: "Budget approved for Q3. Interested in scalability features.",
                activity_history: [
                    { date: "2 hours ago", type: "Status Update", description: "Lead moved to Qualified by AMIRA." },
                    { date: "Yesterday, 4:30 PM", type: "Discovery Call", description: "Amira performed a full web discovery. Extracted revenue data." },
                    { date: "Feb 18, 2026", type: "Inbound", description: "Contact downloaded whitepaper: 'The Future of AI Systems'." }
                ]
            };
        } else if (emailLower.includes("sarah")) {
            leadData = {
                name: "Sarah Chen",
                company: "CloudScale",
                status: "Interested",
                score: 92,
                interest_level: "Hot",
                industry: "Cloud Infrastructure",
                last_contact: "5 hours ago",
                phone: "+1 (555) 987-6543",
                notes: "Competitive displacement. Loves our holographic UI.",
                activity_history: [
                    { date: "5 hours ago", type: "Email", description: "Sent pricing proposal for enterprise plan." },
                    { date: "Feb 20, 2026", type: "Web Visit", description: "Viewed holographic UI documentation 4 times." }
                ]
            };
        } else {
            leadData = {
                name: "Unknown Contact",
                company: "Unknown",
                status: "Lead",
                score: 0,
                interest_level: "Low",
                notes: "No prior engagement found in the CRM.",
                activity_history: []
            };
        }

        return {
            content: [{
                type: "text",
                text: JSON.stringify(leadData, null, 2)
            }],
        };
    }
);

// Tool: Update Lead Status
mcpServer.tool(
    "update_lead_status",
    "Update the status or score of a lead in the CRM.",
    {
        email: z.string().email().describe("The email address of the lead to update."),
        status: z.string().optional().describe("The new status (e.g., Qualified, Interested, Nurture)."),
        score: z.number().int().min(0).max(100).optional().describe("The new lead score (0-100)."),
        note: z.string().optional().describe("An optional note to add to the activity history."),
    },
    async ({ email, status, score, note }) => {
        console.log(`[MCP Server] ElevenLabs Agent updating lead ${email}: status=${status}, score=${score}`);

        // In a real app, this would perform a database UPDATE
        const updateResult = {
            success: true,
            email,
            updated_fields: {
                ...(status && { status }),
                ...(score !== undefined && { score }),
            },
            message: `Lead ${email} successfully updated.${note ? ` Added note: ${note}` : ""}`
        };

        return {
            content: [{
                type: "text",
                text: JSON.stringify(updateResult, null, 2)
            }],
        };
    }
);
