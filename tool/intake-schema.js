const HELP_BLOCKS = {
  company: [
    {
      title: "What is GTM?",
      body: "GTM means go-to-market. It is how the company chooses the right customers, positions the offer, reaches buyers, sells, proves value, and turns interest into revenue."
    },
    {
      title: "What is a sales motion?",
      body: "A sales motion is the usual way a buyer becomes a customer. Examples include self-serve purchase, founder-led sales, inside sales, enterprise sales, partner-led sales, or product-led growth."
    }
  ],
  baseGtm: [
    {
      title: "What is GTM readiness?",
      body: "GTM readiness means how prepared the company is to run focused revenue activity. It looks at customer clarity, urgency, offer strength, proof, channels, sales process, tracking, budget, and team capacity."
    },
    {
      title: "What is evidence?",
      body: "Evidence is proof from real behavior or real conversations, not just an assumption. Examples include customer wins, buyer interviews, CRM data, conversion rates, testimonials, pilots, or repeated objections."
    }
  ],
  goals: [
    {
      title: "What is a 30/60/90 success plan?",
      body: "A 30/60/90 success plan turns a broad goal into near-term checkpoints. It defines what needs to be true by 30, 60, and 90 days so the team can learn, adjust, and avoid unfocused work."
    },
    {
      title: "What is a GTM constraint?",
      body: "A GTM constraint is the bottleneck most likely to slow revenue progress. It can be focus, proof, budget, team capacity, product readiness, channel access, sales process, or data quality."
    }
  ],
  traction: [
    {
      title: "What is customer evidence?",
      body: "Customer evidence is proof from customers or active users that the offer solves a real problem. It can include measurable results, testimonials, case studies, references, reviews, usage data, or strong customer stories."
    },
    {
      title: "What is a proof candidate?",
      body: "A proof candidate is a customer who could support the sales process with a quote, testimonial, reference call, case study, review, logo, referral, or measurable result."
    },
    {
      title: "What is delivery fit?",
      body: "Delivery fit means how repeatably and profitably the company can serve a customer type. Poor delivery fit often shows up as heavy customization, unclear ownership, bad data, low adoption, or high support burden."
    }
  ],
  personas: [
    {
      title: "What is a buying committee?",
      body: "A buying committee is the group of people who influence, approve, use, review, or block a purchase. Even small deals can have more than one buyer role."
    },
    {
      title: "What is an economic buyer?",
      body: "The economic buyer is the person with budget authority or final financial approval. They may not use the solution daily, but they care about business value, risk, and return."
    },
    {
      title: "What is a champion?",
      body: "A champion is the person inside the buyer organization who wants the problem solved and helps move the deal forward. A champion may need help reaching budget authority."
    }
  ],
  offer: [
    {
      title: "What is offer readiness?",
      body: "Offer readiness means the company can clearly explain the buyer problem, promised outcome, package, price, proof, objections, and next step well enough to support sales."
    },
    {
      title: "What is measurable value?",
      body: "Measurable value is the business outcome the buyer can track. Examples include hours saved, cost reduced, revenue added, qualified leads created, risk reduced, or conversion improved."
    },
    {
      title: "What is proof readiness?",
      body: "Proof readiness means having the evidence and assets needed to make the offer believable. This can include case studies, metrics, quotes, demos, references, ROI tools, implementation plans, or security documentation."
    }
  ],
  buyerProblem: [
    {
      title: "What is buyer urgency?",
      body: "Buyer urgency is the reason the buyer needs to act soon instead of later. Strong urgency usually comes from pain, timing pressure, risk, cost, growth goals, or a trigger event."
    }
  ],
  packagingPricing: [
    {
      title: "What is offer packaging?",
      body: "Offer packaging is how the solution is bundled and sold. It defines the entry offer, core offer, expansion path, what is included, pricing model, term, and success metric."
    },
    {
      title: "What is minimum viable deal size?",
      body: "Minimum viable deal size is the smallest deal that is still worth selling and serving after considering sales time, delivery effort, margin, support, and strategic value."
    }
  ],
  pilotPlan: [
    {
      title: "What is a pilot?",
      body: "A pilot is a limited first engagement used to reduce buyer risk and prove value. A strong pilot has a clear length, success metric, buyer requirements, and conversion path to a paid next step."
    }
  ],
  alternativesObjections: [
    {
      title: "What is an alternative?",
      body: "An alternative is what the buyer uses instead of your offer. It may be a named competitor, spreadsheet, manual process, internal team, agency, consultant, generic tool, or doing nothing."
    },
    {
      title: "What is an objection?",
      body: "An objection is a concern that can slow or stop a deal. Common objections include price, timing, trust, ROI, implementation effort, risk, data, ownership, switching cost, or adoption."
    }
  ],
  signals: [
    {
      title: "What is a trigger event?",
      body: "A trigger event is something that happens to a company or buyer that creates timing. It suggests they may need a solution now.",
      examples: ["New funding", "Leadership change", "New location or market expansion", "Compliance deadline", "Vendor dissatisfaction", "Hiring for a relevant role", "Customer complaints", "Cost-cutting initiative", "New system implementation", "Budget cycle"]
    },
    {
      title: "What is a fit signal?",
      body: "A fit signal is evidence that a company matches your best-fit customer profile.",
      examples: ["Right industry", "Right company size", "Right business model", "Uses a relevant system", "Has the right buyer role", "Similar to a successful customer", "Has the operational problem you solve"]
    },
    {
      title: "What is an intent signal?",
      body: "An intent signal suggests the buyer may be actively researching, comparing, or preparing to act.",
      examples: ["Visits pricing page", "Downloads a guide", "Attends webinar", "Engages with outbound", "Searches comparison content", "Asks for a referral", "Requests demo or consultation"]
    },
    {
      title: "What is a negative signal?",
      body: "A negative signal suggests the opportunity may be a poor fit, low priority, or not worth pursuing right now.",
      examples: ["No budget", "Too small", "Too custom", "No clear owner", "Long procurement cycle", "Poor data quality", "Heavy implementation burden", "Weak urgency"]
    }
  ],
  pipeline: [
    {
      title: "What is a channel or source?",
      body: "A channel or source is where revenue opportunities come from. Examples include outbound email, LinkedIn, referrals, partners, paid search, SEO, events, current customer expansion, marketplaces, and inbound website leads."
    },
    {
      title: "What is pipeline?",
      body: "Pipeline is the set of active revenue opportunities moving through the sales process. It should show how many opportunities exist, where they are, what they are worth, and what needs to happen next."
    },
    {
      title: "What is a sales motion?",
      body: "A sales motion is the repeatable way the company turns interest into revenue. Examples include founder-led selling, inside sales, enterprise sales, partner-led selling, product-led growth, ecommerce, and customer expansion."
    },
    {
      title: "What is a revenue motion play?",
      body: "A revenue motion play is the specific path used to create and convert revenue for a customer group and offer. It combines the target customer, offer, channel, sales process, owner, and success metric.",
      examples: ["Outbound email to operations leaders at multi-location service businesses to sell a paid diagnostic."]
    }
  ]
};

