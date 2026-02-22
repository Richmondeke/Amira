import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber || accountSid.includes("your_twilio_")) {
            return NextResponse.json(
                { error: "Twilio credentials or Outbound Phone Number are missing in .env.local." },
                { status: 403 }
            );
        }

        // Initialize Twilio client
        const client = twilio(accountSid, authToken);

        // Note: For local development (localhost), Twilio cannot fetch dynamic TwiML Webhooks or MP3s from our machine.
        // Therefore, we use inline TwiML with a high-quality Twilio Neural voice to prove the pipeline works.
        // In production with a public URL, this is where we'd bridge the WebSocket to ElevenLabs for conversational AI.
        const call = await client.calls.create({
            twiml: '<Response><Say voice="Polly.Matthew-Neural">Hello! Your Amira Voice Agent is successfully connected to Twilio. The telephony pipeline is active, and your credentials are valid. Eleven Labs synthesis will hook in during production deployment.</Say></Response>',
            to: phoneNumber,
            from: fromNumber
        });

        console.log(`Test call dispatched successfully. Call SID: ${call.sid}`);

        return NextResponse.json({ success: true, callSid: call.sid });
    } catch (error: any) {
        console.error("Test Call API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to initiate call via Twilio API." }, { status: 500 });
    }
}
