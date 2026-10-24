/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017/gdg_nmit";

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB at", uri);
    const db = client.db("gdg_nmit");

    // Clear existing teams and members collections
    await db.collection("teams").deleteMany({});
    await db.collection("members").deleteMany({});
    console.log("Cleared existing teams and members collections.");

    const teamId = new ObjectId();
    const teamDoc = {
      _id: teamId,
      year: "2024",
      name: "GDG on Campus NMIT (2024 - 2025)",
      createdAt: new Date(),
    };

    const members = [
      // ---------------------------------------------
      // 1. Heads & Advisors (club)
      // ---------------------------------------------
      {
        teamId,
        name: "Mohan Kumar TG",
        role: "GDG Faculty Advisor",
        domain: "club",
        tier: "faculty coordinator",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Venkatnarayanan B",
        role: "GDG Lead",
        domain: "club",
        tier: "lead",
        photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Surendra Tripathi",
        role: "GDG Co-Lead",
        domain: "club",
        tier: "co-lead",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Tanmay Kadambala",
        role: "GDG Student Advisor",
        domain: "club",
        tier: "student-advisor",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Dr. Sanjay H A",
        role: "Head of Dept & Mentor",
        domain: "club",
        tier: "mentor",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Diya Rao",
        role: "Alumni Mentor",
        domain: "club",
        tier: "mentor",
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // ---------------------------------------------
      // 2. Technical Team (tech) - 7 Rows (28 Members)
      // ---------------------------------------------
      // Row 1
      {
        teamId,
        name: "Rohan Kulkarni",
        role: "Tech Lead - Web",
        domain: "tech",
        tier: "lead",
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Ananya Hegde",
        role: "Tech Lead - AI / Cloud",
        domain: "tech",
        tier: "co-lead",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Siddharth Menon",
        role: "Fullstack Core Dev",
        domain: "tech",
        tier: "core",
        photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Pooja Nair",
        role: "Android Lead",
        domain: "tech",
        tier: "core",
        photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // Row 2
      {
        teamId,
        name: "Karthik Varman",
        role: "DevOps & Cloud Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Shreya Sharma",
        role: "Flutter Developer",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Vikram Sundaram",
        role: "Cybersecurity Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Neha Murthy",
        role: "Backend & DB Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // Row 3
      {
        teamId,
        name: "Aditya Kulkarni",
        role: "Frontend Architect",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Ritu Sengupta",
        role: "ML / Deep Learning",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Manish Prabhu",
        role: "Systems & C++ Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Sneha Reddy",
        role: "iOS & Swift Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // Row 4
      {
        teamId,
        name: "Gautam Rao",
        role: "Distributed Systems",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Kavya Bhat",
        role: "API & Microservices",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Rahul Nair",
        role: "Web3 & Blockchain",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Divya S",
        role: "QA & Testing Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // Row 5
      {
        teamId,
        name: "Arjun Varma",
        role: "Data Engineering Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Meghana Pai",
        role: "Computer Vision Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Harish Gowda",
        role: "IoT & Hardware Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Swati Joshi",
        role: "Site Reliability Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // Row 6
      {
        teamId,
        name: "Pranav Shetty",
        role: "Cloud Native Dev",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Tanvi Deshmukh",
        role: "NLP & LLM Engineer",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Ashwin Kumar",
        role: "Game Dev & Graphics",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Lavanya R",
        role: "AR / VR Developer",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // Row 7
      {
        teamId,
        name: "Samarth Rao",
        role: "Open Source Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Pallavi Shenoy",
        role: "Database Architect",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Nikhil Bhat",
        role: "Rust & Micro Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Varsha K",
        role: "Linux & Tooling Core",
        domain: "tech",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // ---------------------------------------------
      // 3. Design Team (design)
      // ---------------------------------------------
      {
        teamId,
        name: "Varun Shenoy",
        role: "Design Lead",
        domain: "design",
        tier: "lead",
        photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Meera Patel",
        role: "UI/UX & Branding Lead",
        domain: "design",
        tier: "co-lead",
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Tanmay Deshmukh",
        role: "Graphic Designer",
        domain: "design",
        tier: "core",
        photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Kriti Sengupta",
        role: "Motion Graphics Core",
        domain: "design",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Rahul Verma",
        role: "Visual & 3D Artist",
        domain: "design",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // ---------------------------------------------
      // 4. PR & Marketing (pr & marketing)
      // ---------------------------------------------
      {
        teamId,
        name: "Isha Jain",
        role: "PR & Outreach Lead",
        domain: "pr & marketing",
        tier: "lead",
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Aditya Bhat",
        role: "Sponsorship Lead",
        domain: "pr & marketing",
        tier: "co-lead",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Chirag Gowda",
        role: "Media & PR Core",
        domain: "pr & marketing",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Anjali Raman",
        role: "Campus Relations Core",
        domain: "pr & marketing",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // ---------------------------------------------
      // 5. Social Media (social media)
      // ---------------------------------------------
      {
        teamId,
        name: "Rhea Sen",
        role: "Social Media Lead",
        domain: "social media",
        tier: "lead",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Abhinav Kashyap",
        role: "Reels & Video Lead",
        domain: "social media",
        tier: "co-lead",
        photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Shalini Prabhu",
        role: "Social Media Strategist",
        domain: "social media",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Rohit Nambiar",
        role: "Digital Campaigns Core",
        domain: "social media",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // ---------------------------------------------
      // 6. Content & Documentation (content and documentation)
      // ---------------------------------------------
      {
        teamId,
        name: "Nikhil Joshi",
        role: "Content & Editorial Lead",
        domain: "content and documentation",
        tier: "lead",
        photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Bhavana S",
        role: "Technical Writer Lead",
        domain: "content and documentation",
        tier: "co-lead",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Tarun Kumar",
        role: "Documentation Core",
        domain: "content and documentation",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Aditi Rao",
        role: "Newsletter & Blog Core",
        domain: "content and documentation",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },

      // ---------------------------------------------
      // 7. Operations (operations)
      // ---------------------------------------------
      {
        teamId,
        name: "Praveen Gowda",
        role: "Operations & Logistics Lead",
        domain: "operations",
        tier: "lead",
        photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Sanya Roy",
        role: "Event Operations Lead",
        domain: "operations",
        tier: "co-lead",
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Rakesh Mohan",
        role: "Venue & Hospitality Core",
        domain: "operations",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Priyanka Kulkarni",
        role: "Registration & Helpdesk",
        domain: "operations",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
      {
        teamId,
        name: "Tejas Gowda",
        role: "Stage & Sound Lead",
        domain: "operations",
        tier: "member",
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
        linkedinUrl: "https://linkedin.com",
        githubUrl: "https://github.com",
      },
    ];

    // Insert team
    await db.collection("teams").insertOne(teamDoc);

    // Insert all members
    const memberResults = await db.collection("members").insertMany(members);

    // Update team document with member IDs
    await db.collection("teams").updateOne(
      { _id: teamId },
      { $set: { members: Object.values(memberResults.insertedIds) } }
    );

    console.log(`Successfully seeded team: "${teamDoc.name}" with ${members.length} members across 7 domains!`);
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await client.close();
  }
}

seed();
