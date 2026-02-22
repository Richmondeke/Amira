import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, industry, location, jobTitles } = body;

        const APIFY_TOKEN = process.env.APIFY_TOKEN;

        if (!APIFY_TOKEN || APIFY_TOKEN === "YOUR_APIFY_TOKEN") {
            return NextResponse.json(
                { error: 'APIFY_TOKEN is missing or invalid in environment variables.' },
                { status: 500 }
            );
        }

        // Base actor input combining required constraints
        let actorInput: any = {
            fetch_count: 50, // Increase count to ensure results
            email_status: ["validated"]
        };

        const q = query?.toLowerCase() || "";

        if (q.includes("recently funded")) {
            actorInput.min_funding = "1M";
            actorInput.contact_job_title = ["Founder", "CEO", "CTO"];
        } else if (q.includes("aws and react") || q.includes("tech-stack")) {
            actorInput.company_keywords = ["AWS", "React"];
            actorInput.contact_job_title = ["CTO", "Head of Engineering", "VP Engineering"];
        } else if (q.includes("high intent") || q.includes("enterprise")) {
            actorInput.min_revenue = "50M";
            actorInput.contact_job_title = ["VP Sales", "Chief Revenue Officer", "CMO"];
        } else if (q.includes("saas founders in ca")) {
            // Apply exact user-requested structure for this mapping
            actorInput = {
                ...actorInput,
                company_industry: ["marketing & advertising"],
                company_keywords: ["Automation", "N8N"],
                contact_job_title: ["Founder"],
                contact_location: ["california, us"],
                max_revenue: "10B",
                min_revenue: "1M",
                size: ["1-10"]
            };
        } else if (q) {
            // Generic search fallback mapping
            actorInput.company_keywords = [query];
        } else {
            if (industry) actorInput.company_industry = [industry];
            if (location) actorInput.contact_location = [location];
            if (jobTitles) actorInput.contact_job_title = jobTitles;
        }

        console.log("Triggering Apify with input:", JSON.stringify(actorInput, null, 2));

        // Run the actor synchronously and get dataset items
        // Note: For large fetch counts, this might timeout.
        const response = await fetch(`https://api.apify.com/v2/acts/code_crafter~leads-finder/run-sync-get-dataset-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${APIFY_TOKEN}`
            },
            body: JSON.stringify(actorInput)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Apify API Error:", errorText);
            return NextResponse.json(
                { error: `Failed to fetch leads from Apify: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Check for Apify soft errors (e.g. Free Tier API restrictions)
        if (Array.isArray(data) && data.length === 1 && data[0].error) {
            console.error("Apify Actor Logic Error:", data[0].error);
            return NextResponse.json(
                { error: data[0].error },
                { status: 403 }
            );
        }

        // Map Apify results to the LeadTable format
        const mappedLeads = (data || []).map((lead: any, index: number) => {
            const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown Contact';
            // Generate initials
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';

            // Randomly assign colors for visual variety (since Apify doesn't provide this)
            const colors = [
                "text-blue-500 bg-blue-500/20 ring-blue-500/10",
                "text-purple-500 bg-purple-500/20 ring-purple-500/10",
                "text-rose-500 bg-rose-500/20 ring-rose-500/10",
                "text-orange-500 bg-orange-500/20 ring-orange-500/10",
                "text-emerald-500 bg-emerald-500/20 ring-emerald-500/10"
            ];
            const color = colors[index % colors.length];

            return {
                id: lead.id || `apify-lead-${index}`,
                name: name,
                email: lead.email || lead.email_1 || 'No email provided',
                initials: initials,
                color: color,
                company: lead.company_name || 'Unknown Company',
                // Defaulting to Building icon text map since we can't pass components directly via JSON
                iconName: 'BuildingOffice2Icon',
                title: lead.job_title || lead.contact_job_title || 'Unknown Title',
                funding: lead.funding || lead.funding_amount || 'Undisclosed',
                fundingVariant: 'neutral',
                fundingDate: lead.funding_date || '--',
                location: lead.location || lead.city || lead.state || 'Unknown Location',
            }
        });

        return NextResponse.json({ leads: mappedLeads });

    } catch (error: any) {
        console.error("Error in /api/leads:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
