import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FeedbackChannel, UserRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// Realistic sample feedback data per simulated channel
// ---------------------------------------------------------------------------
const CHANNEL_SAMPLES: Record<string, Array<{ content: string; customerLabel: string }>> = {
  SUPPORT_TICKET: [
    { content: "Onboarding took forever — I couldn't figure out how to invite my team. The documentation is outdated.", customerLabel: "Enterprise User" },
    { content: "Billing page keeps timing out when I try to download an invoice. This has been happening for 3 weeks.", customerLabel: "SMB Customer" },
    { content: "The API rate limits are too restrictive for our use case. We need at least 10x the current limit.", customerLabel: "Developer" },
    { content: "Password reset emails are not arriving. Checked spam, nothing there. Tried 5 times.", customerLabel: "New User" },
    { content: "The bulk export feature crashes for datasets over 5,000 rows. Our team relies on this daily.", customerLabel: "Power User" },
    { content: "Two-factor authentication is broken on mobile Safari. Works fine on desktop Chrome.", customerLabel: "Security-Conscious User" },
    { content: "The dashboard loads very slowly when we have more than 50 team members. Takes 8+ seconds.", customerLabel: "Team Lead" },
    { content: "We need SSO/SAML integration before we can move to the enterprise plan. Third time asking.", customerLabel: "IT Admin" },
    { content: "Data export in CSV format loses special characters. Unicode support seems broken.", customerLabel: "International User" },
    { content: "The mobile app crashes every time I try to attach files. iPhone 15, latest iOS.", customerLabel: "Mobile User" },
    { content: "Can't change the primary contact email on our account without contacting support. Should be self-service.", customerLabel: "Account Manager" },
    { content: "Webhook deliveries are unreliable — we're missing roughly 15% of events in production.", customerLabel: "Backend Engineer" },
  ],
  APP_STORE: [
    { content: "The new dashboard is gorgeous and finally fast. Huge improvement over last year's version. 5 stars!", customerLabel: "App Store Reviewer" },
    { content: "Love the new export feature, saved me an hour today. Keep up the great work!", customerLabel: "App Store Reviewer" },
    { content: "App crashes on startup after the latest update. Rolled back to previous version but that doesn't work either.", customerLabel: "App Store Reviewer" },
    { content: "Beautiful UI, but it eats through my battery. My phone gets hot after 20 minutes of use.", customerLabel: "App Store Reviewer" },
    { content: "Best product analytics tool I've used. The team collaboration features are excellent.", customerLabel: "App Store Reviewer" },
    { content: "Good app overall but desperately needs a dark mode. My eyes are strained after evening sessions.", customerLabel: "App Store Reviewer" },
    { content: "The search functionality is excellent. Finds exactly what I need in seconds from thousands of records.", customerLabel: "App Store Reviewer" },
    { content: "Rating dropped from 5 stars to 2 after the last update. The new navigation is confusing and slower.", customerLabel: "App Store Reviewer" },
    { content: "Incredible customer support team. They solved my problem within the hour. Product is also great.", customerLabel: "App Store Reviewer" },
    { content: "The offline mode works seamlessly. Can review reports even without internet. Very impressed.", customerLabel: "App Store Reviewer" },
    { content: "Widgets don't work on iOS 17. Worked fine before. Please fix ASAP.", customerLabel: "App Store Reviewer" },
    { content: "Finally an app that doesn't require a PhD to understand. Intuitive and powerful.", customerLabel: "App Store Reviewer" },
  ],
  NPS_SURVEY: [
    { content: "It does the job, but the mobile experience needs significant work. Desktop is great though.", customerLabel: "NPS Respondent" },
    { content: "Would recommend to anyone in product management. It's transformed how our team makes decisions.", customerLabel: "NPS Respondent" },
    { content: "Too expensive for what we get. Competitors offer similar features at half the price.", customerLabel: "NPS Respondent" },
    { content: "The analytics are incredibly powerful once you learn the system. Onboarding could be smoother.", customerLabel: "NPS Respondent" },
    { content: "Customer support is outstanding. Any issue gets resolved same day. Product itself is solid.", customerLabel: "NPS Respondent" },
    { content: "Neutral — we use it because our company mandates it, not because we love it. Functional but uninspiring.", customerLabel: "NPS Respondent" },
    { content: "The reporting features save us hours every week. ROI has been clearly positive for our team.", customerLabel: "NPS Respondent" },
    { content: "Wish there were more customization options for dashboards. Feels rigid for our specific workflow.", customerLabel: "NPS Respondent" },
    { content: "Very happy with the product. The AI features are actually useful, not just marketing fluff.", customerLabel: "NPS Respondent" },
    { content: "Integration with our CRM was seamless. Data flows automatically now without manual exports.", customerLabel: "NPS Respondent" },
    { content: "Good product but onboarding new team members takes too long. Need better in-app guidance.", customerLabel: "NPS Respondent" },
    { content: "The trend analysis feature alone is worth the subscription price. Excellent product.", customerLabel: "NPS Respondent" },
  ],
  SALES_NOTE: [
    { content: "Prospect wants SSO before they'll sign — third time this month we've lost a deal over this.", customerLabel: "Enterprise Prospect" },
    { content: "Customer asked about audit logs and data retention policy. They're in finance sector, compliance is key.", customerLabel: "Financial Services Prospect" },
    { content: "Client loves the product but needs a self-hosted option. Security team won't approve cloud-only.", customerLabel: "Large Enterprise" },
    { content: "Prospect asked for a volume discount for 500 seats. Current pricing model doesn't accommodate this.", customerLabel: "Sales Call Note" },
    { content: "Customer wants deeper Salesforce integration. Current connector is read-only, they need bi-directional sync.", customerLabel: "CRM-Heavy Client" },
    { content: "Startup founder loved the demo but said pricing is too high for their stage. Need a startup tier.", customerLabel: "Early Stage Startup" },
    { content: "Mid-market client asking for dedicated customer success manager. Says current self-serve support isn't enough.", customerLabel: "Mid-Market Prospect" },
    { content: "Customer needs HIPAA compliance certification before they can use the product. Healthcare vertical.", customerLabel: "Healthcare Prospect" },
    { content: "Prospect asked if we have a free trial. When told no, they went to check out a competitor. Lost deal.", customerLabel: "SMB Prospect" },
    { content: "Customer wants API access on the starter plan. Currently only available on Professional tier.", customerLabel: "Developer-Led Company" },
    { content: "Large retail client needs multi-region data residency. EU and US data must stay separate legally.", customerLabel: "International Enterprise" },
    { content: "Prospect said our competitor offers white-labeling. We should consider this for agency market.", customerLabel: "Agency Client" },
  ],
  COMMUNITY: [
    { content: "Pro tip: use the keyboard shortcuts — Cmd+K for search, Cmd+N for new item. Game changer for productivity!", customerLabel: "Power User" },
    { content: "Has anyone figured out how to connect this to Zapier? The native integration seems broken.", customerLabel: "Community Member" },
    { content: "The new batch processing feature is exactly what I've been waiting for. Finally can process thousands of items.", customerLabel: "Community Member" },
    { content: "Loving the new UI redesign! Cleaner, faster, and the color scheme is much easier on the eyes.", customerLabel: "Community Member" },
    { content: "Is it just me or is the search getting slower? Was instant last month, now takes 2-3 seconds for results.", customerLabel: "Community Member" },
    { content: "Feature request: please add the ability to tag and categorize without leaving the current view.", customerLabel: "Power User" },
    { content: "The community here is incredibly helpful. Got my integration question answered in 10 minutes!", customerLabel: "New User" },
    { content: "Anyone else excited about the roadmap items? The AI features coming next quarter look game-changing.", customerLabel: "Community Member" },
    { content: "Just migrated from a competitor and the import was flawless. Data came over perfectly in 30 minutes.", customerLabel: "Migrated User" },
    { content: "The API documentation has gaps — several endpoints aren't documented. Would love comprehensive API docs.", customerLabel: "Developer" },
    { content: "The new collaboration features make async work so much better for our distributed team.", customerLabel: "Remote Team Lead" },
    { content: "Found a bug: when you filter by date range and then export, the export ignores the filter and includes all data.", customerLabel: "QA-Minded User" },
  ],
};

