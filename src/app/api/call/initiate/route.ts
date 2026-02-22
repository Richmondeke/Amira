import { NextResponse } from "next/server";
import twilio from "twilio";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { queueId, phoneNumber, name, company } = body;

        if (!phoneNumber) {
            return NextResponse.json({ error: "phoneNumber is required" }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

        if (!accountSid || accountSid === "your_twilio_sid_here") {
            return NextResponse.json({ error: "Twilio credentials not configured." }, { status: 500 });
        }

        const client = twilio(accountSid, authToken);

        // Update Firestore status to "calling" before placing call
        if (queueId) {
            await adminDb.collection("callQueue").doc(queueId).update({
                status: "calling",
                calledAt: new Date().toISOString(),
                phoneNumber,
            });
        }

        // Initiate the outbound call via Twilio → connects to ElevenLabs AI voice agent
        const twimlWebhookUrl = `https://api.elevenlabs.io/v1/convai/twilio/inbound_webrtc?agent_id=${agentId}`;

        const call = await client.calls.create({
            to: phoneNumber,
            from: twilioPhone!,
            url: twimlWebhookUrl,
        });

        // Store Twilio Call SID for status tracking
        if (queueId) {
            await adminDb.collection("callQueue").doc(queueId).update({
                twilioCallSid: call.sid,
            });
        }

        return NextResponse.json({
            success: true,
            callSid: call.sid,
            message: `Call initiated to ${phoneNumber}`,
        });

    } catch (error: any) {
        console.error("Error initiating call:", error);
        return NextResponse.json(
            { error: error.message || "Failed to initiate call" },
            { status: 500 }
        );
    }
}
