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
      title: "Company Information and GTM Footprint",
      description: "Baseline company context, public presence, current sales channels, and GTM systems.",
      fields: [
        { id: "companyName", label: "Company name", type: "text", required: true },
        { id: "website", label: "Primary website URL", type: "url", placeholder: "https://example.com" },
        { id: "preparedBy", label: "Prepared by / respondent", type: "text" },
        { id: "respondentRole", label: "Role / title", type: "text" },
        { id: "reviewPeriod", label: "Review period covered", type: "select", options: ["Last 90 days", "Current quarter", "Current fiscal year", "Other"] },
        { id: "primaryOffering", label: "Primary offering / product line", type: "textarea" },
        { id: "industry", label: "Industry / category", type: "text", placeholder: "List as many as are relevant" },
        { id: "businessModel", label: "Business model", type: "select", options: ["Subscription", "Services", "Marketplace", "Transaction", "Usage-based", "Licensing", "Retail", "Hybrid", "Other"] },
        { id: "companyStage", label: "Company stage", type: "select", options: ["Pre-revenue", "Pilot", "Early revenue", "Growth", "Scale", "Turnaround", "New market entry"] },
        { id: "geography", label: "Primary geography / markets served", type: "select", options: ["North America", "United States", "Canada", "Mexico", "South America", "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Europe", "United Kingdom", "Ireland", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Switzerland", "Asia", "China", "India", "Japan", "South Korea", "Singapore", "Indonesia", "Australia / Oceania", "Australia", "New Zealand", "Africa", "South Africa", "Nigeria", "Kenya", "Egypt", "Middle East", "United Arab Emirates", "Saudi Arabia", "Israel", "Global", "Other"] },
        { id: "teamSize", label: "Employee count / team size", type: "text" },
        { id: "revenueRange", label: "Current annual revenue", type: "select", options: ["Pre-revenue", "$0 - $1,000,000", "$1,000,001 - $5,000,000", "$5,000,001 - $10,000,000", "$10,000,001+"] },
        { id: "monthlyRecurringRevenue", label: "Monthly recurring revenue (MRR)", type: "money", placeholder: "25,000" },
        { id: "annualRecurringRevenue", label: "Annual recurring revenue (ARR)", type: "money", placeholder: "300,000" },
        { id: "hasRecurringRevenue", label: "Revenue model", type: "checkbox", checkboxLabel: "Recurring revenue applies to this business" },
        { id: "customerCount", label: "Current customer count", type: "text" },
        { id: "averageDealSize", label: "Average deal size / order value / contract value", type: "money" },
        { id: "primarySalesMotion", label: "Primary sales motion today", type: "select", options: ["Self-serve", "Inside sales", "Field sales", "Founder-led", "Partner-led", "Enterprise sales", "Product-led", "Ecommerce", "Other"] },
        { id: "mainGrowthConstraint", label: "Main growth constraint today", type: "select", options: ["Strategic Planning - Lack of Documented Strategy/Tactics", "Strategic Planning - No clear documented vision", "Strategic Planning - Lack of realistic SWOT", "Technology - Outdated Tech", "Technology - Need for expensive systems", "Technology - Lack of AI Strategy", "Financial and Capital Constraints - Cash Flow Management", "Financial and Capital Constraints - Low or no Access to Credit", "Financial and Capital Constraints - Under Capitalization", "Talent and Leadership - Finding Qualified Workers", "Talent and Leadership - Founder Delegation", "Talent and Leadership - Workforce Demands", "Operational Infrastructure - Process Scalability", "Operational Infrastructure - Supply Chain Disruptions", "Operational Infrastructure - Organizational Complexity", "Market Dynamics and Product Fit - Lack of Strategic Planning", "Market Dynamics and Product Fit - Unclear Product-Market Fit", "Market Dynamics and Product Fit - Intense Competition", "Market Dynamics and Product Fit - Regulatory Hurdles", "Other"] },
        { id: "additionalGrowthConstraints", label: "Other / additional growth constraints", type: "repeatableList", minItems: 1, addLabel: "Add constraint", itemPlaceholder: "Enter one additional constraint" },
        { id: "researchNotes", label: "AI research notes / prefilled context", type: "textarea", full: true }
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
      id: "snapshot",
      title: "Executive Snapshot",
      description: "Should be completed by company or department head.",
      fields: [
        { id: "additionalSalesSources", label: "Other sales sources", type: "repeatableList", minItems: 1, addLabel: "Add source", itemPlaceholder: "Enter one additional sales source" },
        { id: "lowYieldActivity", label: "Activities consuming time with little revenue progress", type: "repeatableList", minItems: 1, addLabel: "Add activity", itemPlaceholder: "Enter one low-yield activity" },
        { id: "proofCustomers", label: "Best proof / referral candidates", type: "repeatableList", minItems: 1, addLabel: "Add customer", itemPlaceholder: "Enter one customer or account" },
        { id: "weeklyRevenueHours", label: "Protected weekly hours for direct revenue activity", type: "select", options: ["0-2", "3-5", "6-10", "11-20", "20+"] },
        { id: "seniorTimeTriggers", label: "What triggers signal that you should spend your time with a prospective client?", type: "repeatableList", minItems: 1, addLabel: "Add trigger", itemPlaceholder: "Enter one trigger, such as high-value client or strategic client" },
        { id: "delegateProspectTriggers", label: "What triggers signal that a prospective client can be handled without your involvement?", type: "repeatableList", minItems: 1, addLabel: "Add trigger", itemPlaceholder: "Enter one trigger, such as low/medium value prospect or non-strategic prospect" },
        { id: "avoidSegments", label: "Which customer types, segments, or opportunities should you avoid for now?", type: "repeatableList", minItems: 1, addLabel: "Add avoided segment", itemPlaceholder: "Enter one avoid-for-now type", hint: "Look for buyers that are too costly to serve, too slow to close, too custom, too low-value, too risky, or outside the current focus." }
      ],
      tables: [
        {
          id: "salesActivityRevenueRank",
          title: "Which sales activity produces the most revenue today?",
          rows: ["Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Website conversion / booking flow", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Network referrals", "Customer referrals", "Trade shows", "Partners / affiliates / resellers", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Retail / field / local selling"],
          columns: [
            { id: "rank", label: "Revenue rank", type: "select", options: ["", "1", "2", "3", "4", "5"] }
          ]
        },
        {
          id: "customerPaidBenefits",
          title: "Which benefits do customers pay you for?",
          repeatable: true,
          rowLabel: "Benefit",
          minRows: 5,
          columns: [
            { id: "benefit", label: "Benefit", type: "select", options: ["", "Time savings", "Cost reduction", "Increased margin", "Increased lead flow", "Higher sales conversions", "Increased revenue", "Risk reduction", "Quality improvement", "Productivity improvement", "Faster delivery", "Better customer experience", "Compliance improvement", "Better visibility / reporting", "Lower implementation burden", "Other"] },
            { id: "measurement", label: "Specific expected measurement", type: "text" }
          ]
        },
        {
          id: "successCriteria",
          title: "Revenue and/or Pipeline Success Criteria",
          rows: ["30 days", "60 days", "90 days"],
          columns: [
            { id: "rank1", label: "1", type: "text" },
            { id: "rank2", label: "2", type: "text" },
            { id: "rank3", label: "3", type: "text" }
          ]
        },
        {
          id: "topConstraints",
          title: "Your Top Constraints",
          rows: ["1", "2", "3"],
          columns: [
            { id: "constraint", label: "Constraint", type: "select", options: ["", "Capacity", "Focus", "Product readiness", "Proof", "Budget", "Data quality", "Messaging", "Channel access", "Technology", "Talent", "Operations", "Market clarity", "Other"] },
            {
              id: "followUp",
              label: "Follow-up",
              type: "text",
              followUpFor: "constraint",
              followUpPrompts: {
                "Capacity": "What must be true for you to spend time on an activity?",
                "Focus": "What would make this activity important enough to stay focused on?",
                "Product readiness": "What product condition must be true before pursuing this?",
                "Proof": "What proof would make this worth pursuing?",
                "Budget": "What budget condition must be true before moving forward?",
                "Data quality": "What data must be reliable enough to act on?",
                "Messaging": "What message must be clear before investing effort?",
                "Channel access": "What access must exist before this is worth pursuing?",
                "Technology": "What system or capability must be in place?",
                "Talent": "Who needs to own or support this?",
                "Operations": "What process must be ready first?",
                "Market clarity": "What market signal would make this worth pursuing?",
                "Other": "What must be true before this constraint is no longer blocking progress?"
              }
            }
          ]
        }
      ]
    },
    {
      id: "quickIcp",
      title: "Quick Response Ideal Customer Profile",
      tables: [
        {
          id: "bestCustomerProfile",
          title: "Build the single best customer profile",
          rows: ["Segment / company type", "Size / scale range", "Maturity stage", "Primary pain", "Current workaround", "Trigger event or timing signal", "Economic buyer", "Champion / day-to-day owner", "First use case or sales wedge", "Budget / ability to pay", "Likely sales motion", "Expected sales cycle", "Implementation requirements", "Evidence this profile is a good fit", "Expansion or strategic value", "Disqualification signals"],
          columns: [
            { id: "answer", label: "Rough answer", type: "text" }
          ]
        }
      ]
    },
    {
      id: "goals",
      title: "Revenue Goals, Strategy, and Constraints",
      fields: [
        { id: "businessPriority", label: "What is the single most important need for the company right now?", type: "select", options: ["Customer validation", "Lead flow", "Revenue", "Strategic reference", "Retention", "Expansion", "Category awareness", "Other"] },
        { id: "goal30", label: "Primary GTM goal for the next 30 days", type: "select", options: ["Leadflow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal60", label: "Primary GTM goal for the next 60 days", type: "select", options: ["Leadflow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal90", label: "Primary GTM goal for the next 90 days", type: "select", options: ["Leadflow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "clientAttribute", label: "Most important attribute for new clients", type: "select", options: ["Strong cash position", "Pilot participation", "Testimonials", "Inform roadmap", "Provide referrals / introductions", "Ability to expand rapidly", "Other"] },
        { id: "supportedSalesCycle", label: "Sales cycle the company can realistically support", type: "select", options: ["Under 14 days", "15-30 days", "30-60 days", "60-90 days", "Longer"] },
        { id: "capacityNotes", label: "Capacity or delivery notes that affect prospect fit", type: "textarea", full: true }
      ],
      tables: [
        {
          id: "constraintLevels",
          title: "What are your current constraints levels in each category below?",
          rows: ["Budget", "Delivery / implementation", "Product", "Resources"],
          columns: [
            { id: "level", label: "Constraint level", type: "select", options: ["", "Low", "Mid", "High"] },
            { id: "why", label: "Why?", type: "text" }
          ]
        }
      ]
    },
    {
      id: "traction",
      title: "Current Traction and Customer Proof",
      fields: [
        { id: "usageProof", label: "What value do you provide to your customer(s)?", type: "multiselect", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] },
        { id: "caseStudyPotential", label: "Case study / testimonial / referral potential", type: "repeatableList", minItems: 1, addLabel: "Add proof opportunity", itemPlaceholder: "Enter one customer or proof opportunity" },
        { id: "expansionPotential", label: "Expansion potential in the next 90 days", type: "repeatableList", minItems: 1, addLabel: "Add expansion opportunity", itemPlaceholder: "Enter one expansion opportunity" },
        { id: "implementationBurden", label: "Customers or opportunities with high implementation burden", type: "repeatableList", minItems: 1, addLabel: "Add burden example", itemPlaceholder: "Enter one customer/opportunity and why it was hard" },
        { id: "stalledOpportunities", label: "Stalled opportunities and reasons", type: "repeatableList", minItems: 1, addLabel: "Add stalled opportunity", itemPlaceholder: "Enter one stalled opportunity and reason" }
      ],
      tables: [
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
          id: "customerPerformance",
          title: "Rank how you perform for the customer in each of these categories between 1-5, with 5 being excellent performance and 1 being very bad performance.",
          rows: ["Onboarding", "Data quality", "Cost", "Usage", "Product gaps", "Executive ownership", "Timing", "Support"],
          columns: [
            { id: "rank", label: "Performance rank", type: "select", options: ["", "1", "2", "3", "4", "5"] }
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
      ]
    },
    {
      id: "icp",
      title: "ICP Hypothesis and Market Segmentation",
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
      tables: [
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
      fields: [
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
      title: "Problem, Offer, Packaging, Pricing, and Proof",
      fields: [
        { id: "oneSentencePromise", label: "One-sentence promise", type: "textarea" },
        { id: "painUrgency", label: "Pain and urgency", type: "textarea" },
        { id: "economicValue", label: "Economic value", type: "textarea" },
        { id: "beforeAfter", label: "Before / after", type: "textarea" },
        { id: "primaryWedge", label: "Primary wedge", type: "textarea" },
        { id: "easiestNextStep", label: "Easiest next step", type: "select", options: ["Diagnostic", "Demo", "Audit", "Trial", "Pilot", "Workshop", "Proposal", "Quote", "Sample", "Consultation", "Other"] },
        { id: "pricing", label: "Pricing", type: "textarea" },
        { id: "pilotProofOfConcept", label: "Pilot / proof of concept", type: "textarea" },
        { id: "alternatives", label: "Alternatives prospects use today", type: "multiselect", options: ["Manual work", "Spreadsheets", "Internal team", "Incumbent vendor", "Point solution", "Agency", "Consultant", "Generic tool", "Doing nothing"] },
        { id: "objections", label: "Common objections", type: "multiselect", options: ["Price", "Timing", "Trust", "ROI", "Risk", "Data", "Implementation", "Internal ownership", "Competing priorities", "Switching cost", "Adoption"] },
        { id: "salesAssets", label: "Sales asset checklist", type: "multiselect", options: ["One-page overview", "ICP definition", "Discovery call guide", "Demo or pitch script", "ROI calculator", "Pricing sheet", "Proposal template", "Implementation plan", "Security / privacy FAQ", "Case study", "Testimonials or reviews", "Reference list", "Objection handling guide", "Competitor / alternatives battlecard", "Email templates", "Call script", "Follow-up sequence", "Customer onboarding checklist", "Expansion / renewal playbook", "Partner/referral one-pager"] }
      ],
      tables: [
        {
          id: "proofAssetStatus",
          title: "Existing and missing proof assets",
          repeatable: true,
          rowLabel: "Proof criterion",
          minRows: 5,
          columns: [
            { id: "criterion", label: "Proof criterion", type: "select", optionsFromMultiselect: "usageProof", options: ["Time savings", "Cost reduction", "Increased revenue", "Increased conversion", "Risk reduction", "Adoption", "Retention", "Satisfaction", "Productivity improvements", "Quality improvements", "Other quantified results"] },
            { id: "assetExists", label: "Asset exists?", type: "checkbox", value: "Yes" },
            { id: "assetName", label: "Asset name", type: "text" },
            { id: "gapNote", label: "If no, proof gap", type: "text" }
          ]
        },
        {
          id: "proofGapTracker",
          title: "Proof gap tracker",
          repeatable: true,
          rowLabel: "Proof gap",
          minRows: 5,
          columns: [
            { id: "asset", label: "Missing proof / asset", type: "text" },
            { id: "why", label: "Why it matters", type: "text" },
            { id: "source", label: "Source of evidence", type: "text" },
            { id: "owner", label: "Owner", type: "text" },
            { id: "due", label: "Due date", type: "text" }
          ]
        }
      ]
    },
    {
      id: "signals",
      title: "Trigger Events, Signals, and Data Sources",
      fields: [
        { id: "positiveTriggerRules", label: "Specific observable trigger signals", type: "repeatableList", minItems: 1, addLabel: "Add trigger signal", itemPlaceholder: "Enter one observable signal" },
        { id: "publicFitSignals", label: "Public fit signals", type: "repeatableList", minItems: 1, addLabel: "Add public signal", itemPlaceholder: "Enter one public fit signal" },
        { id: "internalFitSignals", label: "Internal fit signals", type: "repeatableList", minItems: 1, addLabel: "Add internal signal", itemPlaceholder: "Enter one internal fit signal" },
        { id: "negativeSignals", label: "Negative signals", type: "repeatableList", minItems: 1, addLabel: "Add negative signal", itemPlaceholder: "Enter one negative signal" },
        { id: "signalDataSources", label: "Data sources", type: "multiselect", options: ["CRM", "LinkedIn", "Website analytics", "Intent data", "Industry publications", "Directories", "Events", "Customer interviews", "Support data", "Partner lists", "Enrichment tools", "Review sites"] }
      ],
      tables: [
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
      title: "Lead Sources, Pipeline, and Sales Motion",
      tables: [
        {
          id: "salesChannels",
          title: "Current sales channels",
          rows: ["Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Customer referrals", "Partner / affiliate / reseller channels", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Retail / field / local selling", "Other"],
          columns: [
            { id: "active", label: "Active?", type: "select", options: ["", "Yes", "No"] },
            { id: "owner", label: "Owner", type: "select", options: ["", "Founder", "Marketing Lead", "Sales Lead", "Other"] },
            { id: "activity", label: "Current activity", type: "text" },
            { id: "results", label: "Last 90-day results", type: "text" },
            { id: "issues", label: "Notes / issues", type: "text" }
          ]
        },
        {
          id: "opportunitySnapshot",
          title: "Opportunity snapshot",
          rows: ["Total open opportunities", "Qualified opportunities", "Opportunities likely to close in 30 days", "Opportunities likely to close in 90 days", "Average deal size / contract value / order value", "Average sales cycle", "Discovery-to-demo rate", "Demo-to-proposal rate", "Proposal-to-close rate", "Most common next-step failure point", "CRM or tracking system used today"],
          columns: [
            {
              id: "answer",
              label: "Current number / answer",
              type: "text",
              typeByRow: {
                "average-deal-size-contract-value-order-value": "money"
              },
              optionsByRow: {
                "crm-or-tracking-system-used-today": ["ActiveCampaign", "Agile", "Apptivo", "Brevo", "Monday", "Copper", "Insightly", "Keap", "Maximizer", "SugarCRM", "Zendesk", "Freshsales", "HubSpot", "Salesforce", "Pipedrive", "Zoho", "Spreadsheet", "Other"]
              }
            }
          ]
        },
        {
          id: "salesMotionMap",
          title: "Sales motion and conversion map",
          rows: ["Target identified", "First outreach / lead capture", "First response / conversation", "Qualified discovery", "Demo / consultation / needs review", "Proposal / quote / business case", "Negotiation / approval", "Closed won / purchase", "Onboarding / implementation", "Expansion / renewal / referral"],
          columns: [
            { id: "owner", label: "Owner", type: "text" },
            { id: "entry", label: "Entry criteria", type: "text" },
            { id: "exit", label: "Exit criteria", type: "text" },
            { id: "conversion", label: "Current conversion", type: "text" },
            { id: "improvements", label: "Issues / improvements", type: "text" }
          ]
        }
      ],
      fields: [
        { id: "marketUrgency", label: "Market urgency", type: "scoreSelect", options: ["Low: optional or nice-to-have", "Emerging: problem exists but timing is unclear", "Moderate: some buyers are actively looking", "High: clear urgency for best-fit buyers", "Critical: urgent, budgeted, and time-sensitive"] },
        { id: "icpClarity", label: "ICP clarity", type: "scoreSelect", options: ["Not defined", "Broad audience only", "Defined but not validated", "Validated with customer evidence", "Highly specific and consistently used"] },
        { id: "positioningClarity", label: "Positioning clarity", type: "scoreSelect", options: ["Unclear", "Mostly feature-led", "Benefit-led but generic", "Differentiated for the ICP", "Sharp, differentiated, and proven"] },
        { id: "offerClarity", label: "Offer clarity", type: "scoreSelect", options: ["Offer unclear", "Offer exists but hard to explain", "Clear offer, weak proof", "Clear offer with proof points", "Compelling offer with proof and urgency"] },
        { id: "pricingConfidence", label: "Pricing confidence", type: "scoreSelect", options: ["No clear pricing model", "Pricing is mostly guessed", "Accepted but not optimized", "Matches buyer value and segment", "Validated and supports expansion"] },
        { id: "channelFocus", label: "Channel focus", type: "scoreSelect", options: ["No clear acquisition channel", "Many channels, little focus", "One or two plausible channels", "Primary channel has evidence", "Repeatable channel with known economics"] },
        { id: "salesMotion", label: "Sales motion", type: "scoreSelect", options: ["No defined sales process", "Ad hoc founder-led selling", "Basic process exists", "Documented with conversion tracking", "Predictable motion with clear handoffs"] },
        { id: "contentAssets", label: "GTM assets", type: "scoreSelect", options: ["Few or no assets", "Basic website / deck only", "Some persona and funnel assets", "Strong assets for priority channels", "Full asset system tied to funnel stages"] },
        { id: "funnelTracking", label: "Funnel tracking", type: "scoreSelect", options: ["No reliable tracking", "Basic traffic or sales reporting", "Lead and conversion metrics tracked", "Funnel metrics reviewed regularly", "Full funnel economics and attribution available"] },
        { id: "experimentReadiness", label: "Experiment readiness", type: "scoreSelect", options: ["No testing process", "Occasional unstructured tests", "Test ideas exist but weak measurement", "Prioritized experiments with success metrics", "Consistent learning loop and decision rhythm"] },
        { id: "budget", label: "Budget readiness", type: "scoreSelect", options: ["No budget identified", "Small test budget only", "Budget exists but constrained", "Budget available for focused execution", "Budget supports scaling after validation"] },
        { id: "teamCapacity", label: "Team capacity", type: "scoreSelect", options: ["No clear owner", "Part-time owner only", "Owner plus limited support", "Dedicated owner and supporting team", "Cross-functional team with execution cadence"] }
      ]
    }
  ]
};

window.GTM_INTAKE_SCHEMA = GTM_INTAKE_SCHEMA;