// Map UI channel names to DB FeedbackChannel enum
const CHANNEL_MAP: Record<string, FeedbackChannel> = {
  SUPPORT_TICKET: FeedbackChannel.EMAIL,
  APP_STORE: FeedbackChannel.MOBILE_APP,
  NPS_SURVEY: FeedbackChannel.WEBSITE,
  SALES_NOTE: FeedbackChannel.API,
  COMMUNITY: FeedbackChannel.WEBSITE,
};

const SimulateSchema = z.object({
  channel: z.enum(["SUPPORT_TICKET", "APP_STORE", "NPS_SURVEY", "SALES_NOTE", "COMMUNITY"]),
});

// ---------------------------------------------------------------------------
// POST /api/feedback/simulate
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.ADMIN, UserRole.ANALYST]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const body = await request.json();
    const parsed = SimulateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid channel. Must be one of: SUPPORT_TICKET, APP_STORE, NPS_SURVEY, SALES_NOTE, COMMUNITY" },
        { status: 400 }
      );
    }

    const { channel } = parsed.data;
    const samples = CHANNEL_SAMPLES[channel];
    const dbChannel = CHANNEL_MAP[channel];

    // Spread items across the past 60 days for realistic data
    const now = new Date();
    const itemsToCreate = samples.map((sample, i) => {
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      return {
        content: sample.content,
        channel: dbChannel,
        customerLabel: sample.customerLabel,
        externalReference: `sim-${channel.toLowerCase()}-${Date.now()}-${i}`,
        workspaceId,
        createdAt,
      };
    });

    const result = await prisma.feedback.createMany({
      data: itemsToCreate,
      skipDuplicates: false,
    });

    return NextResponse.json({
      seeded: result.count,
      channel,
      message: `Successfully seeded ${result.count} realistic ${channel.replace("_", " ").toLowerCase()} items.`,
    });
  } catch (error) {
    console.error("[simulate] Error:", error);
    return NextResponse.json(
      { message: "Failed to simulate channel data" },
      { status: 500 }
    );
  }
}