const GTM_INTAKE_SCHEMA = {
  storageKey: "gtmReadinessIntake",
  scoreFields: [
    "marketUrgency",
    "icpClarity",
    "positioningClarity",
    "offerClarity",
    "pricingConfidence",
    "channelFocus",
    "salesMotion",
    "contentAssets",
    "funnelTracking",
    "experimentReadiness",
    "budget",
    "teamCapacity"
  ],
  sections: [
    {
      id: "company",
      title: "Company Information",
      description: "Baseline company context, public presence, current sales channels, and GTM systems.",
      helpBlocks: HELP_BLOCKS.company,
      fields: [
        { id: "companyName", label: "Company name", type: "text", required: true, quick: true },
        { id: "website", label: "Primary website URL", type: "url", placeholder: "https://example.com", quick: true },
        { id: "preparedBy", label: "Your Name", type: "text" },
        { id: "respondentRole", label: "Role / title", type: "text" },
        { id: "reviewPeriod", label: "Report Time Period", type: "select", options: ["Last 90 days", "Last 6 months", "Last 12 months", "Current quarter", "Current fiscal year", "Current Calendar Year", "Custom Date Range"] },
        { id: "reportStartDate", label: "Custom start date", type: "text", placeholder: "DD/MM/YYYY", showWhen: { field: "reviewPeriod", value: "Custom Date Range" } },
        { id: "reportEndDate", label: "Custom finish date", type: "text", placeholder: "DD/MM/YYYY", showWhen: { field: "reviewPeriod", value: "Custom Date Range" } },
        { id: "primaryOfferName", label: "Primary Product Line / Offer", type: "text", placeholder: "Product / offer name", quick: true },
        { id: "primaryOfferUrl", label: "Primary product page URL", type: "url", placeholder: "https://example.com/product" },
        { id: "secondaryOfferName", label: "Secondary Product Line / Offer", type: "text", placeholder: "Product / offer name" },
        { id: "secondaryOfferUrl", label: "Secondary product page URL", type: "url", placeholder: "https://example.com/product" },
        { id: "industryId", label: "What industry or market do you primarily serve?", type: "select", required: true, options: window.GTM_TAXONOMY.INDUSTRY_OPTIONS, hint: "Industry = the market you operate in or sell to.", otherValue: "other_not_sure", otherLabel: "Briefly describe your industry", quick: true },
        { id: "businessTypeId", label: "Which best describes your business model?", type: "select", required: true, options: window.GTM_TAXONOMY.BUSINESS_TYPE_OPTIONS, hint: "Business model = what you sell and how the business is structured.", otherValue: "other_not_sure", otherLabel: "Briefly describe your business model", quick: true },
        { id: "companyStage", label: "Company stage", type: "select", options: ["Pre-revenue", "Pilot", "Early revenue", "Growth", "Scale", "Turnaround", "New market entry"], quick: true },
        { id: "geography", label: "Primary geography / markets served", type: "select", options: ["North America", "United States", "Canada", "Mexico", "South America", "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Europe", "United Kingdom", "Ireland", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Switzerland", "Asia", "China", "India", "Japan", "South Korea", "Singapore", "Indonesia", "Australia / Oceania", "Australia", "New Zealand", "Africa", "South Africa", "Nigeria", "Kenya", "Egypt", "Middle East", "United Arab Emirates", "Saudi Arabia", "Israel", "Global", "Other"] },
        { id: "teamSize", label: "Employee count / team size", type: "text" },
        { id: "revenueRange", label: "Current annual revenue", type: "select", options: ["Pre-revenue", "$0 - $1,000,000", "$1,000,001 - $5,000,000", "$5,000,001 - $10,000,000", "$10,000,001+"], quick: true },
        { id: "hasRecurringRevenue", label: "Revenue model", type: "checkbox", checkboxLabel: "Recurring revenue applies to this business" },
        { id: "monthlyRecurringRevenue", label: "Monthly recurring revenue (MRR)", type: "money", placeholder: "25,000", showWhen: { field: "hasRecurringRevenue", checked: true } },
        { id: "annualRecurringRevenue", label: "Annual recurring revenue (ARR)", type: "money", placeholder: "300,000", showWhen: { field: "hasRecurringRevenue", checked: true } },
        { id: "customerCount", label: "Current customer count", type: "text" },
        { id: "averageDealSize", label: "Average deal size / order value / contract value", type: "money", quick: true },
        { id: "primarySalesMotion", label: "Primary sales motion today", type: "select", options: ["Self-serve", "Inside sales", "Field sales", "Founder-led", "Partner-led", "Enterprise sales", "Product-led", "Ecommerce", "Other"], quick: true },
        { id: "mainGrowthConstraint", label: "Main growth constraint today", type: "select", options: ["Strategic Planning - Lack of Documented Strategy/Tactics", "Strategic Planning - No clear documented vision", "Strategic Planning - Lack of realistic SWOT", "Technology - Outdated Tech", "Technology - Need for expensive systems", "Technology - Lack of AI Strategy", "Financial and Capital Constraints - Cash Flow Management", "Financial and Capital Constraints - Low or no Access to Credit", "Financial and Capital Constraints - Under Capitalization", "Talent and Leadership - Finding Qualified Workers", "Talent and Leadership - Founder Delegation", "Talent and Leadership - Workforce Demands", "Operational Infrastructure - Process Scalability", "Operational Infrastructure - Supply Chain Disruptions", "Operational Infrastructure - Organizational Complexity", "Market Dynamics and Product Fit - Lack of Strategic Planning", "Market Dynamics and Product Fit - Unclear Product-Market Fit", "Market Dynamics and Product Fit - Intense Competition", "Market Dynamics and Product Fit - Regulatory Hurdles", "Other"] },
        { id: "additionalGrowthConstraints", label: "Other / additional growth constraints", type: "repeatableList", minItems: 1, addLabel: "Add constraint", itemPlaceholder: "Enter one additional constraint" },
        { id: "researchNotes", label: "Research notes / ChatGPT paste-back", type: "textarea", full: true }
      ],
      tables: [
        {
          id: "publicPresence",
          title: "Website URLs, social media, and public presence",
          rows: ["Primary website", "Product / solution pages", "Pricing page", "Demo / contact / booking page", "Blog / resources / learning center", "LinkedIn company page", "Founder / executive profiles", "X / Twitter", "Facebook", "Instagram", "TikTok", "YouTube / video channel", "Podcast / webinar series", "Community / forum / group", "Review profiles or ratings sites", "Marketplace or directory listings", "Other important public pages"],
          columns: [
            { id: "url", label: "URL(s)", type: "text" },
            { id: "notes", label: "Notes / owner / status", type: "text" }
          ]
        },
        {
          id: "gtmSystems",
          title: "GTM systems and data sources",
          rows: ["CRM", "Marketing automation / email", "Sales engagement / sequencing", "Website analytics / conversion tracking", "Form, chat, and booking tools", "Data enrichment / prospecting tools", "Proposal, contract, and billing tools", "Customer success / support / onboarding tools", "Product analytics / usage data", "Reporting / dashboards / BI"],
          columns: [
            {
              id: "tools",
              label: "Tool(s) used",
              type: "text",
              optionsByRow: {
                crm: ["ActiveCampaign", "Agile", "Apptivo", "Brevo", "Monday", "Copper", "Insightly", "Keap", "Maximizer", "SugarCRM", "Zendesk", "Freshsales", "HubSpot", "Salesforce", "Pipedrive", "Zoho", "Spreadsheet", "Other"],
                "marketing-automation-email": ["ActiveCampaign", "Attio", "Beehiiv", "Brevo", "Customer.io", "Gumloop", "HubSpot", "Klaviyo", "Loops", "Mailchimp", "Monday", "Roadway AI", "Zapier", "Zoho", "Other"],
                "sales-engagement-sequencing": ["Agentforce Sales", "Apollo.io", "HubSpot Sales Hub", "Instantly", "Klenty", "La Growth Machine", "Lemlist", "Mailshake", "Mixmax", "Outreach", "Overloop", "Reply.io", "Salesloft", "SmartReach.io", "VanillaSoft", "Warmy", "Other"],
                "website-analytics-conversion-tracking": ["Google Analytics", "Google Tag Manager", "HubSpot", "Hotjar", "Microsoft Clarity", "Mixpanel", "PostHog", "Segment", "Amplitude", "Heap", "Other"],
                "form-chat-and-booking-tools": ["Calendly", "Chili Piper", "HubSpot Forms", "Typeform", "Gravity Forms", "Intercom", "Drift", "Tidio", "Acuity", "Other"],
                "data-enrichment-prospecting-tools": ["Apollo.io", "ZoomInfo", "Clearbit", "Clay", "LinkedIn Sales Navigator", "Lusha", "Seamless.AI", "Crunchbase", "BuiltWith", "Other"],
                "proposal-contract-and-billing-tools": ["DocuSign", "PandaDoc", "Proposify", "Qwilr", "Stripe", "QuickBooks", "Bill.com", "Square", "Shopify", "Other"],
                "customer-success-support-onboarding-tools": ["Zendesk", "Intercom", "Freshdesk", "HubSpot Service Hub", "Gainsight", "ChurnZero", "Totango", "Help Scout", "Notion", "Other"],
                "product-analytics-usage-data": ["Mixpanel", "Amplitude", "PostHog", "Heap", "Pendo", "FullStory", "Google Analytics", "Segment", "Other"],
                "reporting-dashboards-bi": ["Looker Studio", "Tableau", "Power BI", "Metabase", "Databox", "Klipfolio", "Google Sheets", "Excel", "HubSpot Dashboards", "Salesforce Reports", "Other"]
              }
            },
            { id: "owner", label: "Owner", type: "select", options: ["", "Founder", "Marketing Lead", "Sales Lead", "Other"] },
            { id: "quality", label: "Data quality", type: "select", options: ["", "High", "Mid", "Low"] },
            { id: "gaps", label: "Notes / gaps", type: "text" }
          ]
        }
      ]
    },
    {
      id: "executiveQuickReview",
      title: "GTM Information",
      description: "Answer these high-level questions to establish the baseline GTM readiness score.",
      helpBlocks: HELP_BLOCKS.baseGtm,
      quickDefault: true,
      cards: [
        {
          title: "Market and Customer",
          description: "Do we know who we are selling to, and do they have a reason to act now?",
          fields: [
            { id: "quickBestFitCustomer", label: "Best-fit customer right now", type: "textarea", placeholder: "Example: Mid-market B2B service companies with manual lead qualification and inconsistent follow-up." },
            { id: "quickBuyerProblem", label: "Main buyer problem", type: "textarea", placeholder: "Example: Sales teams waste time on low-fit leads and miss high-intent prospects." },
            { id: "quickUrgencyNow", label: "What makes this urgent now?", type: "textarea", placeholder: "Example: Lead volume is increasing, response times are slow, and conversion rates are falling." },
            { id: "icpClarity", label: "ICP clarity", type: "scoreSelect", options: ["Not defined", "Broad audience only", "Defined but not validated", "Validated with customer evidence", "Highly specific and consistently used"] },
            { id: "marketUrgency", label: "Market urgency", type: "scoreSelect", options: ["Optional or nice-to-have", "Problem exists but timing is unclear", "Some buyers are actively looking", "Best-fit buyers have clear urgency", "Urgent, budgeted, and time-sensitive"] }
          ]
        },
        {
          title: "Offer, Value, and Proof",
          description: "Can we clearly explain what we sell, why it matters, and why the buyer should believe us?",
          fields: [
            { id: "quickOfferPromise", label: "One-sentence offer promise", type: "textarea", placeholder: "Example: We help sales teams prioritize the right leads faster so they can improve speed-to-lead and conversion." },
            { id: "quickPrimaryOutcome", label: "Primary measurable outcome", type: "select", options: ["Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Reduce implementation burden", "Improve customer experience", "Other"] },
            { id: "quickSuccessMeasure", label: "How would the buyer measure success?", type: "text", placeholder: "Example: Hours saved per week, qualified demos booked, close rate, revenue added, churn reduced." },
            { id: "contentAssets", label: "Proof and asset readiness", type: "scoreSelect", options: ["No proof or sales assets yet", "Basic website or pitch deck only", "Some proof or sales assets exist", "Strong proof for the priority buyer", "Repeatable proof and assets tied to funnel stages"] },
            { id: "positioningClarity", label: "Positioning clarity", type: "scoreSelect", options: ["Unclear", "Mostly feature-led", "Benefit-led but generic", "Differentiated for the ICP", "Sharp, differentiated, and proven"] },
            { id: "offerClarity", label: "Offer clarity", type: "scoreSelect", options: ["Offer unclear", "Offer exists but is hard to explain", "Clear offer, weak proof", "Clear offer with proof points", "Compelling offer with proof and urgency"] },
            { id: "pricingConfidence", label: "Pricing confidence", type: "scoreSelect", options: ["No clear pricing model", "Pricing is mostly guessed", "Accepted but not optimized", "Matches buyer value and segment", "Validated and supports expansion"] }
          ]
        },
        {
          title: "Revenue Motion",
          description: "Do we know where revenue comes from and how selling works?",
          fields: [
            { id: "quickPrimaryRevenueSource", label: "Primary revenue source today", type: "select", options: ["Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Website conversion / booking flow", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Network referrals", "Customer referrals", "Trade shows", "Partners / affiliates / resellers", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Retail / field / local selling", "Other", "Not sure yet"] },
            { id: "quickCurrentSalesMotion", label: "Current sales motion", type: "select", options: ["Self-serve", "Inside sales", "Field sales", "Founder-led", "Partner-led", "Enterprise sales", "Product-led", "Ecommerce", "Services / consultative selling", "Other", "Not sure yet"] },
            { id: "channelFocus", label: "Channel focus", type: "scoreSelect", options: ["No clear acquisition channel", "Many channels, little focus", "One or two plausible channels", "Primary channel has evidence", "Repeatable channel with known economics"] },
            { id: "salesMotion", label: "Sales process maturity", type: "scoreSelect", options: ["No defined sales process", "Ad hoc founder-led selling", "Basic process exists", "Documented with conversion tracking", "Predictable motion with clear handoffs"] },
            { id: "funnelTracking", label: "Funnel tracking", type: "scoreSelect", options: ["No reliable tracking", "Basic traffic or sales reporting", "Lead and conversion metrics tracked", "Funnel metrics reviewed regularly", "Full funnel economics and attribution available"] }
          ]
        },
        {
          title: "Execution Readiness",
          description: "Can the company actually execute the GTM plan?",
          fields: [
            { id: "quick90DayGoal", label: "Primary GTM goal for the next 90 days", type: "select", options: ["Customer validation", "Lead flow", "Revenue", "Retention", "Expansion", "Strategic reference customer", "Category awareness", "Systems / process improvement", "Hiring / team capacity", "Other"] },
            { id: "quick90DayRevenueTarget", label: "90-day revenue target", type: "money", required: true, showWhen: { field: "quick90DayGoal", value: "Revenue" }, placeholder: "Example: 100000", hint: "Required when Revenue is the 90-day goal. Enter the revenue amount you want to create or close in the next 90 days." },
            { id: "quick90DaySuccessMetric", label: "How will you know the next 90 days worked?", type: "text", placeholder: "Example: 20 qualified demos, $100k pipeline created, 5 expansion opportunities, 3 customer interviews." },
            { id: "quickBiggestConstraint", label: "Biggest GTM constraint", type: "select", options: ["Focus", "ICP clarity", "Messaging", "Proof", "Budget", "Team capacity", "Sales process", "Channel access", "Data quality", "Product readiness", "Implementation capacity", "Technology / systems", "Other"] },
            { id: "quickStopAvoid", label: "What should we stop or avoid for now?", type: "textarea", placeholder: "Example: Low-value custom deals, channels without measurable results, segments with long sales cycles, prospects without budget." },
            { id: "weeklyRevenueHours", label: "Protected weekly hours for direct revenue activity", type: "select", options: ["0-2", "3-5", "6-10", "11-20", "20+"] },
            { id: "experimentReadiness", label: "Experiment readiness", type: "scoreSelect", options: ["No testing process", "Occasional unstructured tests", "Test ideas exist but weak measurement", "Prioritized experiments with success metrics", "Consistent learning loop and decision rhythm"] },
            { id: "budget", label: "Budget readiness", type: "scoreSelect", options: ["No budget identified", "Small test budget only", "Budget exists but constrained", "Budget available for focused execution", "Budget supports scaling after validation"] },
            { id: "teamCapacity", label: "Team capacity", type: "scoreSelect", options: ["No clear owner", "Part-time owner only", "Owner plus limited support", "Dedicated owner and supporting team", "Cross-functional team with execution cadence"] }
          ]
        }
      ]
    },
    {
      id: "quickIcp",
      title: "Best-Fit Customer Focus",
      description: "Identify the customer group most likely to buy, get value quickly, and be worth pursuing now.",
      introBlocks: [
        {
          title: "What makes a good customer group?",
          body: "A customer group should be specific enough that you can find more companies like them later. Good: Multi-location franchise systems with 50-250 locations. Poor: Businesses."
        },
        {
          title: "How is the customer group score used?",
          body: "The score combines urgency, ability to pay, ease of access, proof available, and implementation fit. High-scoring customer groups are easier to identify, reach, sell, and scale."
        },
        {
          title: "What is a Customer Segment?",
          body: "A customer segment is a group of similar buyers who have the same kind of problem, similar buying needs, and a similar reason to act. A segment can be based on industry, company size, business model, buyer role, geography, trigger event, or current problem.",
          examples: ["Multi-location home service businesses", "Early-stage SaaS companies with founder-led sales", "Franchise brands trying to improve local lead flow", "Healthcare practices with manual intake processes", "Companies that recently changed leadership or raised funding"]
        },
        {
          title: "What is an Ideal Customer Profile?",
          body: "Your Ideal Customer Profile, or ICP, is the customer type most likely to buy, get measurable value, and be worth serving. For this tool, pick the best customer to focus on first, not every possible customer you could sell to."
        }
      ],
      content: [
        {
          title: "Step 1: Possible Customer Groups",
          hint: "List 1-3 customer groups you could realistically sell to. Use plain language. Do not worry about perfect wording.",
          tables: [
            {
              id: "possibleCustomerGroups",
              title: "",
              hint: "",
              layout: "cards",
              summaryType: "segmentFit",
              repeatable: true,
              rowLabel: "Customer Group",
              minRows: 1,
              maxRows: 3,
              addLabel: "Add another customer group",
              advancedGroups: ["Advanced segment scoring"],
              columns: [
                { id: "groupName", label: "Customer group name", type: "text", group: "Customer group", placeholder: "Example: Multi-location service businesses" },
                { id: "whoTheyAre", label: "Who are they?", type: "textarea", group: "Customer group", full: true, placeholder: "Example: Companies with 5-50 locations and centralized marketing." },
                { id: "problem", label: "What problem do they have?", type: "textarea", group: "Customer group", full: true, placeholder: "Example: They get leads from many places but struggle to follow up quickly." },
                { id: "whyNow", label: "Why might they buy now?", type: "textarea", group: "Customer group", full: true, placeholder: "Example: Lead costs are rising and conversion rates are falling." },
                { id: "urgency", label: "Urgency evidence", type: "scoreSelect", group: "Step 2: Evidence-Based Fit Check", hint: "Choose based on proof you have, not how attractive the segment sounds.", scoreScale: 3, options: ["Mostly assumption: problem may exist, but no one has confirmed it recently", "Some signal: prospects mention the problem, but timing is inconsistent", "Direct evidence: buyers are actively trying to solve it now"] },
                { id: "abilityToPay", label: "Budget evidence", type: "scoreSelect", group: "Step 2: Evidence-Based Fit Check", hint: "Look for proof that this group can and will spend money to solve the problem.", scoreScale: 3, options: ["Unknown: no clear budget source or current spend", "Likely: budget may exist, but it still needs validation", "Confirmed: they already spend on this problem or a budget owner is clear"] },
                { id: "easeOfAccess", label: "Reach evidence", type: "scoreSelect", group: "Step 2: Evidence-Based Fit Check", hint: "Score whether you can actually find and reach these buyers now.", scoreScale: 3, options: ["No clear path: hard to identify or contact enough buyers", "Possible path: lists, referrals, partners, or communities may work", "Proven path: you already have a repeatable way to reach them"] },
                { id: "proofEvidence", label: "Proof match", type: "scoreSelect", group: "Step 2: Evidence-Based Fit Check", hint: "Score how closely your existing proof matches this group.", scoreScale: 3, options: ["No proof: no relevant customer, case, metric, or example yet", "Adjacent proof: related proof exists, but not for this exact group", "Direct proof: wins, references, or metrics from this exact group"] },
                { id: "implementationFit", label: "Delivery fit", type: "scoreSelect", group: "Step 2: Evidence-Based Fit Check", hint: "Score whether serving this group would be repeatable without heavy custom work.", scoreScale: 3, options: ["Custom or risky: each deal would require heavy adaptation", "Manageable: some adaptation, but delivery is realistic", "Repeatable: the same offer/process can serve this group well"] },
                { id: "tradeoffRisk", label: "Why might this group be a bad first focus?", type: "textarea", group: "Step 2: Evidence-Based Fit Check", full: true, placeholder: "Example: Long procurement cycle, unclear budget owner, too much custom implementation, hard to reach, weak proof." },
                { id: "strategicValue", label: "Strategic value", type: "select", group: "Advanced segment scoring", options: ["", "Low", "Medium", "High"] },
                { id: "salesCycleFit", label: "Sales-cycle fit", type: "select", group: "Advanced segment scoring", options: ["", "Poor", "Okay", "Strong"] },
                { id: "revenuePotential", label: "Revenue potential", type: "select", group: "Advanced segment scoring", options: ["", "Low", "Medium", "High"] },
                { id: "notesEvidence", label: "Notes / evidence", type: "text", group: "Advanced segment scoring", full: true, placeholder: "Add notes or evidence for this score." }
              ]
            }
          ]
        },
        {
          title: "Step 3: Best-Fit Customer Profile",
          hint: "Choose the customer group that is most likely to buy, get value, and be worth serving now.",
          fields: [
            { id: "bestFitCustomerGroup", label: "Best-fit customer group to focus on first", type: "select", dynamicOptionsFrom: "possibleCustomerGroups", options: ["Not sure yet"] },
            { id: "bestFitPrimaryPain", label: "Primary pain", type: "textarea", placeholder: "What problem are they trying to solve?" },
            { id: "bestFitTrigger", label: "Trigger event or timing signal", type: "textarea", placeholder: "What makes them act now?" },
            { id: "bestFitDecisionMaker", label: "Buyer / decision maker", type: "text", placeholder: "Who owns the problem or budget?" },
            { id: "bestFitChampion", label: "Day-to-day user or champion", type: "text", placeholder: "Who feels the problem most often or would advocate for the solution?" },
            { id: "bestFitFirstUseCase", label: "First use case to sell", type: "textarea", placeholder: "What is the easiest first problem to solve for them?" },
            { id: "bestFitEvidence", label: "Why this customer is a good fit", type: "textarea", placeholder: "What evidence suggests they are worth pursuing?" }
          ]
        },
        {
          title: "Step 4: ICP Fit Rules",
          hint: "Define what makes a customer a strong fit, a possible fit, a caution fit, or a bad fit.",
          fields: [
            { id: "icpMustHaveSignals", label: "Must-have fit signals", type: "repeatableList", minItems: 1, addLabel: "Add must-have signal", itemPlaceholder: "Example: urgent pain, budget owner access, active project, clear use case" },
            { id: "icpNiceToHaveSignals", label: "Nice-to-have fit signals", type: "repeatableList", minItems: 1, addLabel: "Add nice-to-have signal", itemPlaceholder: "Example: referral source, expansion potential, public trigger event, strong brand fit" },
            { id: "icpCautionSignals", label: "Caution signals", type: "repeatableList", minItems: 1, addLabel: "Add caution signal", itemPlaceholder: "Example: unclear owner, low urgency, budget freeze, competing priorities, implementation burden" },
            { id: "icpDisqualificationRules", label: "Disqualification rules", type: "repeatableList", minItems: 1, addLabel: "Add disqualification rule", itemPlaceholder: "Example: no budget, too small, too custom, long procurement cycle, poor data quality" }
          ]
        },
        {
          title: "Step 5: Buying Signals",
          hint: "What observable signs suggest this customer may be ready to buy?",
          fields: [
            { id: "buyingTriggersSummary", label: "Top buying triggers", type: "repeatableList", minItems: 1, addLabel: "Add buying trigger", itemPlaceholder: "Example: leadership change, new funding, compliance pressure, cost pressure, vendor dissatisfaction, budget cycle" }
          ]
        },
        {
          title: "Step 6: Who Should We Avoid For Now?",
          hint: "List customer types that are too expensive to serve, too slow to close, too custom, too low-value, too risky, or outside the current focus.",
          fields: [
            { id: "avoidSegments", label: "Who should we avoid for now?", type: "repeatableList", minItems: 1, addLabel: "Add avoid-for-now type", itemPlaceholder: "Example: Prospects without budget or a clear owner" }
          ]
        },
        {
          title: "Advanced ICP Details",
          detailsLabel: "Show advanced ICP details",
          fields: [
            { id: "bestFitRevenueRange", label: "Best-fit revenue range", type: "text", placeholder: "Example: $1M-$20M annual revenue" },
            { id: "bestFitHeadcountRange", label: "Best-fit headcount range", type: "text", placeholder: "Example: 10-100 employees" },
            { id: "bestFitSizeScaleRange", label: "Other size / scale marker", type: "text", placeholder: "Example: 5-50 locations, 500+ monthly leads, 3+ sales reps" },
            { id: "bestFitMaturityStage", label: "Maturity stage", type: "select", options: ["", "Early adopter", "Growth stage", "Mature operator", "Enterprise", "Turnaround", "New market entry", "Digitally transforming", "Other"] },
            { id: "bestFitBuyingStages", label: "Stages most likely to buy", type: "repeatableList", minItems: 1, addLabel: "Add buying stage", itemPlaceholder: "Example: Growth stage, mature operator, digitally transforming" },
            { id: "bestFitCurrentWorkaround", label: "Current workaround", type: "textarea", placeholder: "What are they doing today instead?" },
            { id: "bestFitBudgetCategory", label: "Likely budget source", type: "select", hint: "Where would the buyer likely find budget for this?", options: ["", "Operations", "Sales", "Marketing", "Technology", "Finance", "HR", "Training", "Service", "Product", "Risk", "Capital expense", "Other", "Unknown"] },
            { id: "bestFitBudgetAbility", label: "Budget / ability to pay", type: "textarea", placeholder: "What budget source or buying capacity might exist?" },
            { id: "bestFitLikelySalesMotion", label: "Likely sales motion", type: "select", options: ["", "Self-serve", "Inside sales", "Field sales", "Founder-led", "Partner-led", "Enterprise sales", "Product-led", "Ecommerce", "Services / consultative selling", "Other"] },
            { id: "bestFitExpectedSalesCycle", label: "Expected sales cycle", type: "select", options: ["", "Under 14 days", "15-30 days", "30-60 days", "60-90 days", "Longer than 90 days", "Unknown"] },
            { id: "bestFitImplementationRequirements", label: "Implementation requirements", type: "textarea", placeholder: "What data, access, people, systems, or process changes are required?" },
            { id: "bestFitExpansionValue", label: "Expansion or strategic value", type: "textarea", placeholder: "Could this customer expand, refer others, provide proof, or open a strategic market?" },
            { id: "bestFitDisqualificationSignals", label: "Disqualification signals", type: "textarea", placeholder: "What signs would tell you this customer is not a good fit?" }
          ]
        }
      ],
      legacyTables: [
        {
          id: "bestCustomerProfile",
          title: "Build the single best customer profile",
          rows: ["Segment / company type", "Size / scale range", "Maturity stage", "Primary pain", "Current workaround", "Trigger event or timing signal", "Economic buyer", "Champion / day-to-day owner", "First use case or sales wedge", "Budget / ability to pay", "Likely sales motion", "Expected sales cycle", "Implementation requirements", "Evidence this profile is a good fit", "Expansion or strategic value", "Disqualification signals"],
          columns: [
            { id: "answer", label: "Rough answer", type: "text" }
          ]
        },
        {
          id: "targetPrioritization",
          title: "Target prioritization matrix",
          repeatable: true,
          rowLabel: "Segment",
          minRows: 3,
          scoreMatrix: true,
          columns: [
            { id: "urgency", label: "Urgency", type: "scoreSelect", options: ["Low or optional pain", "Some pain, weak timing", "Clear pain for some buyers", "Strong active urgency", "Urgent, budgeted, time-sensitive"] },
            { id: "abilityToPay", label: "Ability to pay", type: "scoreSelect", options: ["Little or no budget", "Budget unlikely", "Possible budget", "Clear budget owner", "Strong budget and willingness to spend"] },
            { id: "easeOfAccess", label: "Ease of access", type: "scoreSelect", options: ["Hard to identify or reach", "Limited reachable audience", "Some reachable lists or channels", "Clear access path", "Easy to reach through proven channels"] },
            { id: "proofEvidence", label: "Proof / customer evidence", type: "scoreSelect", options: ["No evidence yet", "Weak anecdotal evidence", "Some relevant conversations", "Customer or pipeline evidence", "Strong wins, proof, or references"] },
            { id: "implementationFit", label: "Implementation fit", type: "scoreSelect", options: ["Too custom or risky", "Heavy implementation burden", "Manageable with caveats", "Good operational fit", "Very easy to deliver repeatedly"] },
            { id: "strategicValue", label: "Strategic value", type: "scoreSelect", options: ["Low strategic value", "Limited learning or reference value", "Moderate strategic value", "Strong learning or reference value", "High expansion, category, or reference value"] },
            { id: "salesCycle", label: "Sales-cycle fit", type: "scoreSelect", options: ["Very long or complex", "Long with many blockers", "Moderate cycle", "Short enough to test soon", "Fast, direct, low-friction cycle"] },
            { id: "revenuePotential", label: "Revenue potential", type: "scoreSelect", options: ["Low expected revenue", "Small revenue potential", "Moderate deal or volume potential", "Strong deal or volume potential", "Very strong revenue and expansion potential"] },
            { id: "notes", label: "Notes / evidence", type: "text" }
          ]
        }
      ]
    },
    {
      id: "goals",
      title: "Revenue Goals, Strategy, and Constraints",
      helpBlocks: HELP_BLOCKS.goals,
      fields: [
        { id: "businessPriority", label: "What is the single most important need for the company right now?", type: "select", options: ["Customer validation", "Lead flow", "Revenue", "Strategic reference", "Retention", "Expansion", "Category awareness", "Other"] },
        { id: "goal30", label: "Primary GTM goal for the next 30 days", type: "select", options: ["Leadflow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal60", label: "Primary GTM goal for the next 60 days", type: "select", options: ["Leadflow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal90", label: "Primary GTM goal for the next 90 days", type: "select", options: ["Leadflow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal90RevenueTarget", label: "90-day revenue target", type: "money", required: true, showWhen: { field: "goal90", value: "Revenue" }, placeholder: "Example: 100000", hint: "Required when Revenue is the 90-day goal. Enter the revenue amount you want to create or close in the next 90 days." },
        { id: "clientAttribute", label: "Most important attribute for new clients", type: "select", options: ["Strong cash position", "Pilot participation", "Testimonials", "Inform roadmap", "Provide referrals / introductions", "Ability to expand rapidly", "Other"] },
        { id: "supportedSalesCycle", label: "Sales cycle the company can realistically support", type: "select", options: ["Under 14 days", "15-30 days", "30-60 days", "60-90 days", "Longer"] },
        { id: "capacityNotes", label: "Are there any customers you should avoid because they require more support, implementation, or customization than your team can currently handle?", type: "textarea", full: true, placeholder: "Example: We avoid enterprise customers requiring custom integrations because our team is small." },
        { id: "lowYieldActivity", label: "Which GTM, sales, or marketing activities consume significant time but produce little pipeline, revenue, or learning?", type: "repeatableList", minItems: 1, addLabel: "Add activity", itemPlaceholder: "Examples: trade shows, cold email campaigns, social posting, manual reporting" }
      ],
      tables: [
        {
          id: "constraintLevels",
          title: "Constraint Scan",
          hint: "Quickly rate where execution may be constrained. Any medium or high constraint should become a blocker below if it could affect the 30, 60, or 90-day success focus.",
          rows: ["Budget", "Delivery / implementation", "Product", "Resources"],
          columns: [
            { id: "level", label: "Constraint level", type: "select", options: ["", "Low", "Medium", "High"] },
            { id: "why", label: "Why?", type: "text", placeholder: "Briefly explain the constraint." }
          ]
        },
        {
          id: "successLooksLike",
          title: "What Success Looks Like",
          hint: "Define one clear result for each timeframe. The goal is not to create a full project plan, just to say what needs to be true by 30, 60, and 90 days.",
          layout: "cards",
          summaryType: "successStatement",
          rows: [
            { id: "30-days", label: "30-Day Success" },
            { id: "60-days", label: "60-Day Success" },
            { id: "90-days", label: "90-Day Success" }
          ],
          columns: [
            { id: "primaryFocus", label: "Primary focus", type: "text", group: "Focus", placeholder: "Auto-filled from the selected 30/60/90 goal when blank." },
            { id: "needTo", label: "By this date, we need to...", type: "textarea", group: "Success definition", full: true, placeholderByRow: { "30-days": "Example: Confirm the best-fit customer, complete 10 buyer conversations, and choose one primary channel to test.", "60-days": "Example: Launch one focused GTM test and create the minimum sales assets needed to support it.", "90-days": "Example: Review results, decide what to scale or stop, and document the repeatable GTM motion." } },
            { id: "measure", label: "How will we measure success?", type: "select", group: "Success definition", options: ["", "Customer interviews completed", "Qualified leads created", "Demos / calls booked", "Pipeline created", "Revenue closed", "New customers", "Expansion opportunities", "Proof asset created", "Website conversion improved", "Sales process completed", "System / process implemented", "Other"] },
            { id: "target", label: "What result would count as success?", type: "text", group: "Success definition", placeholder: "Example: 10 customer interviews completed and 2 clear buying triggers identified." },
            { id: "owner", label: "Who owns this?", type: "text", group: "Ownership", placeholder: "Example: Founder, Sales Lead, Marketing Lead, RevOps" },
            { id: "verification", label: "How will we verify it?", type: "text", group: "Ownership", placeholder: "Example: CRM report, call notes, signed customer, dashboard, pipeline report, case study draft." }
          ]
        },
        {
          id: "topBlockers",
          title: "Top Blockers to Resolve",
          hint: "List the top 1-3 blockers that could prevent the 30, 60, or 90-day success focus from working. Focus on blockers that need a decision, owner, or next action.",
          layout: "cards",
          summaryType: "blockerStatement",
          repeatable: true,
          rowLabel: "Blocker",
          minRows: 1,
          maxRows: 3,
          addLabel: "Add another blocker",
          columns: [
            { id: "blockerType", label: "Blocker type", type: "select", group: "Blocker", options: ["", "Focus", "ICP clarity", "Messaging", "Proof", "Budget", "Team capacity", "Sales process", "Channel access", "Data quality", "Product readiness", "Implementation capacity", "Technology / systems", "Other"] },
            { id: "blocker", label: "Blocker description", type: "textarea", group: "Blocker", full: true, placeholder: "Describe how this blocker is slowing growth." },
            { id: "successFocus", label: "Which success focus does this affect?", type: "select", group: "Blocker", options: ["", "30-Day Success", "60-Day Success", "90-Day Success", "All timeframes", "Not sure"] },
            { id: "severity", label: "How serious is it?", type: "select", group: "Blocker", options: ["", "High - could stop the plan", "Medium - could slow the plan", "Low - manageable"] },
            { id: "whyItMatters", label: "Why does this matter?", type: "text", group: "Resolution", placeholder: "Example: Without proof, the team may spend on outreach before the offer is validated." },
            { id: "mustBeTrue", label: "What must be true to move forward?", type: "textarea", group: "Resolution", full: true, placeholder: "Example: Complete 5 buyer interviews and identify 2 proof points we can use in sales conversations." },
            { id: "nextAction", label: "Next action", type: "text", group: "Resolution", placeholder: "Example: Schedule interviews with current customers and recent prospects." },
            { id: "owner", label: "Owner", type: "text", group: "Ownership", placeholder: "Example: Founder, Sales Lead, Marketing Lead, Product Lead" },
            { id: "timeframe", label: "Due date or timeframe", type: "select", group: "Ownership", options: ["", "This week", "30 days", "60 days", "90 days", "Later", "Not sure"] }
          ]
        }
      ],
      legacyTables: [
        {
          id: "successPlan",
          title: "30/60/90 Success Plan",
          rows: ["30 days", "60 days", "90 days"],
          columns: [
            { id: "primaryOutcome", label: "Primary outcome", type: "text" },
            { id: "successMetric", label: "Success metric", type: "text" },
            { id: "target", label: "Target", type: "text" },
            { id: "owner", label: "Owner", type: "text" },
            { id: "evidenceNeeded", label: "Evidence needed", type: "text" }
          ]
        },
        {
          id: "gtmConstraintTracker",
          title: "GTM Constraint Tracker",
          repeatable: true,
          rowLabel: "Constraint",
          minRows: 3,
          columns: [
            { id: "constraint", label: "Constraint", type: "select", options: ["", "Focus", "ICP clarity", "Messaging", "Proof", "Budget", "Team capacity", "Sales process", "Channel access", "Data quality", "Product readiness", "Implementation capacity", "Technology / systems", "Other"] },
            { id: "severity", label: "Severity", type: "select", options: ["", "High", "Medium", "Low"] },
            { id: "whyItMatters", label: "Why it matters", type: "text" },
            { id: "mustBeTrue", label: "What must be true", type: "text" },
            { id: "owner", label: "Owner", type: "text" },
            { id: "nextAction", label: "Next action", type: "text" }
          ]
        }
      ]
    },
    {
      id: "traction",
      title: "Customer Evidence and Traction",
      description: "Capture the customer evidence, proof candidates, expansion opportunities, and delivery lessons that support the GTM plan.",
      helpBlocks: HELP_BLOCKS.traction,
      content: [
        {
          title: "Proven Customer Outcomes",
          fields: [
            { id: "provenCustomerOutcomes", label: "Which proof assets could you realistically share with a prospect?", type: "multiSelectDropdown", hint: "Select proof you could actually use in a sales conversation, such as a case study, testimonial, ROI analysis, pilot result, customer reference, usage data, referral, review, or measurable result.", optionsFromMultiselect: "usageProof", options: ["Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Improve adoption", "Improve retention", "Improve customer satisfaction", "Improve productivity", "Reduce implementation burden", "Other measurable outcome"] }
          ]
        },
        {
          tables: [
            {
              id: "proofReferenceCandidates",
              title: "Proof and Reference Candidates",
              hint: "List customers who could support a case study, testimonial, referral, reference call, review, logo, quote, or measurable proof point.",
              layout: "cards",
              repeatable: true,
              rowLabel: "Proof Candidate",
              minRows: 1,
              maxRows: 10,
              addLabel: "Add proof candidate",
              columns: [
                { id: "customerName", label: "Customer / account name", type: "text", placeholder: "Example: ABC Company" },
                { id: "proofTypes", label: "What type of proof could they provide?", type: "multiSelectDropdown", options: ["Case study", "Testimonial", "Referral introduction", "Sales reference", "Public review", "Logo permission", "Quote", "Measurable result", "Before / after story", "Pilot result", "Other"] },
                { id: "outcomeProven", label: "Which outcome do they prove?", type: "select", optionsFromMultiselect: "provenCustomerOutcomes", options: ["Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Improve adoption", "Improve retention", "Improve customer satisfaction", "Improve productivity", "Reduce implementation burden", "Other measurable outcome"] },
                { id: "resultStory", label: "What result or story can they support?", type: "textarea", full: true, placeholder: "Example: Reduced manual reporting time by 8 hours per week." },
                { id: "permissionStatus", label: "Permission status", type: "select", options: ["", "Not asked yet", "Likely yes", "Confirmed yes", "Cannot use publicly", "Internal reference only", "Not sure"] },
                { id: "proofStrength", label: "Strength of proof", type: "select", options: ["", "Weak / anecdotal", "Good customer story", "Measured result", "Strong public proof", "Repeatable across customers"] },
                { id: "ownerNextAction", label: "Owner / next action", type: "text", placeholder: "Example: Sarah to ask for quote by Friday." }
              ]
            },
            {
              id: "customerEvidenceInventory",
              title: "Customer Evidence Inventory",
              hint: "List the customers or active users that best show product-market fit, proof, expansion potential, or referral value.",
              layout: "cards",
              repeatable: true,
              rowLabel: "Customer",
              minRows: 1,
              maxRows: 10,
              addLabel: "Add customer evidence",
              columns: [
                { id: "customerName", label: "Customer / active user", type: "text", placeholder: "Example: ABC Company" },
                { id: "whyGoodFit", label: "Why are they a good fit?", type: "textarea", full: true, placeholder: "Example: Matches our target segment, had urgent pain, and bought quickly." },
                { id: "outcomeAchieved", label: "Outcome achieved", type: "select", optionsFromMultiselect: "provenCustomerOutcomes", options: ["Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Improve adoption", "Improve retention", "Improve customer satisfaction", "Improve productivity", "Reduce implementation burden", "Other measurable outcome"] },
                { id: "proofOpportunity", label: "Proof opportunity", type: "multiSelectDropdown", options: ["Case study", "Testimonial", "Referral", "Reference call", "Review", "Logo", "Quote", "Measured result", "Expansion story", "None yet", "Other"] },
                { id: "expansionPotential", label: "Expansion potential", type: "select", options: ["", "Yes", "Maybe", "No", "Unknown"] },
                { id: "notes", label: "Notes", type: "textarea", full: true, placeholder: "Add anything useful about proof, fit, risk, or next steps." }
              ]
            },
            {
              id: "expansionOpportunities",
              title: "Expansion Opportunities",
              hint: "List current customers or accounts that could buy more, expand usage, renew, refer, or introduce you to a similar buyer.",
              layout: "cards",
              repeatable: true,
              rowLabel: "Expansion Opportunity",
              minRows: 1,
              maxRows: 10,
              addLabel: "Add expansion opportunity",
              columns: [
                { id: "customerName", label: "Customer / account", type: "text", placeholder: "Example: ABC Company" },
                { id: "expansionType", label: "Expansion type", type: "select", options: ["", "Upsell", "Cross-sell", "Renewal", "Referral", "Additional location / team", "Strategic introduction", "Usage expansion", "Other"] },
                { id: "opportunity", label: "Expansion opportunity", type: "textarea", full: true, placeholder: "Example: Add two more locations or introduce us to a sister company." },
                { id: "estimatedValue", label: "Estimated value or impact", type: "text", placeholder: "Example: $25k ARR, 3 referrals, 10 more users" },
                { id: "timing", label: "Timing", type: "select", options: ["", "30 days", "60 days", "90 days", "Later", "Unknown"] },
                { id: "owner", label: "Owner", type: "text" },
                { id: "nextAction", label: "Next action", type: "text", placeholder: "Example: Schedule expansion conversation." }
              ]
            },
            {
              id: "deliveryFitRisks",
              title: "Delivery Fit Risks",
              hint: "List customers or opportunities that were difficult to serve. These examples help identify bad-fit signals, implementation risks, and disqualification rules.",
              layout: "cards",
              repeatable: true,
              rowLabel: "Delivery Fit Risk",
              minRows: 1,
              maxRows: 10,
              addLabel: "Add delivery risk",
              columns: [
                { id: "customerOrOpportunity", label: "Customer / opportunity", type: "text", placeholder: "Example: ABC Company or Enterprise prospect" },
                { id: "whatMadeHard", label: "What made it hard?", type: "textarea", full: true, placeholder: "Example: Poor data quality, unclear owner, custom workflow, heavy support needs." },
                { id: "burdenType", label: "Burden type", type: "multiSelectDropdown", options: ["Data quality", "Customization", "Onboarding time", "Unclear owner", "Support load", "Technical complexity", "Low adoption", "Low margin", "Long approval cycle", "Integration burden", "Other"] },
                { id: "shouldBecomeRule", label: "Should this become a caution or disqualification rule?", type: "select", options: ["", "Caution signal", "Disqualification rule", "Not sure", "No"] },
                { id: "lessonNextAction", label: "Lesson / next action", type: "textarea", full: true, placeholder: "Example: Require clean data export before proposal, or disqualify customers without an internal owner." }
              ]
            }
          ]
        },
        {
          title: "Customer Success Signals",
          hint: "Optional: rate where current customers are strong or weak. These signals can reveal proof strengths, retention risk, and delivery constraints.",
          detailsLabel: "Show customer success signal details",
          tables: [
            {
              id: "customerPerformance",
              title: "Customer Success Signals",
              rows: ["Onboarding", "Data quality", "Cost", "Usage", "Product gaps", "Executive ownership", "Timing", "Support"],
              columns: [
                { id: "rank", label: "Performance rank", type: "select", options: ["", "1", "2", "3", "4", "5"] }
              ]
            }
          ]
        }
      ],
      legacyTables: [
        {
          id: "currentCustomerFit",
          title: "Top 5 Current customers or active users",
          rows: ["Customer 1", "Customer 2", "Customer 3", "Customer 4", "Customer 5"],
          columns: [
            { id: "customer", label: "Customer or active user", type: "text" },
            { id: "whyFit", label: "Why each was a good fit", type: "text" }
          ]
        },
        {
          id: "opportunityInventory",
          title: "List 5-10 important revenue opportunities from your current pipeline",
          repeatable: true,
          rowLabel: "Opportunity",
          minRows: 5,
          columns: [
            { id: "type", label: "Opportunity type", type: "select", options: ["", "New client", "Expansion", "Renewal", "Referral", "Partner", "Other"] },
            { id: "need", label: "Use case / pain", type: "text" },
            { id: "source", label: "Source / lead type", type: "text" },
            { id: "status", label: "Status", type: "select", options: ["", "Active Sales Cycle", "Stalled Sales Cycle", "Lost"] },
            { id: "value", label: "Value / deal size", type: "money" },
            { id: "next", label: "Next action", type: "text" },
            { id: "owner", label: "Owner", type: "text" }
          ]
        }
      ],
      legacyFields: [
        { id: "caseStudyPotential", label: "Case study / testimonial / referral potential", type: "repeatableList", minItems: 1, addLabel: "Add proof opportunity", itemPlaceholder: "Enter one customer or proof opportunity" },
        { id: "proofCustomers", label: "Best proof / referral candidates", type: "repeatableList", minItems: 1, addLabel: "Add customer", itemPlaceholder: "Enter one customer or account" },
        { id: "expansionPotential", label: "Expansion potential in the next 90 days", type: "repeatableList", minItems: 1, addLabel: "Add expansion opportunity", itemPlaceholder: "Enter one expansion opportunity" },
        { id: "implementationBurden", label: "Customers or opportunities with high implementation burden", type: "repeatableList", minItems: 1, addLabel: "Add burden example", itemPlaceholder: "Enter one customer/opportunity and why it was hard" },
        { id: "stalledOpportunities", label: "Stalled opportunities and reasons", type: "repeatableList", minItems: 1, addLabel: "Add stalled opportunity", itemPlaceholder: "Enter one stalled opportunity and reason" }
      ]
    },
    {
      id: "icp",
      title: "ICP Hypothesis and Market Segmentation",
      hidden: true,
      deprecated: true,
      fields: [
        { id: "verticalFit", label: "Industries with strongest urgency and ability to pay", type: "repeatableList", minItems: 1, addLabel: "Add industry", itemPlaceholder: "Enter one industry or vertical" },
        { id: "useCaseWedge", label: "Initial use-case wedge", type: "textarea", hint: "The most common solution that opens up a broader conversation. Examples: unhappy with current solution, opportunity to lower costs, urgent growth initiative, compliance pressure." },
        { id: "budgetCategory", label: "Buyer budget category", type: "select", options: ["Operations", "Sales", "Marketing", "Technology", "Finance", "HR", "Training", "Service", "Product", "Risk", "Capital expense", "Other"] },
        { id: "badFitSignals", label: "Bad-fit signals", type: "repeatableList", minItems: 1, addLabel: "Add bad-fit signal", itemPlaceholder: "Example: no budget, too small, too custom, long procurement cycle, poor data quality, no executive sponsor" },
        { id: "positiveMustHave", label: "Positive ICP - must have", type: "repeatableList", minItems: 1, addLabel: "Add must-have", itemPlaceholder: "Example: urgent pain, budget owner access, active project, strong cash position, clear use case" },
        { id: "positiveNiceToHave", label: "Positive ICP - nice to have", type: "repeatableList", minItems: 1, addLabel: "Add nice-to-have", itemPlaceholder: "Example: referral source, expansion potential, public trigger event, strong brand fit" },
        { id: "negativeCaution", label: "Negative ICP - caution", type: "repeatableList", minItems: 1, addLabel: "Add caution", itemPlaceholder: "Example: unclear owner, low urgency, budget freeze, implementation burden, competing priorities" },
        { id: "disqualificationRule", label: "Do you have any clear Disqualification rules? If so, list them.", type: "textarea" }
      ],
      tables: [
        {
          id: "sizeFit",
          title: "Best-fit customer size / scale",
          rows: ["Best-fit profile"],
          columns: [
            { id: "revenue", label: "Revenue $", type: "money" },
            { id: "headcount", label: "Headcount #", type: "text" },
            { id: "otherScale", label: "Other scale marker", type: "text" }
          ]
        },
        {
          id: "stageFit",
          title: "Which stage(s) of prospective client is most likely to buy?",
          rows: ["1", "2", "3"],
          columns: [
            { id: "stage", label: "Stage", type: "select", options: ["", "Early adopter", "Growth stage", "Mature operator", "Enterprise", "Turnaround", "New market entry", "Digitally transforming", "Other"] }
          ]
        },
        {
          id: "buyerRoleMap",
          title: "Buyer Role Map",
          repeatable: true,
          rowLabel: "Role",
          minRows: 5,
          columns: [
            { id: "buyerRole", label: "Buyer role", type: "select", options: ["", "C-level executive", "Founder / owner", "Department head", "Operations leader", "Finance leader", "Sales leader", "Marketing leader", "Technology / data leader", "Procurement", "Implementation owner", "Individual user", "Influencer", "Blocker", "Other"] },
            { id: "playsRole", label: "Role each plays", type: "select", options: ["", "Feels pain", "Owns budget", "Approves purchase", "Uses solution", "Implements solution", "Influences decision", "Blocks decision", "Signs contract", "Measures success"] }
          ]
        },
        {
          id: "triggerEvents",
          title: "Prospect Buy Triggers",
          rows: ["1", "2", "3"],
          columns: [
            { id: "trigger", label: "Trigger", type: "select", options: ["", "Growth", "Leadership change", "New funding", "Compliance pressure", "Customer complaints", "Cost pressure", "New initiative", "Competitive threat", "System change", "Event", "Budget cycle", "Vendor dissatisfaction", "Expansion initiative", "Other"] }
          ]
        }
      ]
    },
    {
      id: "personas",
      title: "Buyer Personas and Buying Committee",
      description: "Map the people involved in the buying decision, what each one cares about, and what they need to believe before the deal can move forward.",
      helpBlocks: HELP_BLOCKS.personas,
      content: [
        {
          title: "Buying Decision Overview",
          hint: "Start with how the buying decision usually happens before defining each persona.",
          fields: [
            { id: "buyingSituation", label: "Buying situation", type: "select", options: ["", "Founder / owner decision", "Department-led purchase", "Executive-sponsored initiative", "Cross-functional buying committee", "Procurement-led purchase", "Technical / security review required", "User-led adoption before purchase", "Not sure yet"] },
            { id: "conversationStarter", label: "Who usually starts the conversation?", type: "text", placeholder: "Example: Founder, VP Sales, Operations Lead, end user, referral partner" },
            { id: "budgetOwner", label: "Who owns the budget?", type: "text", placeholder: "Example: CEO, COO, CFO, VP Sales, department head" },
            { id: "painOwner", label: "Who feels the pain most often?", type: "text", placeholder: "Example: Sales reps, operations team, marketing manager, customer success team" },
            { id: "dealBlocker", label: "Who can block the deal?", type: "text", placeholder: "Example: CFO, procurement, IT/security, implementation owner, department head" },
            { id: "peopleInvolved", label: "How many people are typically involved?", type: "select", options: ["", "1", "2-3", "4-6", "7+", "Not sure yet"] },
            { id: "reviewRequirements", label: "Is procurement, security, legal, or finance review involved?", type: "multiSelectDropdown", options: ["Procurement", "Security", "Legal", "Finance", "IT / technical review", "Data privacy", "Compliance", "None", "Not sure yet", "Other"] }
          ]
        },
        {
          tables: [
            {
              id: "buyerRoleCards",
              title: "Buying Committee Role Cards",
              hint: "For each role, define whether they are involved, what they care about, what they need to believe, and what proof or message will move them forward.",
              layout: "cards",
              rowLabel: "Buyer Role",
              rows: [
                { id: "economic-buyer", label: "Economic Buyer" },
                { id: "executive-sponsor", label: "Executive Sponsor" },
                { id: "champion", label: "Champion" },
                { id: "day-to-day-user", label: "Day-to-Day User" },
                { id: "implementation-owner", label: "Implementation Owner" },
                { id: "technical-security-reviewer", label: "Technical / Security Reviewer" },
                { id: "procurement-finance", label: "Procurement / Finance" },
                { id: "likely-blocker", label: "Likely Blocker" }
              ],
              columns: [
                { id: "involved", label: "Is this role involved?", type: "select", group: "Role", options: ["", "Yes", "No", "Not sure"] },
                { id: "commonTitles", label: "Common titles", type: "text", group: "Role", placeholder: "Example: CEO, Founder, COO, CFO, VP Sales" },
                { id: "roleInDecision", label: "Role in the decision", type: "multiSelectDropdown", group: "Role", options: ["Owns budget", "Approves purchase", "Feels pain", "Sponsors initiative", "Uses solution", "Implements solution", "Reviews technical / security risk", "Reviews financial / procurement risk", "Influences decision", "Blocks decision", "Signs contract", "Measures success", "Other"] },
                { id: "caresAbout", label: "What do they care about most?", type: "multiSelectDropdown", group: "Motivation", optionsFromMultiselect: "usageProof", options: ["Revenue growth", "Cost reduction", "Time savings", "Risk reduction", "Productivity", "Visibility / reporting", "Customer experience", "Adoption", "Retention", "Speed", "Compliance", "Team capacity", "Quality", "Implementation ease", "Other"] },
                { id: "painPriority", label: "Main pain or priority", type: "textarea", group: "Motivation", full: true, placeholder: "What problem matters most to this person?" },
                { id: "needsToBelieve", label: "What do they need to believe before moving forward?", type: "textarea", group: "Belief and risk", full: true, placeholder: "Example: The ROI is clear, implementation risk is low, and the team can adopt it quickly." },
                { id: "likelyObjection", label: "Most likely objection or concern", type: "select", group: "Belief and risk", optionsFromMultiselect: "objections", options: ["", "Price", "Timing", "ROI", "Trust", "Risk", "Data quality", "Implementation burden", "Internal ownership", "Competing priorities", "Security / compliance", "Switching cost", "Adoption", "Procurement friction", "Not sure", "Other"] },
                { id: "objectionDetail", label: "Objection detail", type: "text", group: "Belief and risk", placeholder: "Example: They may worry implementation will take too much team time." },
                { id: "proofNeeded", label: "Proof they need", type: "multiSelectDropdown", group: "Enablement", options: ["Case study", "Testimonial", "ROI calculator", "Reference call", "Demo", "Pilot result", "Security / privacy documentation", "Implementation plan", "Customer quote", "Measured result", "Before / after story", "Pricing / business case", "Product walkthrough", "Technical documentation", "Other"] },
                { id: "message", label: "Message that resonates", type: "textarea", group: "Enablement", full: true, placeholder: "What should we say to this person?" },
                { id: "discoveryQuestions", label: "Discovery questions to ask", type: "textarea", group: "Enablement", full: true, placeholder: "Example: What happens if this problem is not solved in the next 90 days?" },
                { id: "salesAssetsNeeded", label: "Sales asset needed", type: "multiSelectDropdown", group: "Enablement", optionsFromMultiselect: "salesAssets", options: ["One-page overview", "ROI calculator", "Case study", "Demo script", "Pricing sheet", "Security FAQ", "Implementation plan", "Business case", "Reference list", "Objection handling guide", "Technical documentation", "Procurement packet", "Other"] }
              ]
            },
            {
              id: "personaPriority",
              title: "Persona Priority",
              hint: "Identify which personas matter most for the current GTM motion.",
              rows: [
                { id: "economic-buyer", label: "Economic Buyer" },
                { id: "executive-sponsor", label: "Executive Sponsor" },
                { id: "champion", label: "Champion" },
                { id: "day-to-day-user", label: "Day-to-Day User" },
                { id: "implementation-owner", label: "Implementation Owner" },
                { id: "technical-security-reviewer", label: "Technical / Security Reviewer" },
                { id: "procurement-finance", label: "Procurement / Finance" },
                { id: "likely-blocker", label: "Likely Blocker" }
              ],
              columns: [
                { id: "importance", label: "Importance", type: "select", options: ["", "High", "Medium", "Low", "Not involved", "Not sure"] },
                { id: "confidence", label: "Confidence", type: "select", options: ["", "High", "Medium", "Low"] },
                { id: "why", label: "Why?", type: "text" }
              ]
            }
          ]
        },
        {
          title: "Buying Committee Risks",
          hint: "Identify where deals may stall because of role confusion, missing proof, procurement friction, or unaddressed blockers.",
          fields: [
            { id: "dealStallRisks", label: "Where do deals usually stall?", type: "multiSelectDropdown", options: ["No clear economic buyer", "Champion lacks influence", "Executive sponsor not engaged", "Technical / security review slows deal", "Procurement delays purchase", "Finance questions ROI", "Implementation owner sees too much work", "End users resist adoption", "Likely blocker has not been addressed", "No clear next step", "Proof is not strong enough", "Not sure yet", "Other"] },
            { id: "mostImportantPersonaRisk", label: "Most important persona risk", type: "textarea", placeholder: "Example: We often have a user champion, but we do not reach the budget owner early enough." },
            { id: "salesProcessChangeNeeded", label: "What needs to change in the sales process?", type: "textarea", placeholder: "Example: Add economic-buyer discovery by the second call and create an ROI proof asset." },
            { id: "personaRiskSeverity", label: "Persona risk severity", type: "select", options: ["", "High - likely to stall deals", "Medium - may slow deals", "Low - manageable", "Not sure"] }
          ]
        }
      ],
      legacyTables: [
        {
          id: "buyingCommittee",
          title: "Buying committee",
          rows: ["Economic buyer", "Executive sponsor", "Champion", "Day-to-day user", "Implementation owner", "Technical / security reviewer", "Procurement / finance", "Likely blocker"],
          columns: [
            { id: "titles", label: "Target title(s)", type: "text" },
            { id: "pain", label: "Pain / priority", type: "text" },
            { id: "message", label: "Message that resonates", type: "text" },
            { id: "questions", label: "Questions to ask", type: "text" }
          ]
        }
      ],
      legacyFields: [
        { id: "execValueDrivers", label: "Executive / owner / CEO value drivers", type: "select", optionsFromMultiselect: "usageProof", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] },
        { id: "operatingLeaderDrivers", label: "Operating leader value drivers", type: "select", optionsFromMultiselect: "usageProof", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] },
        { id: "salesMarketingDrivers", label: "Sales or marketing leader value drivers", type: "select", optionsFromMultiselect: "usageProof", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] },
        { id: "financeDrivers", label: "Finance leader value drivers", type: "select", optionsFromMultiselect: "usageProof", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] },
        { id: "techDataDrivers", label: "Technology / data leader concerns", type: "select", optionsFromMultiselect: "usageProof", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] },
        { id: "endUserDrivers", label: "End user / front-line concerns", type: "select", optionsFromMultiselect: "usageProof", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] }
      ]
    },
    {
      id: "offer",
      title: "Offer Readiness: Problem, Value, Price, and Proof",
      description: "Assess the offers, packages, pilots, or services that may be part of the GTM motion. Each offer can be reviewed at a summary level or with a full readiness analysis.",
      helpBlocks: HELP_BLOCKS.offer,
      content: [
        {
          title: "Offer Portfolio Snapshot",
          hint: "List the offers, packages, pilots, products, or services that may be part of the GTM motion. You can choose which ones to assess in detail.",
          tables: [
            {
              id: "offerPortfolio",
              title: "Offers",
              layout: "cards",
              repeatable: true,
              rowLabel: "Offer",
              minRows: 1,
              maxRows: 50,
              addLabel: "Add another offer",
              columns: [
                { id: "offerName", label: "Offer name", type: "text", placeholder: "Example: Paid diagnostic workshop, core platform, implementation package" },
                { id: "offerRole", label: "Offer role", type: "select", options: ["", "Entry offer", "Core offer", "Expansion offer", "Pilot / proof of concept", "Diagnostic", "Retention / renewal offer", "Add-on", "Consulting / service package", "Managed service", "Product / platform", "Other"] },
                { id: "targetCustomerGroup", label: "Customer group this offer is for", type: "select", dynamicOptionsFrom: "possibleCustomerGroups", options: ["Create a new customer group for this offer", "Not sure yet"] },
                { id: "newOfferCustomerGroup", label: "New customer group for this offer", type: "text", placeholder: "Example: Early-stage SaaS companies with founder-led sales" },
                { id: "primaryBuyer", label: "Primary buyer", type: "text", placeholder: "Example: Founder, COO, VP Sales, Operations Lead, Finance Leader" },
                { id: "offerPriority", label: "Priority", type: "select", options: ["", "Primary GTM focus", "Secondary", "Future", "Not sure"] },
                { id: "assessmentDepth", label: "Assessment depth", type: "select", hint: "Choose Full readiness analysis for offers you want scored and reviewed in detail.", options: ["", "Summary only", "Full readiness analysis"] }
              ]
            }
          ]
        },
        {
          title: "Primary GTM Offer",
          hint: "The primary offer will drive the main 90-day GTM plan. Other offers can still be summarized or assessed.",
          fields: [
            { id: "primaryGtmOffer", label: "Which offer should be the primary GTM focus for the next 90 days?", type: "select", dynamicOptionsFrom: "offerPortfolio", options: [""] }
          ]
        }
      ]
    },
    {
      id: "signals",
      title: "Buying Triggers and Targeting Signals",
      description: "Define how to identify the right prospects, spot buying timing, prioritize outreach, and avoid poor-fit opportunities across customer groups, offers, and GTM motions.",
      helpBlocks: HELP_BLOCKS.signals,
      content: [
        {
          title: "Shared Signal Infrastructure",
          hint: "Define the shared data sources, owners, cadence, and company-wide disqualification signals that support all targeting strategys.",
          fields: [
            { id: "signalDataSources", label: "Which data sources can help identify signals?", type: "multiSelectDropdown", options: ["CRM", "LinkedIn", "Website analytics", "Intent data", "Industry publications", "Directories", "Events", "Customer interviews", "Support data", "Customer success notes", "Partner lists", "Enrichment tools", "Review sites", "Company websites", "Job postings", "News", "Product usage data", "Other"] },
            { id: "signalOperatingOwner", label: "Who owns signal monitoring?", type: "text", placeholder: "Example: Founder, Sales Lead, Marketing Lead, RevOps" },
            { id: "signalMonitoringCadence", label: "How often will signals be reviewed?", type: "select", options: ["", "Daily", "Weekly", "Biweekly", "Monthly", "Campaign-based", "Not defined yet"] },
            { id: "signalRoutingOwner", label: "Who decides what happens when a high-priority signal appears?", type: "text", placeholder: "Example: Sales Lead, Founder, Marketing, RevOps" },
            { id: "signalInfrastructureNotes", label: "Signal infrastructure notes", type: "textarea", placeholder: "Example: Signals are currently tracked manually in spreadsheets and CRM notes." }
          ],
          tables: [
            {
              id: "signalDataSourceReadiness",
              title: "Data Sources and Availability",
              layout: "cards",
              repeatable: true,
              rowLabel: "Data Source",
              minRows: 1,
              maxRows: 50,
              addLabel: "Add data source detail",
              columns: [
                { id: "source", label: "Data source", type: "select", optionsFromMultiselect: "signalDataSources", options: ["CRM", "LinkedIn", "Website analytics", "Intent data", "Industry publications", "Directories", "Events", "Customer interviews", "Support data", "Customer success notes", "Partner lists", "Enrichment tools", "Review sites", "Company websites", "Job postings", "News", "Product usage data", "Other"] },
                { id: "availableToday", label: "Available today?", type: "select", options: ["", "Yes", "No", "Partial", "Not sure"] },
                { id: "owner", label: "Owner", type: "text", placeholder: "Example: Founder, Sales Lead, Marketing, RevOps" },
                { id: "reliability", label: "Reliability", type: "select", options: ["", "High", "Medium", "Low", "Unknown"] },
                { id: "collectionMethod", label: "Manual or automated?", type: "select", options: ["", "Manual", "Automated", "Partially automated", "Not sure"] },
                { id: "notesGaps", label: "Notes / gaps", type: "textarea", placeholder: "Example: CRM exists but data quality is inconsistent." }
              ]
            },
            {
              id: "globalNegativeSignals",
              title: "Global Negative Signals",
              layout: "cards",
              repeatable: true,
              rowLabel: "Global Negative Signal",
              minRows: 1,
              maxRows: 20,
              addLabel: "Add global negative signal",
              columns: [
                { id: "signal", label: "Negative signal", type: "select", options: ["", "No clear budget owner", "Company too small", "Too custom", "Poor data quality", "Heavy implementation burden", "Long procurement cycle", "Low urgency", "Wrong geography", "Unsupported tech stack", "No executive sponsor", "Low strategic value", "Low margin", "Other"] },
                { id: "action", label: "Default action", type: "select", options: ["", "Reduce score", "Disqualify", "Needs review", "Nurture only", "Ask qualification question"] },
                { id: "whyItMatters", label: "Why it matters", type: "textarea" }
              ]
            }
          ]
        },
        {
          title: "",
          hint: "A targeting strategy combines customer group, offer, buyer, and trigger event to identify who should be contacted.",
          tables: [
            {
              id: "signalPlayPortfolio",
              title: "Targeting Strategy Portfolio",
              layout: "cards",
              repeatable: true,
              rowLabel: "Targeting Strategy",
              minRows: 1,
              maxRows: 50,
              addLabel: "Add targeting strategy",
              columns: [
                { id: "playName", label: "Targeting strategy name", type: "text", placeholder: "Example: New prospect diagnostic play, customer expansion play, enterprise implementation qualification play" },
                { id: "customerGroup", label: "Customer group / ICP", type: "select", dynamicOptionsFrom: "signalCustomerGroups", options: ["Create a new customer group for this play", "Not sure yet"] },
                { id: "newCustomerGroup", label: "New customer group for this play", type: "text" },
                { id: "offerOrUseCase", label: "Offer or use case", type: "select", dynamicOptionsFrom: "signalOfferUseCases", options: ["Create a new offer/use case for this play", "Not sure yet"] },
                { id: "newOfferOrUseCase", label: "New offer or use case for this play", type: "text" },
                { id: "primaryBuyerPersona", label: "Primary buyer persona", type: "select", options: ["", "Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Technical / Security Reviewer", "Procurement / Finance", "Likely Blocker", "Other", "Not sure"] },
                { id: "gtmMotion", label: "GTM motion / channel", type: "select", options: ["", "Outbound sales", "Inbound lead qualification", "Account-based marketing", "Partner / referral motion", "Paid acquisition", "Events / webinars", "Expansion / customer success", "Product-led motion", "Founder-led selling", "Retail / local selling", "Not sure yet", "Other"] },
                { id: "playPriority", label: "Priority", type: "select", options: ["", "Primary targeting strategy", "Secondary", "Future", "Not sure"] },
                { id: "assessmentDepth", label: "Assessment depth", type: "select", options: ["", "Summary only", "Full signal analysis"], hint: "Choose Full signal analysis for plays you want scored and turned into actionable routing/outreach rules." },
                { id: "playNotes", label: "Targeting strategy notes", type: "textarea", placeholder: "Example: This play watches for expansion triggers and routes accounts to outbound with an operations-efficiency message." }
              ]
            }
          ]
        },
        {
          title: "Primary Targeting Strategy",
          fields: [
            { id: "primarySignalPlay", label: "Which targeting strategy should be the primary focus for the next 90 days?", type: "select", dynamicOptionsFrom: "signalPlayPortfolio", options: [], hint: "The primary targeting strategy will shape the GTM plan's signal-based actions. Other plays can still be summarized or fully assessed." }
          ]
        },
        {
          title: "Targeting Strategy Readiness Assessments",
          hint: "Detailed assessment panels appear here for targeting strategies marked Full signal analysis."
        }
      ],
      legacyFields: [
        { id: "positiveTriggerRules", label: "Specific observable trigger signals", type: "repeatableList", minItems: 1, addLabel: "Add trigger signal", itemPlaceholder: "Enter one observable signal" },
        { id: "publicFitSignals", label: "Public fit signals", type: "repeatableList", minItems: 1, addLabel: "Add public signal", itemPlaceholder: "Enter one public fit signal" },
        { id: "internalFitSignals", label: "Internal fit signals", type: "repeatableList", minItems: 1, addLabel: "Add internal signal", itemPlaceholder: "Enter one internal fit signal" },
        { id: "negativeSignals", label: "Negative signals", type: "repeatableList", minItems: 1, addLabel: "Add negative signal", itemPlaceholder: "Enter one negative signal" }
      ],
      legacyTables: [
        {
          id: "signalRules",
          title: "Signal scoring rules",
          repeatable: true,
          rowLabel: "Signal",
          minRows: 5,
          columns: [
            { id: "signal", label: "Signal", type: "text" },
            { id: "source", label: "Source", type: "text" },
            { id: "impact", label: "Score impact (+/-)", type: "text" },
            { id: "confidence", label: "Confidence level", type: "select", options: ["", "High", "Mid", "Low"] },
            { id: "notes", label: "Notes / rule", type: "text" }
          ]
        }
      ]
    },
    {
      id: "pipeline",
      title: "Revenue Motion, Channels, and Pipeline",
      description: "Define which revenue motions are active, which customer group and offer each motion supports, how pipeline moves through the funnel, and where deals get stuck.",
      helpBlocks: HELP_BLOCKS.pipeline,
      content: [
        {
          title: "Shared Revenue Infrastructure",
          hint: "Define the tracking systems, ownership, cadence, and capacity that support all revenue motions.",
          fields: [
            { id: "revenueTrackingSystem", label: "CRM or revenue tracking system", type: "select", options: ["", "HubSpot", "Salesforce", "Pipedrive", "Zoho", "Monday", "ActiveCampaign", "Copper", "Freshsales", "Spreadsheet", "Notion", "Airtable", "None", "Other"] },
            { id: "revenueReportingCadence", label: "Pipeline reporting cadence", type: "select", options: ["", "Daily", "Weekly", "Biweekly", "Monthly", "Ad hoc", "Not defined yet"] },
            { id: "primaryRevenueOwner", label: "Primary revenue owner", type: "text", placeholder: "Example: Founder, Sales Lead, Marketing Lead, RevOps, Customer Success Lead" },
            { id: "pipelineReviewOwner", label: "Who reviews pipeline and next steps?", type: "text", placeholder: "Example: Founder, Sales Lead, RevOps, leadership team" },
            { id: "sellingCapacity", label: "Current selling capacity", type: "select", options: ["", "No dedicated selling capacity", "Founder / executive only", "Part-time sales owner", "Dedicated sales owner", "Sales owner plus support", "Team-based sales motion", "Not sure"] },
            { id: "revenueDataQuality", label: "Revenue data quality", type: "select", options: ["", "High", "Medium", "Low", "Not sure"] },
            { id: "revenueInfrastructureNotes", label: "Revenue infrastructure notes", type: "textarea", placeholder: "Example: Pipeline is tracked in HubSpot, but source attribution and stage conversion are inconsistent." }
          ]
        },
        {
          title: "Overall Pipeline Snapshot",
          hint: "Use this for a company-wide view. If different motions have different metrics, capture those inside Revenue Motion Play Assessments below.",
          tables: [
            {
              id: "opportunitySnapshot",
              title: "Overall Pipeline Snapshot",
              rows: ["Total open opportunities", "Qualified opportunities", "Opportunities likely to close in 30 days", "Opportunities likely to close in 90 days", "Average deal size / contract value / order value", "Average sales cycle", "Discovery-to-demo rate", "Demo-to-proposal rate", "Proposal-to-close rate", "Most common next-step failure point", "CRM or tracking system used today"],
              columns: [
                {
                  id: "answer",
                  label: "Current number / answer",
                  type: "text",
                  typeByRow: { "average-deal-size-contract-value-order-value": "money" },
                  optionsByRow: { "crm-or-tracking-system-used-today": ["ActiveCampaign", "Agile", "Apptivo", "Brevo", "Monday", "Copper", "Insightly", "Keap", "Maximizer", "SugarCRM", "Zendesk", "Freshsales", "HubSpot", "Salesforce", "Pipedrive", "Zoho", "Spreadsheet", "Other"] }
                }
              ]
            }
          ]
        },
        {
          title: "",
          hint: "How will revenue be generated? Examples: founder-led outbound, referrals, partnerships, inbound marketing, paid acquisition.",
          tables: [
            {
              id: "revenueMotionPortfolio",
              title: "Revenue Acquisition Strategy Portfolio",
              layout: "cards",
              repeatable: true,
              rowLabel: "Revenue Acquisition Strategy",
              minRows: 1,
              maxRows: 50,
              addLabel: "Add revenue acquisition strategy",
              columns: [
                { id: "playName", label: "Revenue acquisition strategy name", type: "text", placeholder: "Example: Outbound diagnostic play, customer expansion play, partner referral play" },
                { id: "customerGroup", label: "Customer group / ICP", type: "select", dynamicOptionsFrom: "revenueCustomerGroups", options: ["Create a new customer group for this motion", "Not sure yet"] },
                { id: "newCustomerGroup", label: "New customer group for this motion", type: "text" },
                { id: "offer", label: "Offer", type: "select", dynamicOptionsFrom: "revenueOffers", options: ["Create a new offer for this motion", "Not sure yet"] },
                { id: "newOffer", label: "New offer for this motion", type: "text" },
                { id: "channelSource", label: "Channel / source", type: "select", options: ["", "Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Website conversion / booking flow", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Network referrals", "Customer referrals", "Trade shows", "Partners / affiliates / resellers", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Customer success outreach", "Product usage / product-led", "Retail / field / local selling", "Other"] },
                { id: "salesMotionType", label: "Sales motion", type: "select", options: ["", "Founder-led", "Inside sales", "Field sales", "Enterprise sales", "Partner-led", "Product-led", "Ecommerce / self-serve", "Customer expansion", "Account management", "Services / consultative selling", "Hybrid", "Not sure yet", "Other"] },
                { id: "primaryBuyer", label: "Primary buyer", type: "select", options: ["", "Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Technical / Security Reviewer", "Procurement / Finance", "Likely Blocker", "Other", "Not sure"] },
                { id: "linkedSignalPlay", label: "Related targeting strategy", type: "select", dynamicOptionsFrom: "signalPlayPortfolio", options: ["Not linked yet"] },
                { id: "playGoal", label: "Goal for this motion", type: "text", placeholder: "Example: Book 10 qualified diagnostics in 60 days." },
                { id: "playPriority", label: "Priority", type: "select", options: ["", "Primary revenue motion", "Secondary", "Future", "Not sure"] },
                { id: "assessmentDepth", label: "Assessment depth", type: "select", options: ["", "Summary only", "Full motion analysis"], hint: "Choose Full motion analysis for revenue motions you want scored and turned into operating recommendations." }
              ]
            }
          ]
        },
        {
          title: "Primary Revenue Motion",
          fields: [
            { id: "primaryRevenueMotion", label: "Which revenue motion should be the primary GTM focus for the next 90 days?", type: "select", dynamicOptionsFrom: "revenueMotionPortfolio", options: [], hint: "The primary revenue motion will drive the main 90-day GTM plan. Other motions can still be summarized or fully assessed." }
          ]
        },
        {
          title: "Revenue Motion Readiness Assessments",
          hint: "Detailed assessment panels appear here for revenue motions marked Full motion analysis."
        }
      ],
      legacyTables: [
        { id: "channelPerformance", title: "Channel Performance", rows: ["Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Website conversion / booking flow", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Network referrals", "Customer referrals", "Trade shows", "Partners / affiliates / resellers", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Retail / field / local selling", "Other"], columns: [{ id: "channel", label: "Channel", type: "text" }, { id: "currentActivity", label: "Channel description", type: "text" }, { id: "active", label: "Performance status", type: "select", options: ["", "Active and working", "Active but unproven", "Paused", "Not active"] }, { id: "revenueRank", label: "Revenue rank", type: "select", options: ["", "1", "2", "3", "4", "5"] }, { id: "last90DayResults", label: "Last 90-day results", type: "text" }, { id: "owner", label: "Owner", type: "select", options: ["", "Founder", "Marketing Lead", "Sales Lead", "Other"] }, { id: "confidence", label: "Confidence", type: "select", options: ["", "High", "Medium", "Low"] }, { id: "notes", label: "Notes", type: "text" }] },
        { id: "salesMotionMap", title: "Sales motion and conversion map", rows: ["Simple template: Lead", "Simple template: Discovery", "Simple template: Proposal", "Simple template: Closed Won", "Complex template: Target Account", "Complex template: Discovery", "Complex template: Qualification", "Complex template: Proposal", "Complex template: Pilot", "Complex template: Negotiation", "Complex template: Closed Won"], columns: [{ id: "owner", label: "Owner", type: "text" }, { id: "entry", label: "Entry criteria", type: "text" }, { id: "exit", label: "Exit criteria", type: "text" }, { id: "conversion", label: "Current conversion", type: "text" }, { id: "improvements", label: "Issues / improvements", type: "text" }] }
      ],
      legacyFields: [
        { id: "additionalSalesSources", label: "Other sales sources", type: "repeatableList", minItems: 1, addLabel: "Add source", itemPlaceholder: "Enter one additional sales source" },
        { id: "seniorTimeTriggers", label: "What triggers signal that you should spend your time with a prospective client?", type: "repeatableList", minItems: 1, addLabel: "Add trigger", itemPlaceholder: "Enter one trigger, such as high-value client or strategic client" },
        { id: "delegateProspectTriggers", label: "What triggers signal that a prospective client can be handled without your involvement?", type: "repeatableList", minItems: 1, addLabel: "Add trigger", itemPlaceholder: "Enter one trigger, such as low/medium value prospect or non-strategic prospect" }
      ]
    }
  ]
};

window.GTM_INTAKE_SCHEMA = GTM_INTAKE_SCHEMA;
