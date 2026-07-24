export const qaProfiles = [
  {
    id: "qa3-pre-dtc-roamready-20260724",
    key: "roamready",
    name: "QA3 - RoamReady Play",
    mode: "preRevenue",
    archetype: "pre-revenue-dtc-consumer-product",
    operator: { name: "Elena Park", role: "Founder", owner: "Founder" },
    company: {
      website: "https://roamready.example.invalid",
      industry: "Consumer Products",
      businessModel: "Physical Product",
      stage: "Pre-revenue",
      geography: "United States",
      teamSize: "2",
      revenue: "Pre-revenue",
      customerCount: "0",
      budget: "$8,000 validation budget",
      capacity: "Founder plus one part-time product designer"
    },
    product: {
      primary: "RoamReady Adventure Kit",
      secondary: "Refill Activity Packs",
      description: "A modular, washable activity kit for keeping children ages four to eight engaged during flights, road trips, and restaurant waits without relying on a screen.",
      stage: "Functional prototypes; packaging and production order are not complete",
      priceHypothesis: "$54 to $69",
      offer: "Reserve a first-production RoamReady kit with a refundable preorder deposit"
    },
    customer: {
      broadMarket: "Parents and caregivers who travel or spend extended waiting time with young children",
      primarySegment: "Dual-income parents of children ages four to eight who take at least three family trips per year and actively seek lower-screen activities",
      plainLanguage: "Parents who regularly face long travel or restaurant waits with children ages four to eight, want a compact alternative to screens, and already buy activities or travel gear to make those moments easier.",
      user: "Children ages four to eight",
      buyer: "Parent or caregiver",
      influencer: "Parenting creators, travel-parent communities, and other parents",
      approver: "The purchasing parent or household partner",
      avoid: "Families with no upcoming travel or waiting-use occasion and buyers seeking a disposable low-price toy"
    },
    problem: {
      primary: "Parents struggle to keep young children calmly engaged during predictable travel and restaurant waiting periods without defaulting to a screen.",
      symptoms: [
        "Parents pack several loose activities that are easy to lose",
        "Children lose interest before the waiting period ends",
        "Parents use a phone or tablet despite wanting less screen time"
      ],
      urgency: "The problem becomes urgent before a booked family trip or recurring restaurant and appointment waits.",
      currentAlternative: "Tablets, downloaded videos, coloring books, small toys, and improvised activity bags",
      consequence: "Stress, disrupted meals or travel, lost pieces, and unwanted screen time",
      unknowns: ["Frequency of the problem", "Willingness to pay", "Strongest use occasion", "Repeat-purchase potential"]
    },
    outcome: {
      buyer: "Keep a child engaged for a meaningful portion of a trip or wait with one compact, reusable kit and less screen use.",
      measure: "Preorder conversion, price acceptance, reported use duration, repeat use, and parent satisfaction",
      success30: "At least 20 of 40 qualified parents complete an interview, 12 join the preorder list, and 5 place a refundable deposit at the target price.",
      continue: "Continue when at least five qualified parents place a refundable deposit and interviews repeatedly confirm the same high-priority use occasion.",
      revise: "Revise the use occasion, contents, or price when interest is high but deposits or price acceptance remain below the target.",
      stop: "Pause when fewer than eight of 40 qualified parents describe the problem as frequent and meaningful and fewer than two place a deposit."
    },
    evidence: {
      known: ["38 parent interviews", "120-person permission-based interest list", "Functional prototype reactions"],
      statement: "Thirty-eight parent interviews and prototype reactions suggest the waiting-time problem is real, but the team has not yet tested purchase behavior at the intended price.",
      confidence: "Medium",
      missing: ["Paid demand", "Use duration", "Repeat use", "Production economics"]
    },
    route: {
      primary: "Direct to consumer / end user",
      channels: ["Existing email list", "Parent and family-travel communities", "Founder-led interviews", "Limited preorder page"],
      motion: "Founder-led DTC validation",
      activityTarget: "Invite 40 qualified parents, complete 20 interviews, and present the preorder to every qualified participant",
      reviewCadence: "Weekly on Friday",
      owner: "Founder"
    },
    constraints: ["Limited prototype quantity", "No paid acquisition benchmark", "Packaging is unfinished", "Repeat-purchase path is uncertain"],
    proof: {
      available: ["Interview notes", "Prototype photographs", "Prototype reaction summaries"],
      missing: ["Paid preorder evidence", "Independent use results", "Production-quality proof"],
      permission: "Interview findings may be summarized anonymously; no named testimonials are approved"
    },
    systems: { sourceOfTruth: "Google Sheets", crm: "Spreadsheet", marketing: "Mailchimp", analytics: "Google Analytics" },
    provenance: {
      publicFacts: [],
      savedEvidence: ["Interviews", "Interest list", "Prototype reactions"],
      assumptions: ["Price", "Primary use occasion", "Conversion target", "Repeat-purchase path"]
    }
  },
  {
    id: "qa3-pre-saas-referralpath-20260724",
    key: "referralpath",
    name: "QA3 - ReferralPath Health",
    mode: "preRevenue",
    archetype: "pre-revenue-b2b-saas",
    operator: { name: "Noah Bennett", role: "Co-founder and CEO", owner: "CEO" },
    company: {
      website: "https://referralpath.example.invalid",
      industry: "Healthcare",
      businessModel: "SaaS",
      stage: "Pilot",
      geography: "United States",
      teamSize: "3",
      revenue: "Pre-revenue",
      customerCount: "0 paying; 2 design partners",
      budget: "$15,000 pilot and security-readiness budget",
      capacity: "Two technical founders and one clinical workflow advisor"
    },
    product: {
      primary: "ReferralPath Workflow",
      secondary: "Referral Status Reporting",
      description: "Workflow software that helps independent outpatient clinics track referrals requiring patient follow-up, authorization, or external scheduling.",
      stage: "Clickable product with two design partners; production integrations and security review are incomplete",
      priceHypothesis: "$1,250 to $2,500 per clinic per month",
      offer: "A 60-day design-partner pilot with workflow mapping, referral-status tracking, and an agreed success review"
    },
    customer: {
      broadMarket: "Outpatient healthcare organizations managing high referral volume",
      primarySegment: "Independent specialty clinics with 15 to 75 employees, more than 250 referrals per month, and referral coordination managed through spreadsheets and shared inboxes",
      plainLanguage: "Independent specialty clinics where operations teams manually chase referral status across inboxes, spreadsheets, authorizations, and outside scheduling partners.",
      user: "Referral coordinators and front-office operations staff",
      buyer: "Practice administrator or operations director",
      influencer: "Referral coordinators, clinical leaders, and RevOps or analytics staff",
      approver: "Owner physician, CEO, or finance leader",
      blocker: "IT, compliance, or security reviewer",
      avoid: "Hospital-owned systems with enterprise procurement and clinics with low referral volume"
    },
    problem: {
      primary: "Manual referral follow-up causes referral leakage, delayed care, repeated status work, and unreliable reporting.",
      symptoms: ["Referral status lives in spreadsheets and inboxes", "Staff repeatedly contact patients and external providers", "Leaders cannot see stalled referrals"],
      urgency: "The issue becomes urgent when referral volume grows, staff capacity is constrained, or leadership sees unexplained leakage.",
      currentAlternative: "Shared inboxes, spreadsheets, EHR work queues, and manual phone follow-up",
      consequence: "Lost appointments, delayed care, staff time, and unreliable operational reporting",
      unknowns: ["Integration requirements", "Security threshold", "Quantified labor savings", "Willingness to pay"]
    },
    outcome: {
      buyer: "Give clinic operations one reliable view of referral status and reduce manual follow-up without replacing the EHR.",
      measure: "Referral status coverage, time to next action, staff follow-up time, stalled referrals, and pilot conversion",
      success30: "Qualify eight clinics, complete six workflow reviews, and secure three written pilot commitments that include an operational owner and security-review path.",
      continue: "Continue when three clinics commit to a structured pilot and at least four quantify a meaningful referral-leakage or staff-time problem.",
      revise: "Revise the workflow, integration scope, or segment when the problem is confirmed but security or EHR requirements block a 60-day pilot.",
      stop: "Pause when fewer than three of eight qualified clinics identify referral leakage as a priority or no clinic will assign an operational pilot owner."
    },
    evidence: {
      known: ["Two design-partner workflows", "Referral coordinator interviews", "Clickable product feedback"],
      statement: "Two design partners confirm the manual workflow problem, but quantified ROI, security readiness, and paid conversion are not yet proven.",
      confidence: "Medium",
      missing: ["Paid pilot commitment", "Security approval", "Integration effort", "Measured time savings"]
    },
    route: {
      primary: "Retail, wholesale, marketplace, distributor, partner, corporate, team, or business account",
      channels: ["Healthcare association introductions", "Advisor referrals", "Founder-led targeted outreach", "Design-partner referrals"],
      motion: "Founder-led design-partner sales",
      activityTarget: "Build 30 qualified clinic accounts, request 15 introductions, complete 8 discovery calls, and ask 5 qualified clinics for a pilot commitment",
      reviewCadence: "Weekly on Thursday",
      owner: "CEO"
    },
    constraints: ["Security review incomplete", "No production integration", "Limited healthcare procurement experience", "Six months of runway"],
    proof: {
      available: ["Workflow maps", "Design-partner interview notes", "Clickable product demonstration"],
      missing: ["Measured time savings", "Security documentation", "Paid pilot result"],
      permission: "Design-partner names are confidential; anonymized workflow findings may be used"
    },
    systems: { sourceOfTruth: "HubSpot", crm: "HubSpot", marketing: "HubSpot", analytics: "PostHog" },
    provenance: {
      publicFacts: [],
      savedEvidence: ["Design-partner workflows", "Interviews", "Product feedback"],
      assumptions: ["Price", "Security path", "Pilot conversion", "Labor savings"]
    }
  },
  {
    id: "qa3-post-mixed-trailpour-20260724",
    key: "trailpour",
    name: "QA3 - TrailPour Pantry",
    mode: "postRevenue",
    archetype: "post-revenue-mixed-consumer-brand",
    operator: { name: "Priya Shah", role: "Chief Revenue Officer", owner: "Chief Revenue Officer" },
    company: {
      website: "https://trailpour.example.invalid",
      industry: "Consumer Products",
      businessModel: "Physical Product",
      stage: "Growth",
      geography: "United States",
      teamSize: "8",
      revenue: "$2.1 million trailing twelve months",
      revenueRange: "$1,000,001 - $5,000,000",
      customerCount: "18,000 D2C customers and 140 active retail doors",
      budget: "$90,000 90-day trade and lifecycle marketing budget",
      capacity: "One account manager, two marketing staff, and shared operations support"
    },
    product: {
      primary: "TrailPour Drink Concentrate Starter Bundle",
      secondary: "TrailPour Retail Assortment Program",
      description: "Shelf-stable, low-sugar drink concentrates for outdoor and active households, sold directly and through independent retailers.",
      price: "$46 D2C starter bundle; $480 retailer opening order",
      offer: "A focused starter assortment with channel-specific merchandising and reorder support"
    },
    customer: {
      broadMarket: "Active households and specialty retailers serving outdoor consumers",
      primarySegment: "Independent outdoor retailers with two to twelve locations, strong hydration and trail-nutrition assortments, and buyers accountable for category sell-through",
      secondarySegment: "Outdoor households that buy low-sugar hydration products at least monthly",
      plainLanguage: "Independent outdoor retailers whose customers actively buy hydration and trail products and whose buyers need differentiated, margin-positive products that reorder predictably.",
      user: "Outdoor consumers and active households",
      buyer: "Retail category buyer or owner",
      influencer: "Store managers, floor staff, consumers, and merchandising leads",
      approver: "Retail owner, category director, or regional merchandising leader",
      avoid: "Price-led mass retailers requiring national scale, heavy trade spend, or unproven production capacity"
    },
    problem: {
      primary: "Retail buyers need differentiated products that fit the assortment, earn acceptable margin, and sell through quickly enough to justify reorders.",
      symptoms: ["Reorder rates vary by retailer", "Merchandising support is inconsistent", "The team cannot compare wholesale and D2C contribution cleanly"],
      urgency: "Fall line reviews and the next seasonal buying window require a focused channel decision within 90 days.",
      currentAlternative: "Established hydration powders, ready-to-drink beverages, and private-label drink mixes",
      consequence: "Slow sell-through, weak reorders, tied inventory, and diluted team focus"
    },
    outcome: {
      buyer: "Add a differentiated hydration product that reaches target margin and earns a repeat order within the expected selling window.",
      measure: "Retail sell-through, gross margin, reorder rate, reorder timing, D2C repeat purchase, and contribution margin",
      success90: "Increase qualified retail reorders from 41% to 55% while maintaining at least 42% wholesale gross margin and identifying the two merchandising actions most associated with reorder.",
      continue: "Continue the independent outdoor retailer focus when reorder reaches at least 55% and wholesale contribution remains positive after support costs.",
      revise: "Revise assortment, merchandising, or account criteria when sell-through varies materially by store profile or support level.",
      stop: "Pause broad retail expansion when reorder remains below 45% or support costs eliminate positive contribution."
    },
    evidence: {
      known: ["$2.1 million trailing revenue", "Channel-level order history", "140 active retail doors", "18,000 D2C customers", "Retailer feedback"],
      statement: "Wholesale creates 58% of revenue and door growth is strong, but reorder and support economics vary enough that the next growth focus is not yet proven.",
      confidence: "High for historical performance; medium for the recommended focus",
      missing: ["Consistent account-level sell-through", "Support cost by account", "Comparable channel contribution"]
    },
    route: {
      primary: "Wholesale account development",
      secondary: "D2C ecommerce and lifecycle marketing",
      channels: ["Existing retailer base", "Regional trade shows", "Distributor introductions", "Klaviyo lifecycle email"],
      motion: "Account-based wholesale expansion with reorder optimization",
      activityTarget: "Review 40 retailer accounts, select 20 matched test accounts, run one merchandising intervention, and review reorder evidence weekly",
      reviewCadence: "Weekly on Monday",
      owner: "Chief Revenue Officer"
    },
    constraints: ["One account manager", "Seasonal demand", "Production minimums", "Limited trade-spend budget", "Inconsistent sell-through data"],
    proof: {
      available: ["Retail order history", "D2C repeat-purchase data", "Retailer testimonials", "Margin reports"],
      missing: ["Normalized sell-through comparison", "Merchandising test result", "Support-cost allocation"],
      permission: "Named retailer results require approval; aggregate performance may be shared"
    },
    systems: { sourceOfTruth: "Shopify and HubSpot", crm: "HubSpot", marketing: "Klaviyo", analytics: "Google Analytics", commerce: "Shopify" },
    provenance: {
      publicFacts: [],
      savedEvidence: ["Revenue", "Orders", "Reorders", "Customers", "Retail feedback"],
      assumptions: ["Best 90-day channel", "Merchandising causality", "Scalable account criteria"]
    }
  },
  {
    id: "qa3-post-saas-clientrenew-20260724",
    key: "clientrenew",
    name: "QA3 - ClientRenew OS",
    mode: "postRevenue",
    archetype: "post-revenue-b2b-saas-repositioning",
    operator: { name: "Owen Carter", role: "Chief Executive Officer", owner: "CEO" },
    company: {
      website: "https://clientrenew.example.invalid",
      industry: "Software / Technology",
      businessModel: "SaaS",
      stage: "Turnaround",
      geography: "North America",
      teamSize: "17",
      revenue: "$1.35 million ARR",
      revenueRange: "$1,000,001 - $5,000,000",
      customerCount: "34",
      averageDealSize: "$39,000 annual contract value",
      budget: "$120,000 quarterly GTM budget",
      capacity: "Four-person sales and marketing team plus founder involvement"
    },
    product: {
      primary: "ClientRenew Revenue Workspace",
      secondary: "HubSpot Renewal Risk Dashboard",
      description: "Renewal-risk and expansion workflow software for recurring-revenue service businesses using HubSpot.",
      price: "$24,000 to $60,000 annual subscription",
      offer: "A 45-day renewal-workflow diagnostic and implementation pilot for one client portfolio"
    },
    customer: {
      assumedSegment: "B2B SaaS companies with 50 to 250 employees",
      primarySegment: "Managed-service and IT consulting firms with 40 to 200 employees, at least 40 recurring client contracts, HubSpot, and no dedicated customer-success operations team",
      plainLanguage: "Managed-service and IT consulting firms whose leaders own recurring client revenue but cannot see renewal risk, next actions, and expansion opportunities consistently in HubSpot.",
      user: "Client success, account management, and service-delivery leaders",
      buyer: "COO or VP Client Services",
      influencer: "Revenue Operations and service-delivery leaders",
      approver: "CEO or CFO",
      blocker: "RevOps or IT when HubSpot data quality is too weak for implementation",
      avoid: "Product-led SaaS companies with mature customer-success platforms and firms with fewer than 20 recurring client contracts"
    },
    problem: {
      primary: "Leaders cannot reliably see renewal risk, ownership, and expansion actions across recurring client accounts in HubSpot.",
      symptoms: ["Renewal work is tracked in spreadsheets", "Account reviews depend on manual updates", "Expansion signals are discovered late"],
      urgency: "The problem becomes urgent before a renewal-heavy quarter, after preventable churn, or when a founder delegates account oversight.",
      currentAlternative: "HubSpot properties, spreadsheets, project-management tools, and manager-led account reviews",
      consequence: "Late risk detection, inconsistent follow-up, preventable churn, and missed expansion revenue"
    },
    outcome: {
      buyer: "Run one reliable weekly renewal and expansion review from HubSpot without adding a large customer-success platform.",
      measure: "Renewal coverage, accounts with owners and next actions, risk identified before renewal, gross retention, expansion pipeline, and sales-cycle conversion",
      success90: "Create 24 qualified managed-service opportunities, complete 12 discovery calls, start 4 pilots, and close 2 customers while measuring conversion against the SaaS segment baseline.",
      continue: "Continue when the segment produces at least four qualified pilots and opportunity-to-pilot conversion exceeds the SaaS baseline by 25%.",
      revise: "Revise the problem, proof, or account criteria when discovery is strong but fewer than four qualified buyers start a pilot.",
      stop: "Stop prioritizing the segment when 12 qualified conversations produce fewer than two urgent renewal-workflow problems and no pilot commitments."
    },
    evidence: {
      known: ["$1.35 million ARR", "34 customers", "91% gross retention", "Six of ten fastest wins came from managed-service or IT consulting firms", "Twelve months of pipeline history"],
      statement: "Historical wins support a managed-service hypothesis, while the assumed SaaS segment shows longer reviews and weaker conversion; repeatability and market scale still require a controlled test.",
      confidence: "High for historical win pattern; medium for market-priority recommendation",
      missing: ["Controlled segment conversion", "Vertical proof asset", "Repeatable partner source", "Market-size validation"]
    },
    route: {
      primary: "Targeted outbound sales",
      secondary: "Partner and customer referrals",
      channels: ["HubSpot install-base research", "Targeted email", "Partner referrals", "Founder-led discovery"],
      motion: "Inside-sales managed-service segment test",
      activityTarget: "Research 60 matched accounts, contact 40, complete 12 qualified conversations, and ask 6 for a diagnostic or pilot",
      reviewCadence: "Weekly on Friday",
      owner: "VP Sales"
    },
    constraints: ["Nine months of runway", "Inconsistent opportunity stages", "Too many message variants", "Weak vertical proof", "Crowded SaaS category"],
    proof: {
      available: ["Customer retention data", "Six fast-win records", "HubSpot workflow examples", "Customer reference calls"],
      missing: ["Managed-service case study", "Segment-specific ROI model", "Controlled test results"],
      permission: "Two customers allow reference calls; named metrics require written approval"
    },
    systems: { sourceOfTruth: "HubSpot", crm: "HubSpot", marketing: "HubSpot", analytics: "PostHog", billing: "Stripe" },
    provenance: {
      publicFacts: [],
      savedEvidence: ["ARR", "Customers", "Retention", "Win history", "Pipeline history"],
      assumptions: ["Market priority", "Segment scale", "Partner repeatability", "Pilot conversion"]
    }
  }
];

export const profileById = Object.fromEntries(qaProfiles.map((profile) => [profile.id, profile]));
