import { PrismaClient } from "../lib/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  // Clean up existing data to prevent duplicates
  await prisma.report.deleteMany();
  await prisma.feedbackTheme.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // 1. Create Workspace
  const workspace = await prisma.workspace.upsert({
    where: { name: "Demo Workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
    },
  });
  console.log("Created workspace:", workspace.name);

  // 2. Create 5 Users
  const roles = ["ADMIN", "ANALYST", "ANALYST", "VIEWER", "VIEWER"];
  const users = [];
  const hashedPassword = await bcrypt.hash("password123", 10);
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i + 1}@demo.com` },
      update: {},
      create: {
        name: `User ${i + 1}`,
        email: `user${i + 1}@demo.com`,
        passwordHash: hashedPassword,
        role: roles[i] as any,
        workspaceId: workspace.id,
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users.`);

  // 3. Create 20 Themes
  const themeNames = [
    "Onboarding", "Billing", "Mobile App", "Dashboard", "Export",
    "Performance", "UI/UX", "Integrations", "Support", "Pricing",
    "Notifications", "Security", "SSO", "API", "Search",
    "Analytics", "Settings", "Localization", "Navigation", "Reliability"
  ];
  
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];

  const themes = [];
  for (const name of themeNames) {
    const theme = await prisma.theme.upsert({
      where: {
        workspaceId_name: {
          workspaceId: workspace.id,
          name: name,
        },
      },
      update: {
        color: colors[Math.floor(Math.random() * colors.length)],
      },
      create: {
        name: name,
        description: `Feedback related to ${name.toLowerCase()}`,
        color: colors[Math.floor(Math.random() * colors.length)],
        workspaceId: workspace.id,
      },
    });
    themes.push(theme);
  }
  console.log(`Created ${themes.length} themes.`);

  // 4. Create 200 Feedback items
  const channels = ["WEBSITE", "MOBILE_APP", "EMAIL", "API", "CSV"];
  const sentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
  const statuses = ["NEW", "PROCESSING", "ANALYZED"];
  
  const sampleContents = [
    "Onboarding took forever — I couldn't figure out how to invite my team.",
    "The new dashboard is gorgeous and finally fast. Huge improvement.",
    "It does the job, but the mobile experience needs work.",
    "Prospect wants SSO before they'll sign — third time this month.",
    "Love the new export feature, saved me an hour today.",
    "Billing page keeps timing out when I try to download an invoice.",
    "Can you add more integrations with Slack?",
    "The UI is a bit confusing on the settings page.",
    "API documentation is outdated, please update it.",
    "Great customer support, very responsive!"
  ];

  const realCustomerNames = [
    "Rohan Sharma", "Priya Patel", "Aarav Mehta", "Ananya Gupta", "Rajesh Kumar",
    "Srabani Kar", "Vikram Singh", "Kavya Verma", "Aditya Roy", "Neha Kapoor",
    "Siddharth Malhotra", "Tanvi Deshmukh", "Arjun Nair", "Deepika Iyer", "Karan Joshi",
    "Meera Sen", "Amitabh Reddy", "Pooja Agarwal", "Rahul Mukherjee", "Sneha Rao",
    "Ishaan Choudhury", "Diya Banerjee", "Devendra Mishra", "Ritu Bhattacharya", "Manish Saxena",
    "Shreya Ghoshal", "Varun Kulkarni", "Aditi Das", "Pranav Hegde", "Kriti Sanon",
    "Harsh Vardhan", "Rhea Pillai", "Gaurav Tripathi", "Swati Pillai", "Aakash Dutta",
    "Nisha Rastogi", "Vivek Menon", "Bhavya Trivedi", "Sandeep Chaudhari", "Anushka Shetty",
    "Rishi Kapoor", "Nandini Ranganathan", "Alok Pandey", "Sunita Krishnan", "Sameer Bansal",
    "Preeti Singhania", "Tushar Deshpande", "Payal Shah", "Manoj Nambiar", "Divya Gautam"
  ];

  const feedbacks = [];
  for (let i = 0; i < 200; i++) {
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const contentTemplate = sampleContents[Math.floor(Math.random() * sampleContents.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Distribute createdAt randomly over the last 30 days
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30));
    
    const feedback = await prisma.feedback.create({
      data: {
        content: contentTemplate,
        channel: channel as any,
        sentiment: sentiment as any,
        sentimentScore: sentiment === "POSITIVE" ? 0.8 : (sentiment === "NEGATIVE" ? -0.8 : 0),
        status: status as any,
        customerLabel: realCustomerNames[Math.floor(Math.random() * realCustomerNames.length)],
        externalReference: `REF-${Math.floor(Math.random() * 10000)}`,
        workspaceId: workspace.id,
        createdAt: pastDate,
      },
    });
    feedbacks.push(feedback);

    // Randomly assign 1-2 unique themes
    const numThemes = Math.floor(Math.random() * 2) + 1;
    const shuffledThemes = [...themes].sort(() => 0.5 - Math.random());
    const selectedThemes = shuffledThemes.slice(0, numThemes);

    for (const theme of selectedThemes) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId: theme.id,
          confidence: Math.random() * 0.5 + 0.5,
        }
      });
    }
  }
  console.log(`Created ${feedbacks.length} feedback items with themes.`);

  // 5. Create 5 Reports
  for (let i = 0; i < 5; i++) {
    const reportDate = new Date();
    reportDate.setDate(reportDate.getDate() - (i * 7)); // Weekly reports
    
    const periodStart = new Date(reportDate);
    periodStart.setDate(periodStart.getDate() - 7);

    await prisma.report.create({
      data: {
        title: `Weekly Voice of Customer - Week ${5 - i}`,
        periodStart: periodStart,
        periodEnd: reportDate,
        contentJson: { summary: "Generated weekly summary based on feedback trends." },
        generatedById: users[1].id, // Assign to the first analyst
        workspaceId: workspace.id,
        createdAt: reportDate,
      },
    });
  }
  console.log(`Created 5 reports.`);

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
