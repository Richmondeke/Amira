import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "REMOVED_USE_ENV_VAR",
    authDomain: "amira-crm-final-3829.firebaseapp.com",
    projectId: "amira-crm-final-3829",
    storageBucket: "amira-crm-final-3829.firebasestorage.app",
    messagingSenderId: "159992140995",
    appId: "1:159992140995:web:8c64f1beb6c9ee926d7e76"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_LEADS = [
    {
        id: "1",
        name: "John Doe",
        email: "john@techflow.io",
        company: "TechFlow Inc.",
        score: 85,
        status: "Qualified",
        lastActivity: "2 hours ago",
        industry: "SaaS",
        phone: "+1 (555) 012-3456",
        website: "techflow.io",
        notes: "Budget approved for Q3. Interested in scalability features."
    },
    {
        id: "2",
        name: "Sarah Chen",
        email: "s.chen@cloudscale.com",
        company: "CloudScale",
        score: 92,
        status: "Interested",
        lastActivity: "5 hours ago",
        industry: "Cloud Infrastructure",
        phone: "+1 (555) 987-6543",
        website: "cloudscale.com",
        notes: "Competitive displacement. Loves our holographic UI."
    },
    {
        id: "3",
        name: "Marcus Miller",
        email: "marcus@nexgen.ai",
        company: "NexGen AI",
        score: 78,
        status: "Lead",
        lastActivity: "1 day ago",
        industry: "Artificial Intelligence",
        phone: "+1 (555) 234-5678",
        website: "nexgen.ai",
        notes: "Early stage startup. High growth potential."
    },
    {
        id: "4",
        name: "Elena Rodriguez",
        email: "erodriguez@fintech-ultra.com",
        company: "FinTech Ultra",
        score: 65,
        status: "Contacted",
        lastActivity: "3 days ago",
        industry: "Fintech",
        phone: "+1 (555) 876-5432",
        website: "fintech-ultra.com",
        notes: "Security concerns mentioned. Send ISO documentation."
    }
];

async function seed() {
    console.log("Seeding leads to Firestore...");
    for (const lead of INITIAL_LEADS) {
        await setDoc(doc(db, "leads", lead.id), lead);
        console.log(`Added lead: ${lead.name}`);
    }
    console.log("Seeding complete!");
    process.exit(0);
}

seed().catch(err => {
    console.error("Error seeding leads:", err);
    process.exit(1);
});
