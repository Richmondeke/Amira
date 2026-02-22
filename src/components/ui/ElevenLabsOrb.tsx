"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Register the custom element type for TypeScript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "elevenlabs-convai": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { "agent-id": string }, HTMLElement>;
        }
    }
}

export function ElevenLabsOrb() {
    const [agentId, setAgentId] = useState<string | null>(null);

    useEffect(() => {
        // Fallback to a placeholder if env var isn't set, so the widget at least attempts to load 
        // and users know where to plug in their ID when they deploy.
        const id = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "your_agent_id_here";
        if (id && id !== "your_agent_id_here") {
            setAgentId(id);
        }
    }, []);

    if (!agentId) {
        return (
            <div className="fixed bottom-6 right-6 p-4 bg-slate-900 border border-amber-500/50 rounded-xl shadow-2xl z-50 text-xs text-amber-500 max-w-xs cursor-help" title="Add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to your .env.local file to activate the Conversational AI Orb.">
                ⚠️ ElevenLabs Agent ID missing from .env
            </div>
        );
    }

    return (
        <>
            <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="lazyOnload" />
            <div
                dangerouslySetInnerHTML={{
                    __html: `<elevenlabs-convai agent-id="${agentId}"></elevenlabs-convai>`
                }}
            />
        </>
    );
}
