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
      examples: ["Founder-led referral outreach to a defined customer group, with a weekly activity target and review cadence."]
    }
  ]
};

const CUSTOMER_PROBLEM_OPTIONS = [
  "Lack of resources / capacity",
  "Lack of expertise / specialized capability",
  "Lack of capital / budget constraints",
  "Manual work or inefficient process",
  "Too much work depends on the founder or a small team",
  "Unclear strategy or prioritization",
  "Poor data visibility or reporting",
  "Weak sales process or pipeline management",
  "Low lead quality or inconsistent demand",
  "Slow follow-up or missed opportunities",
  "High customer acquisition cost",
  "Low conversion rate",
  "Need offerings their customers, users, or accounts want",
  "Gap in current product, service, catalog, workflow, or solution mix",
  "Need differentiated offerings for their market, channel, or customer base",
  "Need better positioning, packaging, onboarding, presentation, or merchandising",
  "Need offerings that convert, sell through, get adopted, or create usage",
  "Need proof before taking financial, inventory, brand, adoption, or delivery risk",
  "Inventory, adoption, usage, churn, or slow-moving-offer risk",
  "Seasonal or occasion-specific demand",
  "Unclear end-user, customer, or account demand",
  "Need lower minimum order, commitment, onboarding, or setup requirements",
  "Need faster speed to launch, market, adoption, or activation",
  "Need reliable delivery, support, fulfillment, onboarding, or replenishment",
  "Need better price point, budget fit, terms, or channel fit",
  "Need offerings that fit a specific customer lifestyle, job, workflow, or use case",
  "Margin pressure or rising costs",
  "Vendor, supplier, or fulfillment issues",
  "Quality or delivery reliability issues",
  "Difficulty launching new products or offers",
  "Insufficient proof, trust, or business case",
  "Competitive pressure",
  "Implementation complexity",
  "Compliance, security, or risk pressure",
  "Other"
];

const CUSTOMER_USE_CASE_OPTIONS = [
  "Reduce manual work",
  "Increase qualified pipeline",
  "Improve conversion",
  "Reduce costs",
  "Improve margin",
  "Add an offering to the product, service, catalog, or solution mix",
  "Replace underperforming products, services, tools, vendors, or workflows",
  "Increase category, account, channel, or use-case revenue",
  "Improve conversion, adoption, usage, sell-through, or repeat demand",
  "Differentiate the brand, channel, product, service, or solution offering",
  "Test an offering with a small order, pilot, beta, trial, or limited launch",
  "Serve seasonal or occasion-specific demand",
  "Improve positioning, packaging, onboarding, presentation, or merchandising",
  "Reduce inventory, delivery, adoption, implementation, or financial risk",
  "Improve delivery, support, fulfillment, onboarding, or replenishment reliability",
  "Fit a specific price point, budget, margin, or commercial model",
  "Launch products, services, campaigns, or offers faster",
  "Improve operational reliability",
  "Improve reporting or visibility",
  "Create a repeatable sales process",
  "Clarify positioning or messaging",
  "Build a target-account list",
  "Improve proof or buyer confidence",
  "Reduce implementation risk",
  "Other"
];

const CUSTOMER_ROUTE_TO_MARKET_OPTIONS = [
  "End consumer / direct-to-consumer buyer",
  "Retail / wholesale buyer",
  "Distributor or channel partner",
  "Marketplace buyer",
  "Business buyer",
  "Influencer, recommender, or community gatekeeper",
  "Not sure yet",
  "Other"
];

const CONSUMER_PURCHASE_TRIGGER_OPTIONS = [
  "Need for a specific activity or occasion",
  "Seasonal need",
  "Gift purchase",
  "Replacement purchase",
  "New hobby or lifestyle change",
  "Upcoming trip, event, or deadline",
  "Problem with current product",
  "Recommendation from friend, expert, or community",
  "Social media or creator influence",
  "In-store discovery",
  "Promotion or discount",
  "Other"
];

const CHANNEL_BUYING_CRITERIA_OPTIONS = [
  "Customer, user, or account demand",
  "Category, workflow, catalog, or solution fit",
  "Brand fit",
  "Differentiated product, service, or solution story",
  "Margin, revenue, or economic model",
  "Price point or budget fit",
  "Minimum order, commitment, onboarding, or setup requirement",
  "Sell-through, adoption, usage, or conversion potential",
  "Inventory, financial, adoption, or delivery risk",
  "Packaging, positioning, onboarding, presentation, or buying experience",
  "Merchandising, enablement, display, demo, or launch support",
  "Reliable delivery, support, fulfillment, onboarding, or replenishment",
  "Seasonal, budget, roadmap, or decision timing",
  "Proof from reviews, usage, sales, pilots, or buyer feedback",
  "Easy vendor, partner, platform, or customer onboarding",
  "Other"
];

const PRE_REVENUE_VALIDATION_FOCUS_OPTIONS = [
  "Validate that consumers want the product",
  "Validate the first customer segment",
  "Validate the product offer or first buying commitment",
  "Validate price or willingness to pay",
  "Validate messaging or positioning",
  "Validate DTC acquisition channel",
  "Validate retail / wholesale demand",
  "Validate marketplace demand",
  "Validate distributor or partner path",
  "Validate fulfillment, supply, or delivery fit",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_BROAD_MARKET_OPTIONS = [
  "Consumer physical product",
  "Consumer digital product or app",
  "Consumer service or experience",
  "Business physical product",
  "Business software, tool, or platform",
  "Business service or managed solution",
  "Marketplace or network product",
  "Education, training, or information product",
  "Membership, community, or subscription",
  "Health, wellness, or personal improvement",
  "Home, family, lifestyle, or daily-use product",
  "Food, beverage, beauty, or personal care",
  "Hobby, recreation, entertainment, or passion category",
  "Local, specialty, or niche market",
  "Regulated, technical, or expert-led category",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CUSTOMER_TYPE_OPTIONS = [
  "End users with a specific use case",
  "People with a specific problem or goal",
  "People in a specific life stage, role, or situation",
  "Early adopters or first testers",
  "Repeat purchasers or high-frequency users",
  "Gift buyers or buyers for someone else",
  "Community members, followers, or fans",
  "Influencers, experts, guides, instructors, or reviewers",
  "Small businesses or teams",
  "Department or functional buyers",
  "Owners, operators, or founders",
  "Independent retailers or resellers",
  "Retail, wholesale, or channel buyers",
  "Marketplace shoppers, sellers, or operators",
  "Distributors, partners, or affiliates",
  "Enterprise, institutional, or corporate buyers",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_PRODUCT_PROBLEM_OPTIONS = [
  "Current options do not solve the use case well",
  "Current options are inconvenient, frustrating, or hard to use",
  "Current options lack an important feature, service, or experience",
  "Current options are poor quality, unreliable, or inconsistent",
  "Current options are too expensive for the value received",
  "Current options do not fit the buyer's identity, workflow, values, or context",
  "Current options are hard to find, compare, buy, access, or adopt",
  "Current options are not designed for this specific use case or audience",
  "Buyer needs a better first-time experience, gift, trial, or specialty option",
  "Buyer needs an option for a specific moment, deadline, season, event, or workflow",
  "Channel buyer needs offerings their customers or users will want",
  "Channel buyer needs differentiation from alternatives",
  "Channel buyer needs stronger demand, conversion, margin, retention, or usage proof",
  "Channel buyer needs proof before taking financial, inventory, brand, or adoption risk",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_WHY_NOW_OPTIONS = [
  "Seasonal buying window",
  "Upcoming trip, event, or activity",
  "New hobby, lifestyle change, or community participation",
  "Problem with current product",
  "Consumer trend or category growth",
  "Social media or creator attention",
  "Retail category reset or assortment planning",
  "Trade show or buying event",
  "Inventory shortfall",
  "Supplier issue",
  "Gift season",
  "Launch timing",
  "Founder has access to buyers now",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_BUYER_ROLE_OPTIONS = [
  "End consumer",
  "Gift buyer",
  "Community influencer or expert",
  "Retail buyer / merchant",
  "Category manager",
  "Store owner",
  "Store manager",
  "Distributor",
  "Marketplace buyer",
  "Corporate or team buyer",
  "Founder / owner",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_BUYER_ROLE_OPTIONS = [
  "End consumer / product user",
  "Gift buyer",
  "Household decision maker",
  "Community influencer or expert",
  "Friend, family member, or recommender",
  "Creator or reviewer",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_BUYER_ROLE_OPTIONS = [
  "Retail buyer / merchant",
  "Category manager",
  "Store owner",
  "Store manager",
  "Distributor",
  "Marketplace buyer",
  "Corporate or team buyer",
  "Founder / owner",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_REACHABILITY_OPTIONS = [
  "Founder network",
  "Existing audience or community",
  "Social media content",
  "Creator or influencer partnerships",
  "Email list",
  "Paid social test",
  "Landing page or waitlist",
  "Marketplace or app-store listing",
  "Buyer, account, or partner list",
  "Trade show, conference, or industry event",
  "Local venues, communities, or businesses",
  "Customer interviews",
  "Warm referrals",
  "Communities, forums, or groups",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CREDIBILITY_OPTIONS = [
  "Founder has domain experience",
  "Founder is part of the target community",
  "Prototype, demo, sample, mockup, or beta exists",
  "Product solves a visible use-case problem",
  "Early user feedback exists",
  "Advisor or expert validation",
  "Relevant technical, operational, creative, or supply capability",
  "Design, quality, feature, service, or experience differentiation",
  "Relevant channel, partner, or community relationship",
  "Proof by comparable products, services, or behaviors",
  "No credibility yet",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_VALIDATION_PATH_OPTIONS = [
  "Interview target buyers or users",
  "Show prototype, demo, sample, mockup, or concept",
  "Run landing page / waitlist test",
  "Test paid social or creator content",
  "Collect preorders or deposits",
  "Run small batch, pilot, beta, pop-up, or concierge test",
  "Ask channel buyers for review feedback",
  "Pitch a small set of target accounts, partners, or channels",
  "Test marketplace, app-store, directory, or ecommerce listing",
  "Run survey with target buyers",
  "Ask for letters of intent or purchase commitments",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_VALIDATION_PATH_OPTIONS = [
  "Interview target buyers or users",
  "Show prototype, demo, sample, photos, or product mockup",
  "Run landing page / waitlist test",
  "Test social media content or creator feedback",
  "Run small paid social message test",
  "Collect preorders or deposits",
  "Ask for price sensitivity feedback",
  "Run small batch, beta, concierge, pop-up, or local test",
  "Test marketplace, app-store, ecommerce, or checkout listing",
  "Survey target buyers or users",
  "Ask for referrals or sharing intent",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_VALIDATION_PATH_OPTIONS = [
  "Ask channel buyers for review feedback",
  "Pitch a small set of target accounts, resellers, or partners",
  "Request concept, demo, sample, or pilot review with buyers",
  "Ask for pricing, terms, onboarding, or commercial-model feedback",
  "Ask whether the product fits the channel, catalog, workflow, or audience",
  "Test margin, pricing, packaging, onboarding, delivery, or support assumptions",
  "Ask for a test order, pilot placement, beta, or limited launch",
  "Ask distributors, partners, or marketplace operators for category fit feedback",
  "Test marketplace buyer, seller, or operator feedback",
  "Use event, buyer list, partner list, or targeted account outreach",
  "Ask for letter of intent or purchase commitment",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_EVIDENCE_OPTIONS = [
  "Target buyer or user interview",
  "Prototype, demo, sample, photo, or product mockup feedback",
  "Waitlist signup",
  "Preorder or deposit",
  "Price sensitivity feedback",
  "Landing page signup or click data",
  "Social media engagement",
  "Creator, reviewer, or community feedback",
  "Survey response from target buyers or users",
  "Small batch, beta, concierge, pop-up, or local test result",
  "Marketplace, app-store, ecommerce, or checkout signal",
  "Referral or sharing intent",
  "Competitor or comparable product, service, or behavior signal",
  "Founder experience in the buyer category",
  "Founder intuition only",
  "No evidence yet",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_EVIDENCE_OPTIONS = [
  "Channel buyer, partner, or account conversation",
  "Concept, demo, sample, pilot, or beta review request",
  "Product details, pricing page, proposal, or information request",
  "Commercial terms request",
  "Channel, catalog, workflow, or audience-fit feedback",
  "Pricing, margin, onboarding, delivery, support, or operating-model feedback",
  "Test order, pilot, beta, or limited launch interest",
  "Purchase order, LOI, or written commitment",
  "Distributor, partner, reseller, or marketplace feedback",
  "Event, conference, trade show, or buyer-list signal",
  "Comparable product, service, category, or behavior signal",
  "Channel relationship or warm introduction",
  "Advisor or expert validation",
  "Founder experience with this channel",
  "Founder intuition only",
  "No evidence yet",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_BUYER_WORRY_OPTIONS = [
  "Product quality will disappoint",
  "Fit, usability, setup, taste, size, experience, or outcome will be wrong",
  "Product will not work for the intended use",
  "Price is too high",
  "Brand is not trusted yet",
  "Product does not look meaningfully different",
  "Delivery, access, setup, support, or availability will be poor",
  "Cancellation, returns, refunds, or exchanges will be difficult",
  "Reviews or proof are missing",
  "Buying from a new brand feels risky",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_PROBLEM_OPTIONS = [
  "Current options do not solve the use case well",
  "Current options are inconvenient, frustrating, or hard to use",
  "Current options lack the right feature, service, outcome, or experience",
  "Current options are poor quality, unreliable, or inconsistent",
  "Current options are too expensive for the value received",
  "Current options do not fit the buyer's lifestyle, workflow, values, or identity",
  "Current options are hard to find, compare, buy, access, or adopt",
  "Current options are not designed for this specific use case or audience",
  "Need a better first-time experience, gift, trial, or specialty option",
  "Need an option for a specific moment, deadline, season, event, or workflow",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_PROBLEM_OPTIONS = [
  "Need offerings their customers, users, or accounts want",
  "Gap in current assortment, catalog, partner offering, workflow, or solution set",
  "Need differentiated offerings for their channel, audience, or account base",
  "Need clearer positioning, packaging, onboarding, merchandising, or presentation",
  "Need offerings that convert, sell through, get adopted, or create usage",
  "Need proof before taking financial, inventory, brand, adoption, or delivery risk",
  "Inventory, adoption, usage, churn, or slow-moving-offer risk",
  "Need reliable delivery, fulfillment, onboarding, support, or replenishment",
  "Need better price point, margin, terms, or channel fit",
  "Need offerings that fit a specific customer need, job, lifestyle, or workflow",
  "Vendor, supplier, partner, platform, fulfillment, or support issues",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_PAIN_MECHANISM_OPTIONS = [
  "They are frustrated with what they currently use or buy",
  "They want the activity to feel easier, smoother, or less annoying",
  "They want a better experience while using, consuming, applying, accessing, or adopting the product",
  "They want quick access to the features, benefits, content, tools, or support they need",
  "They want fewer things to remember, manage, assemble, learn, or work around",
  "They want something that works in the real conditions where they would use it",
  "They want a product that fits how they see themselves or the community they belong to",
  "They want something that feels appropriate beyond one narrow use case",
  "They want a more practical version of a product they already buy",
  "They want to avoid wasting money on products that do not work for the use case",
  "They want to feel prepared, capable, or confident",
  "They need a useful gift or specialty purchase for someone with this interest",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_PAIN_MECHANISM_OPTIONS = [
  "Their customers are already asking for or responding to products like this",
  "It fills a clear gap in the current assortment, catalog, marketplace, workflow, or solution lineup",
  "It gives them a differentiated product competitors do not already carry",
  "It could increase basket size, order value, revenue, retention, usage, or account value",
  "It has a believable path to sell-through, adoption, usage, or repeat demand",
  "It fits a known season, buying window, reset, trend, or promotional moment",
  "It fits their channel, marketplace, customer base, account base, or workflow better than generic alternatives",
  "It gives them a stronger margin, price point, positioning, packaging, or presentation story",
  "It could reduce customer complaints, returns, or dissatisfaction with current options",
  "It is easy enough to test with a small order, sample, demo, pilot, beta, or limited launch",
  "It comes from a founder, supplier, partner, or team they believe can deliver reliably",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_URGENCY_OPTIONS = [
  "Seasonal or time-sensitive need",
  "Upcoming event, deadline, task, trip, activity, or life moment",
  "Gift purchase",
  "Replacement, renewal, upgrade, or first-time purchase",
  "New habit, hobby, role, lifestyle change, workflow, or goal",
  "Problem with current option",
  "Social media, creator, or community influence",
  "Promotion, launch, or limited availability",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_URGENCY_OPTIONS = [
  "Category, catalog, roadmap, workflow, or assortment planning",
  "Seasonal buying window",
  "Trade show, conference, buying event, or planning meeting",
  "Inventory, capacity, usage, or performance shortfall",
  "Supplier, vendor, partner, platform, or support issue",
  "Customer demand signal",
  "New store, channel, or market expansion",
  "Competitive pressure",
  "Budget or buying cycle",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_DTC_ALTERNATIVE_OPTIONS = [
  "Current product, service, tool, content, or process they already use",
  "Generic option in the category",
  "Different option used as a workaround",
  "Borrowing, adapting, combining, or manually doing something else",
  "Buying from a known brand",
  "Buying or signing up through a marketplace, app store, platform, or directory",
  "Waiting until the need is stronger",
  "Doing nothing",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_ALTERNATIVE_OPTIONS = [
  "Existing assortment, catalog, workflow, vendor list, or solution set",
  "Current supplier, vendor, partner, platform, or internal team",
  "Private label, in-house, white-label, or custom option",
  "Known brand, vendor, product, service, or tool already in use",
  "Comparable marketplace, app-store, platform, or category option",
  "Customer requests only",
  "Manual buying process",
  "Delaying the category, vendor, product, or workflow decision",
  "Doing nothing",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_MISSING_DTC_EVIDENCE_OPTIONS = [
  "Problem frequency",
  "Use occasion",
  "Willingness to pay",
  "Price sensitivity",
  "Product preference or feature priority",
  "Trust concern",
  "Purchase trigger",
  "Current alternative",
  "Repeat purchase potential",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_MISSING_CHANNEL_EVIDENCE_OPTIONS = [
  "Channel, catalog, workflow, or assortment fit",
  "Sell-through, adoption, usage, conversion, or repeat demand potential",
  "Margin, pricing, or economic model",
  "Target price point, budget fit, or willingness to pay",
  "Minimum order, minimum commitment, pilot size, or onboarding requirement",
  "Packaging, positioning, presentation, demo, or merchandising fit",
  "Replenishment, delivery, support, onboarding, or success requirements",
  "Buyer role or decision process",
  "Proof needed to reduce financial, inventory, brand, adoption, or delivery risk",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_CHANNEL_BUYER_WORRY_OPTIONS = [
  "Product will not sell through, get adopted, or create repeat demand",
  "Inventory, financial, adoption, or brand risk is too high",
  "Margin, pricing, or economic model is not strong enough",
  "Minimum order, minimum commitment, or onboarding burden is too high",
  "Price point or budget fit does not match the channel",
  "Packaging, positioning, demo, onboarding, display, or merchandising will not work",
  "Brand, product, service, or founder story is not strong enough",
  "Customer demand is unproven",
  "Delivery, fulfillment, replenishment, support, or onboarding will fail",
  "Quality, usage, support, cancellation, or returns will create problems",
  "Timing window will be missed",
  "Product is not differentiated enough",
  "I don't know yet",
  "Other"
];

const PRE_REVENUE_RISK_OPTIONS = [
  "Segment is too broad",
  "Weak urgency",
  "Hard to reach buyers",
  "Price sensitivity",
  "High inventory, build, delivery, support, or production risk",
  "Unclear differentiation",
  "Crowded category",
  "Pricing, margin, minimum commitment, or commercial-model mismatch",
  "Seasonal timing risk",
  "Fulfillment, implementation, support, or quality risk",
  "Weak founder credibility",
  "Need more proof before selling",
  "Other"
];

const CUSTOMER_EVIDENCE_OPTIONS = [
  "Customer interview",
  "Current customer example",
  "Past customer example",
  "Win/loss pattern",
  "CRM data",
  "Sales call notes",
  "Pipeline pattern",
  "Usage or retention data",
  "Case study",
  "Testimonial",
  "Referral pattern",
  "Market research",
  "Founder observation",
  "Assumption only",
  "Other"
];

const CUSTOMER_ACCESS_SOURCE_OPTIONS = [
  "LinkedIn search",
  "Facebook",
  "Instagram",
  "Social media posts",
  "Social media ads",
  "Industry directories",
  "Trade shows or exhibitor lists",
  "Retailer or marketplace lists",
  "Partner or supplier lists",
  "Customer referrals",
  "Founder network",
  "Communities or associations",
  "Review sites",
  "CRM / past pipeline",
  "Competitor customer lists",
  "Website traffic or inbound leads",
  "Other"
];

const CUSTOMER_FIRST_FOCUS_RISK_OPTIONS = [
  "Long sales cycle",
  "Unclear buyer, budget owner, or decision process",
  "No clear budget",
  "Low urgency",
  "Hard to reach decision makers",
  "Weak proof match",
  "Too much custom work",
  "Heavy implementation burden",
  "High inventory, adoption, usage, delivery, or sell-through risk",
  "Seasonal buying window has passed",
  "Minimum order, minimum commitment, setup, or onboarding requirement is too high",
  "Pricing, margin, budget, or commercial model does not fit the channel",
  "Packaging, positioning, onboarding, presentation, merchandising, or buying-experience fit is unclear",
  "Low margin potential",
  "Small market or hard to build a list",
  "Crowded competitive market",
  "Procurement, legal, or compliance friction",
  "Requires capabilities the team does not have yet",
  "Other"
];

const ICP_FIT_SIGNAL_OPTIONS = [
  "Urgent business pain",
  "Clear budget owner",
  "Executive sponsor identified",
  "Champion or day-to-day owner identified",
  "Active project or initiative",
  "Clear use case for the offer",
  "Strong ability to pay",
  "Similar to a successful customer",
  "High cost of inaction",
  "Reachable through current channels",
  "Implementation requirements are a good fit",
  "Referral source available",
  "Expansion potential",
  "Public trigger event",
  "Strong brand fit",
  "Right category, workflow, assortment, catalog, or solution fit",
  "Carries, uses, sells, or recommends adjacent or complementary offerings",
  "Visible product, service, workflow, or solution gap",
  "Visible customer, user, or account demand for the category",
  "Right store count, footprint, account size, team size, or channel size",
  "Can support the minimum order, commitment, setup, or onboarding requirement",
  "Product price point, budget, margin, or commercial model fits the channel",
  "Relevant seasonal buying window",
  "Merchandising, display, onboarding, positioning, or presentation fit is visible",
  "Uses a relevant system",
  "Existing relationship",
  "Growing team or new role",
  "Recent funding or investment",
  "Strategic logo value",
  "Easy to research",
  "Other"
];

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
  aiAssistance: {
    customerContextStarter: {
      mode: "adaptive_coaching",
      contextDependencies: ["companyName", "primaryOfferName", "industryLabel", "businessTypeLabel", "quickBestFitCustomer", "quickBuyerProblem"],
      evidenceRestriction: "Recommend a customer hypothesis from this company's saved context. Do not present it as customer evidence.",
      followUpRules: ["Ask for observable traits when the description is broad.", "Ask for a use case only when the answer refers to a specific use case without defining it."],
      reviewCriteria: ["Names a recognizable customer or user.", "Includes observable traits that make the group findable.", "Explains the situation, use case, or buying occasion.", "States what the customer is trying to accomplish or finds difficult."],
      coachingQuestions: ["What observable traits would help someone find or recognize this customer?", "What situation, use case, or buying occasion are they in?", "What are they trying to accomplish that is difficult today?"],
      prompt: "Draft a specific, findable customer description with situation, goal, current difficulty, and observable traits."
    },
    quickBestFitCustomer: {
      mode: "recommend_from_existing_answers",
      contextDependencies: ["customerContextStarter", "primaryOfferName", "industryLabel", "businessTypeLabel", "companyStage"],
      evidenceRestriction: "Present one focused customer hypothesis as a recommendation, not a validated ICP.",
      followUpRules: ["Ask for size, geography, category, or operating traits only when they would make the group findable."],
      reviewCriteria: ["Defines one focused group rather than a broad market.", "Uses traits that can be observed or researched.", "Is distinct enough to prioritize and reach.", "Does not present an unvalidated hypothesis as proven."],
      prompt: "Recommend one focused best-fit customer group that can be researched and reached."
    },
    quickBuyerProblem: {
      mode: "adaptive_coaching",
      contextDependencies: ["quickBestFitCustomer", "customerContextStarter", "primaryOfferName", "quickOfferPromise"],
      evidenceRestriction: "Do not claim the problem is confirmed unless saved customer evidence says so.",
      followUpRules: ["Make the problem specific to the selected customer and what the offer helps solve."],
      reviewCriteria: ["Describes the customer's current difficulty rather than the company's solution.", "Is specific to the selected customer.", "Explains the operational, financial, emotional, or practical consequence.", "Does not claim evidence that is not saved."],
      coachingQuestions: ["What is the customer trying to do when the problem occurs?", "What happens today that is frustrating, costly, slow, risky, or ineffective?", "What consequence matters enough that the customer may take action?"],
      prompt: "Recommend the most specific buyer problem supported by the saved company and customer context."
    },
    quickUrgencyNow: {
      mode: "adaptive_coaching",
      contextDependencies: ["quickBestFitCustomer", "quickBuyerProblem", "bestFitTrigger", "companyStage"],
      evidenceRestriction: "Separate a plausible urgency hypothesis from a confirmed trigger.",
      followUpRules: ["Ask what changed, what deadline exists, or what cost grows if the buyer waits."],
      reviewCriteria: ["Names a change, deadline, buying window, risk, or growing cost.", "Explains why the problem matters now rather than eventually.", "Separates a plausible hypothesis from confirmed buyer evidence."],
      coachingQuestions: ["What changed recently that could make the problem more important now?", "Is there a deadline, buying window, risk, or growing cost if the buyer waits?", "What real evidence, if any, suggests buyers care about the timing?"],
      prompt: "Recommend a concrete why-now hypothesis with an observable trigger or consequence of delay."
    },
    quickOfferPromise: {
      mode: "adaptive_coaching",
      contextDependencies: ["primaryOfferName", "quickBestFitCustomer", "quickBuyerProblem", "quickPrimaryOutcome", "quickSuccessMeasure"],
      evidenceRestriction: "Do not add outcomes, guarantees, or proof that are not saved.",
      followUpRules: ["Require a named customer, problem, and measurable outcome before treating the promise as complete."],
      reviewCriteria: ["Names the intended customer.", "Connects the offer to the customer's problem.", "States a clear outcome rather than a feature list.", "Avoids guarantees, proof, or numbers that are not saved."],
      coachingQuestions: ["Which customer is this promise specifically for?", "What problem or difficult job does the offer address?", "What meaningful outcome should the customer expect, without inventing a guarantee?"],
      prompt: "Synthesize a concise offer promise from the selected customer, problem, offer, and measurable outcome."
    },
    quickSuccessMeasure: {
      mode: "adaptive_coaching",
      contextDependencies: ["quickBuyerProblem", "quickPrimaryOutcome", "quickOfferPromise", "primaryOfferName"],
      evidenceRestriction: "Recommend a measurement method, not an invented baseline or result.",
      followUpRules: ["Ask for a unit, source, and time period when the proposed measure is vague."],
      reviewCriteria: ["Names a specific result or behavior to measure.", "Includes a unit or observable signal.", "Identifies a realistic source or method.", "Uses a time period when timing is relevant.", "Does not invent a baseline, target, or achieved result."],
      coachingQuestions: ["What result or behavior would show the buyer that this worked?", "What unit, observable signal, or data source could measure it?", "Over what period should the buyer expect to evaluate the change?"],
      prompt: "Recommend how the buyer should measure whether the promised outcome occurred."
    },
    provenCustomerOutcomes: {
      mode: "adaptive_coaching",
      contextDependencies: ["quickBestFitCustomer", "quickBuyerProblem", "quickPrimaryOutcome", "quickSuccessMeasure", "contentAssets"],
      answerOptions: ["Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Improve adoption", "Improve retention", "Improve customer satisfaction", "Improve productivity", "Reduce implementation burden", "Other measurable outcome"],
      evidenceRestriction: "Only recommend an outcome the company can support with saved evidence. If proof is not established, recommend the closest outcome to investigate and clearly treat it as unconfirmed.",
      followUpRules: ["Separate an outcome the company believes it creates from one it can currently prove.", "Prefer the outcome with the strongest measurable evidence for the priority buyer."],
      reviewCriteria: ["Matches an outcome the company can credibly support.", "Is relevant to the priority buyer and offer.", "Can be connected to a customer, result, or evidence source.", "Does not turn an assumption into proof."],
      coachingQuestions: ["What result has a customer or user actually experienced?", "What evidence supports that result: data, quote, case study, usage, review, pilot, or reference?", "Can the evidence be shared, and is it relevant to the priority buyer?"],
      prompt: "Recommend the strongest customer outcome the company can currently prove."
    },
    quickStopAvoid: {
      mode: "recommend_from_existing_answers",
      contextDependencies: ["quickBestFitCustomer", "quickBiggestConstraint", "quickPrimaryRevenueSource", "quickCurrentSalesMotion"],
      evidenceRestriction: "Frame this as a focus recommendation, not a claim about past performance.",
      followUpRules: ["Keep the recommendation to the few distractions most likely to dilute the current test."],
      reviewCriteria: ["Names a concrete activity, segment, channel, or distraction to avoid.", "Protects the current focused test.", "Is short enough to guide an actual operating decision."],
      prompt: "Recommend what the company should deliberately stop or avoid during the current GTM cycle."
    },
    preHypothesisNotes: {
      mode: "recommend_from_existing_answers",
      contextDependencies: ["customerContextStarter", "preRevenueRouteToMarket", "preValidationFocus", "preValidationChannel"],
      evidenceRestriction: "Label the rationale as a hypothesis unless direct evidence is saved.",
      followUpRules: ["Distinguish reachability, urgency, economic value, and evidence confidence."],
      reviewCriteria: ["Explains why this segment is reachable and worth testing.", "Separates assumptions from available evidence.", "Addresses urgency, economic value, and learning value without inventing proof."],
      prompt: "Explain why the selected first-win segment is worth testing before alternatives."
    },
    preMessageProofPoint: {
      mode: "adaptive_coaching",
      contextDependencies: ["customerContextStarter", "preRevenueRouteToMarket", "preValidationFocus", "preFounderBackground", "preProblemEvidenceDtc", "preProblemEvidenceChannel"],
      answerOptions: ["Founder has relevant experience", "Prototype, demo, sample, beta, concept, or mockup exists", "User, buyer, or channel feedback exists", "Comparable product, service, category, or behavior signal exists", "Clear use case or job-to-be-done", "Clear price, margin, terms, or test commitment", "Relevant community, event, channel, or buyer access", "Product difference is visible or easy to explain", "No proof yet - message should ask for feedback", "Use recommendation as written", "Other"],
      evidenceRestriction: "Do not invent traction or customer proof. Pre-revenue credibility may come from relevant experience, access, a prototype, a clear use case, or an explicit request for feedback.",
      followUpRules: ["Recommend the smallest truthful credibility cue that makes the message worth answering.", "Use no-proof-yet language when stronger evidence is not saved."],
      reviewCriteria: ["Uses a credibility cue that is true for this company.", "Fits the selected customer and validation path.", "Does not imply traction, results, or proof that has not been collected.", "Makes the first outreach more credible without overstating certainty."],
      coachingQuestions: ["What relevant experience, access, prototype, sample, or insight can you truthfully show?", "What evidence or feedback, if any, already exists?", "If there is no proof yet, what would make a short request for feedback worth answering?"],
      prompt: "Recommend one truthful proof or credibility cue for the first validation message."
    },
    preFounderBackground: {
      mode: "ask_directly",
      contextDependencies: [],
      evidenceRestriction: "Only the respondent can supply unpublished founder or team experience. Explain the question but do not invent an answer.",
      followUpRules: ["Ask for relevant experience, relationships, credibility, or access only."],
      prompt: "Explain what relevant founder or team background belongs here without proposing private facts."
    },
    quickPrimaryRevenueSource: {
      mode: "recommend_from_existing_answers",
      contextDependencies: ["quickBestFitCustomer", "quickCurrentSalesMotion", "primarySalesMotion", "customerContextStarter"],
      evidenceRestriction: "Recommend a channel to test. Do not claim it is proven unless results are saved.",
      followUpRules: ["Explain why the source can reach the selected customer and fit available capacity."],
      reviewCriteria: ["Names where the customer can be reached rather than how the sale is conducted.", "Fits the selected customer and available access.", "Can be tested consistently for 30 days.", "Does not claim the channel is proven without saved results."],
      uncertaintyQuestions: ["Where does the target customer already look for products, solutions, or advice?", "What audience, relationships, list, community, location, or platform can the company access now?", "Which source can the team realistically test every week for the next 30 days?"],
      prompt: "Recommend one primary opportunity source for the current focused GTM test."
    },
    quickCurrentSalesMotion: {
      mode: "recommend_from_existing_answers",
      contextDependencies: ["quickBestFitCustomer", "quickPrimaryRevenueSource", "primarySalesMotion", "companyStage", "teamSize"],
      evidenceRestriction: "Recommend an operating motion, not a channel, and do not imply it is already working.",
      followUpRules: ["Clarify who performs the selling and how the buyer moves toward purchase."],
      reviewCriteria: ["Describes who performs the selling and how the buyer moves toward purchase.", "Is distinct from the channel or source.", "Fits the buying process and current team capacity.", "Does not imply the motion is proven without saved results."],
      uncertaintyQuestions: ["Who will perform the selling or guide the purchase during the next 30 days?", "Does the buyer need a conversation, evaluation, approval process, or can they purchase without sales help?", "How much selling capacity does the team actually have each week?"],
      prompt: "Recommend one sales motion that is distinct from the selected channel and realistic for the team."
    },
    quick90DayGoal: {
      mode: "recommend_from_existing_answers",
      contextDependencies: ["companyStage", "quickBestFitCustomer", "quickBuyerProblem", "quickPrimaryOutcome", "quickBiggestConstraint"],
      evidenceRestriction: "Recommend a focus for the next 90 days, not an invented performance commitment.",
      followUpRules: ["Choose the result that would most reduce uncertainty or unlock progress."],
      reviewCriteria: ["Names one result or decision for the next 90 days.", "Addresses the current constraint or highest-value uncertainty.", "Is realistic for the team's capacity.", "Does not invent a performance commitment."],
      uncertaintyQuestions: ["What is the most important decision the company needs to make within 90 days?", "Which result would remove the biggest current constraint?", "What can the current team realistically influence during this period?"],
      prompt: "Recommend the single 90-day goal that would create the most useful GTM progress or evidence."
    },
    quickBiggestConstraint: {
      mode: "adaptive_coaching",
      contextDependencies: ["companyStage", "quickBestFitCustomer", "quickBuyerProblem", "quickOfferPromise", "quickPrimaryRevenueSource", "quickCurrentSalesMotion", "teamSize"],
      evidenceRestriction: "Recommend the most likely current constraint and label it as a recommendation unless the respondent confirms it.",
      followUpRules: ["Distinguish the root constraint from its symptoms."],
      reviewCriteria: ["Names one root constraint rather than several symptoms.", "Can be influenced during the next 90 days.", "Is consistent with the customer, offer, channel, motion, and team context.", "Is labeled as a recommendation unless confirmed by the respondent."],
      uncertaintyQuestions: ["What repeatedly prevents the company from reaching or converting the right customer?", "Which bottleneck can the team influence during the next 90 days?", "What would remain blocked even if the team simply increased activity?"],
      prompt: "Recommend the single root GTM constraint that should be addressed before adding more activity."
    }
  },
  sections: [
    {
      id: "company",
      title: "Company Information",
      description: "Baseline company context, public presence, current sales channels, and GTM systems.",
      helpBlocks: HELP_BLOCKS.company,
      fields: [
        { id: "companyName", label: "Company name", type: "text", required: true, quick: true },
        { id: "website", label: "Primary website URL", type: "url", placeholder: "https://example.com", quick: true },
        { id: "toolMode", label: "Which version of GTM Intelligence OS should this use?", type: "select", options: ["GTM Readiness", "Pre-Revenue Validation"], hint: "Use Pre-Revenue Validation when the company is still testing customer, problem, offer, and channel hypotheses before repeatable revenue." },
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
            { id: "quickPrimaryRevenueSource", label: "Primary revenue source today", type: "select", options: ["Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Social media posts", "Social media ads", "Website conversion / booking flow", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Network referrals", "Customer referrals", "Trade shows", "Partners / affiliates / resellers", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Retail / field / local selling", "Other", "Not sure yet"] },
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
            { id: "quick90DayGoal", label: "Primary GTM goal for the next 90 days", type: "select", options: ["Customer validation", "Lead flow", "Revenue", "Retention", "Expansion", "Strategic reference customer", "Category awareness", "Systems / process improvement", "Hiring / team capacity", "Other", "Not sure yet"] },
            { id: "quick90DayRevenueTarget", label: "90-day revenue target", type: "money", required: true, showWhen: { field: "quick90DayGoal", value: "Revenue" }, placeholder: "Example: 100000", hint: "Required when Revenue is the 90-day goal. Enter the revenue amount you want to create or close in the next 90 days." },
            { id: "quick90DaySuccessMetric", label: "How will you know the next 90 days worked?", type: "text", placeholder: "Example: 20 qualified demos, $100k pipeline created, 5 expansion opportunities, 3 customer interviews." },
            { id: "quickBiggestConstraint", label: "Biggest GTM constraint", type: "select", options: ["Focus", "ICP clarity", "Messaging", "Proof", "Budget", "Team capacity", "Sales process", "Channel access", "Data quality", "Product readiness", "Implementation capacity", "Technology / systems", "Other", "Not sure yet"] },
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
      id: "preRevenueContext",
      title: "Pre-Revenue Context",
      description: "Frame the company as a validation project: what exists today, what capacity is available, and what has already been learned.",
      preRevenue: true,
      cards: [
        {
          title: "Founder and Product Context",
          description: "Capture the starting point before asking for evidence the company may not have yet.",
          fields: [
            { id: "preFounderBackground", label: "Founder or team background relevant to this market", type: "textarea", full: true, placeholder: "Example: Founder has 10 years selling to operators in consumer products." },
            { id: "preProductStage", label: "Product or solution stage", type: "select", otherLabel: "Define other product or solution stage", requireOther: true, options: ["Idea only", "Prototype", "MVP", "Manual service / concierge version", "Pilot-ready", "Live but no paying customers", "Other"] },
            { id: "preOfferStage", label: "Current offer stage", type: "select", otherLabel: "Define other offer stage", requireOther: true, options: ["No defined offer yet", "Problem hypothesis only", "Draft first validation offer", "Pilot / design partner offer", "Paid beta offer", "Preorder / waitlist offer", "Packaged offer but unvalidated", "Other"] },
            { id: "preRevenueRouteToMarket", label: "Likely route to market to validate", type: "multiSelectDropdown", hint: "Select all that apply. Some products may need to validate both end-user demand and a channel, partner, or business-buyer path.", otherLabel: "Define other route to market", requireOther: true, options: CUSTOMER_ROUTE_TO_MARKET_OPTIONS },
            { id: "preValidationFocus", label: "What are you trying to validate first?", type: "multiSelectDropdown", otherLabel: "Define other validation focus", requireOther: true, options: PRE_REVENUE_VALIDATION_FOCUS_OPTIONS },
            { id: "preWeeklyCapacity", label: "Weekly founder/team capacity for validation", type: "select", options: ["0-2 hours", "3-5 hours", "6-10 hours", "11-20 hours", "20+ hours"] },
            { id: "preExistingAccess", label: "Existing network or audience access", type: "multiSelectDropdown", otherLabel: "Define other access source", requireOther: true, options: ["Founder network", "Past customers", "Industry relationships", "LinkedIn audience", "Email list", "Community access", "Advisor / investor intros", "Partner access", "Events", "No clear access yet", "Other"] },
            { id: "preKnownConstraints", label: "Known constraints for validation", type: "multiSelectDropdown", otherLabel: "Define other validation constraint", requireOther: true, options: ["Limited time", "Limited capital", "No product yet", "Unclear buyer", "Unclear problem", "No audience", "Weak category knowledge", "Need technical build", "Need regulatory clarity", "Other"] }
          ]
        }
      ]
    },
    {
      id: "preRevenueHypotheses",
      title: "Think Big, Start Small",
      description: "Find your first market, focus your GTM, and generate early revenue.",
      preRevenue: true,
      introBlocks: [
        {
          title: "Do not start by declaring an ICP",
          body: "Start with the broad market or product category this could fit into, then break it into candidate first-win customer segments. The ICP draft is an output of this narrowing process, not the starting answer."
        },
        {
          title: "What this module produces",
          body: "This module compares first-win segment hypotheses by pain, urgency, reachability, credibility, validation speed, and delivery fit. It should help identify the fastest credible path to market learning and early revenue."
        }
      ],
      content: [
        {
          title: "Start With the Customer Context",
          hint: "Write the richest version of the customer, user, or buyer you want to reach. The structured questions that follow will turn this into a testable ICP.",
          fields: [
            { id: "customerContextStarter", label: "Describe the customer, user, or buyer you most want to reach", type: "textarea", full: true, hint: "Include who they are, the situation they are in, what they are trying to do, what is difficult today, and details that would help find more of them. This is source context for the structured ICP questions below.", placeholder: "Add a detailed customer description or generate a company-specific example below." }
          ]
        },
        {
          title: "Step 1: Think Big",
          hint: "Capture the broad market or product category before narrowing. Avoid using this as the final ICP.",
          fields: [
            { id: "preBroadMarket", label: "What broad market or product category could this fit into?", type: "multiSelectDropdown", full: true, otherLabel: "Define other broad market or category", requireOther: true, options: PRE_REVENUE_BROAD_MARKET_OPTIONS },
            { id: "preBroadMarketUnknownUse", label: "If you do not know the broad market yet, where would the product most naturally be used, bought, accessed, or adopted?", type: "multiSelectDropdown", full: true, showWhen: { field: "preBroadMarket", contains: "I don't know yet" }, otherLabel: "Define other use context", requireOther: true, options: ["At home", "At work", "On the go", "Online", "In a store or venue", "Inside a business workflow", "During a task, event, or activity", "As part of a hobby, community, or interest", "Through a marketplace, app store, or platform", "As a gift or special purchase", "Other"] },
            { id: "preBroadMarketUnknownComparable", label: "What existing category, website section, marketplace listing, app-store category, workflow, or buying context would it sit near?", type: "text", full: true, showWhen: { field: "preBroadMarket", contains: "I don't know yet" }, placeholder: "Example: personal productivity app, specialty food, pet care, home services, ecommerce tool, training program, outdoor gear, or local experience." },
            { id: "preBroadMarketProblem", label: "What demand, buying job, or unmet need might this product address?", type: "multiSelectDropdown", full: true, otherLabel: "Define other demand, buying job, or unmet need", requireOther: true, options: PRE_REVENUE_PRODUCT_PROBLEM_OPTIONS },
            { id: "preProblemUnknownMoment", label: "If you do not know the problem yet, when would someone notice they might need this?", type: "multiSelectDropdown", full: true, showWhen: { field: "preBroadMarketProblem", contains: "I don't know yet" }, otherLabel: "Define other moment", requireOther: true, options: ["Before a task, event, or activity", "During a task, event, or activity", "After a task, event, or activity", "When replacing or upgrading something", "When shopping for themselves or someone else", "When preparing for a season, launch, deadline, or change", "When stocking, sourcing, planning, or selecting options", "When a current option fails", "Other"] },
            { id: "preProblemUnknownAlternative", label: "What do they use, buy, access, hire, subscribe to, or do today instead?", type: "text", full: true, showWhen: { field: "preBroadMarketProblem", contains: "I don't know yet" }, placeholder: "Example: generic product, spreadsheet, current supplier, manual process, known app, marketplace option, consultant, existing vendor, or doing nothing." },
            { id: "preBroadCustomerTypes", label: "What buyer or customer types could exist inside this market or category?", type: "multiSelectDropdown", full: true, otherLabel: "Define other customer type", requireOther: true, options: PRE_REVENUE_CUSTOMER_TYPE_OPTIONS },
            { id: "preCustomerTypesUnknownUser", label: "If you do not know the customer type yet, who would use, consume, access, adopt, approve, recommend, or benefit from the product?", type: "text", full: true, showWhen: { field: "preBroadCustomerTypes", contains: "I don't know yet" }, placeholder: "Example: end users, parents, operators, team leads, hobbyists, creators, store buyers, administrators, or service providers." },
            { id: "preCustomerTypesUnknownBuyer", label: "Who might pay for it, approve it, recommend it, or decide to carry it?", type: "multiSelectDropdown", full: true, showWhen: { field: "preBroadCustomerTypes", contains: "I don't know yet" }, otherLabel: "Define other possible buyer", requireOther: true, options: PRE_REVENUE_BUYER_ROLE_OPTIONS },
            { id: "preFirstCustomerTypes", label: "Which customer types could realistically be first?", type: "multiSelectDropdown", full: true, otherLabel: "Define other first customer type", requireOther: true, options: PRE_REVENUE_CUSTOMER_TYPE_OPTIONS },
            { id: "preFirstCustomerUnknownAccess", label: "If you do not know who should be first, which group can you reach fastest for feedback?", type: "multiSelectDropdown", full: true, showWhen: { field: "preFirstCustomerTypes", contains: "I don't know yet" }, otherLabel: "Define other reachable group", requireOther: true, options: ["People in founder network", "Existing audience", "Local customers or users", "Online community", "Social media followers", "Small businesses or teams", "Channel buyers or partners", "Marketplace participants", "Industry contacts", "Friends of friends", "Other"] },
            { id: "preFirstCustomerUnknownProof", label: "Which group could give you the clearest signal in the next 30 days?", type: "multiSelectDropdown", full: true, showWhen: { field: "preFirstCustomerTypes", contains: "I don't know yet" }, otherLabel: "Define other signal group", requireOther: true, options: ["People willing to give feedback", "People willing to join a waitlist", "People willing to preorder, deposit, subscribe, or sign up", "Buyers willing to review a concept, demo, sample, or pilot", "Buyers willing to discuss price, terms, or requirements", "A community willing to react to the product", "A small test audience with visible behavior", "Other"] },
            { id: "preThinkBigNotes", label: "Anything important that the dropdowns did not capture?", type: "textarea", full: true, placeholder: "Use this only for important nuance, not as the main answer." }
          ]
        },
        {
          title: "Step 2: Start Small",
          hint: "Add 2-5 possible first-win segments. Do not use one broad 'everyone' segment as the only option.",
          tables: [
            {
              id: "preCustomerHypotheses",
              title: "",
              layout: "cards",
              repeatable: true,
              rowLabel: "First-Win Segment",
              minRows: 2,
              maxRows: 5,
              addLabel: "Add another candidate segment",
              columns: [
                { id: "segmentName", label: "Which first customer type are you narrowing into this candidate segment?", type: "select", group: "Segment", optionsFromMultiselect: "preFirstCustomerTypes", otherLabel: "Define a more specific segment", requireOther: true, options: ["End users with a specific use case", "Problem-aware buyers", "Hobbyists or enthusiasts", "Small businesses or teams", "Channel buyers or partners", "Marketplace participants", "I don't know yet", "Other"] },
                { id: "segmentNameUnknown", label: "If you do not know the first segment yet, who is easiest to reach for a first validation conversation?", type: "multiSelectDropdown", group: "Segment", full: true, showWhen: { field: "segmentName", value: "I don't know yet" }, otherLabel: "Define other first conversation target", requireOther: true, options: ["People in founder network", "Existing social audience", "Local customers or users", "Online community members", "Small businesses or teams", "Channel buyers or partners", "Marketplace participants", "Industry contacts", "Friends of friends", "Other"] },
                { id: "description", label: "Which observable traits define this segment?", type: "multiSelectDropdown", group: "Segment", full: true, otherLabel: "Define other observable trait", requireOther: true, options: ["Specific use case, job, task, or occasion", "Specific product, service, software, or solution category", "Specific lifestyle, workflow, identity, or goal", "Specific geography", "Specific price point or budget range", "Specific age, life stage, company stage, or maturity level", "Specific community, industry, role, or interest group", "Specific buyer type, account type, or channel type", "Specific buying window, season, deadline, or trigger", "Specific channel, marketplace, platform, or source", "Other"] },
                { id: "specificUseCaseDefinition", label: "Briefly define the specific use case, job, task, or occasion", type: "textarea", group: "Segment", full: true, required: true, showWhen: { field: "description", contains: "Specific use case, job, task, or occasion" }, hint: "Describe who is in the situation, what they are trying to do, and what better outcome they want. This becomes the plain-language use case in the ICP Brief.", placeholder: "Describe the person or organization, the situation, the job or activity, and the better outcome they want." },
                { id: "problem", label: "What painful problem, buying job, or unmet need do they have that your product helps with?", type: "multiSelectDropdown", group: "Segment", full: true, otherLabel: "Define other problem or unmet need", requireOther: true, options: PRE_REVENUE_PRODUCT_PROBLEM_OPTIONS },
                { id: "problemUnknown", label: "If you do not know the problem yet, what current option, supplier, tool, workflow, workaround, or situation might be unsatisfying?", type: "text", group: "Segment", full: true, showWhen: { field: "problem", contains: "I don't know yet" }, placeholder: "Example: current product lacks key features, current software is too manual, current supplier is unreliable, current process is slow, or current category options feel undifferentiated." },
                { id: "whyNow", label: "Why would they care now?", type: "multiSelectDropdown", group: "Segment", full: true, otherLabel: "Define other timing reason", requireOther: true, options: PRE_REVENUE_WHY_NOW_OPTIONS },
                { id: "whyNowUnknown", label: "If you do not know the timing reason yet, what event, season, deadline, workflow change, shopping moment, or buying window might create urgency?", type: "text", group: "Segment", full: true, showWhen: { field: "whyNow", contains: "I don't know yet" }, placeholder: "Example: seasonal need, product launch, category reset, budget cycle, event, workflow change, gift season, compliance deadline, or market trend." },
                { id: "likelyBuyerPath", label: "Which buying path applies to this segment?", type: "select", group: "Segment", options: ["", "Direct to consumer / end user", "Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] },
                { id: "likelyBuyerDtc", label: "For DTC, who would likely buy, use, influence, or recommend the product?", type: "multiSelectDropdown", group: "Segment", full: true, showWhen: { field: "likelyBuyerPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC buyer or influencer", requireOther: true, options: PRE_REVENUE_DTC_BUYER_ROLE_OPTIONS },
                { id: "likelyBuyerChannel", label: "For retail, wholesale, marketplace, or corporate sales, who would likely approve, buy, or carry the product?", type: "multiSelectDropdown", group: "Segment", full: true, showWhen: { field: "likelyBuyerPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel buyer or approver", requireOther: true, options: PRE_REVENUE_CHANNEL_BUYER_ROLE_OPTIONS },
                { id: "likelyBuyerUnknown", label: "If you do not know the buyer yet, who could you ask first to identify the decision path?", type: "multiSelectDropdown", group: "Segment", full: true, showWhen: { field: "likelyBuyerPath", value: "Mixed or not sure yet" }, otherLabel: "Define other person to ask", requireOther: true, options: ["Target end user", "Current category buyer", "Business owner or operator", "Functional team lead", "Channel buyer or partner", "Marketplace participant", "Industry expert", "Community influencer", "Founder network contact", "Other"] },
                { id: "reachability", label: "How would you identify and reach them?", type: "multiSelectDropdown", group: "Reach and credibility", full: true, otherLabel: "Define other reach path", requireOther: true, options: PRE_REVENUE_REACHABILITY_OPTIONS },
                { id: "reachabilityUnknown", label: "If you do not know how to reach them yet, where could you find 10 names, profiles, accounts, groups, communities, or channels to test?", type: "text", group: "Reach and credibility", full: true, showWhen: { field: "reachability", contains: "I don't know yet" }, placeholder: "Example: social media search, local businesses, online communities, app-store reviews, marketplace sellers, trade show lists, LinkedIn search, association directory, or founder contacts." },
                { id: "credibility", label: "Why would they trust you or take a meeting?", type: "multiSelectDropdown", group: "Reach and credibility", full: true, otherLabel: "Define other credibility source", requireOther: true, options: PRE_REVENUE_CREDIBILITY_OPTIONS },
                { id: "credibilityUnknown", label: "If you do not know your credibility yet, what could make the first conversation feel worth their time?", type: "multiSelectDropdown", group: "Reach and credibility", full: true, showWhen: { field: "credibility", contains: "I don't know yet" }, otherLabel: "Define other credibility builder", requireOther: true, options: ["Prototype, demo, sample, mockup, or concept", "Founder story", "Specific product insight", "Relevant community, industry, or role connection", "Clear problem hypothesis", "Short feedback ask", "Potential revenue, margin, adoption, efficiency, or outcome story", "Useful research or trend insight", "Other"] },
                { id: "validationPathDtc", label: "For DTC, how could you validate this specific customer segment in the next 30 days?", type: "multiSelectDropdown", group: "Validation", full: true, showWhen: { field: "likelyBuyerPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC validation path", requireOther: true, options: PRE_REVENUE_DTC_VALIDATION_PATH_OPTIONS },
                { id: "validationPathDtcUnknown", label: "If you do not know how to test the DTC segment yet, what is the smallest consumer signal you could ask for?", type: "multiSelectDropdown", group: "Validation", full: true, showWhen: { field: "validationPathDtc", contains: "I don't know yet" }, otherLabel: "Define other DTC test signal", requireOther: true, options: ["Answer 5 interview questions", "React to a concept, demo, sample, image, or mockup", "Try a prototype, beta, sample, or concierge version", "Join a waitlist", "Preorder, subscribe, sign up, or place a deposit", "Share target price feedback", "Share with a friend or colleague", "Follow or subscribe for updates", "Other"] },
                { id: "validationPathChannel", label: "For retail, wholesale, marketplace, or corporate sales, how could you validate this segment in the next 30 days?", type: "multiSelectDropdown", group: "Validation", full: true, showWhen: { field: "likelyBuyerPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel validation path", requireOther: true, options: PRE_REVENUE_CHANNEL_VALIDATION_PATH_OPTIONS },
                { id: "validationPathChannelUnknown", label: "If you do not know how to test the channel segment yet, what is the smallest buyer signal you could ask for?", type: "multiSelectDropdown", group: "Validation", full: true, showWhen: { field: "validationPathChannel", contains: "I don't know yet" }, otherLabel: "Define other channel test signal", requireOther: true, options: ["Review a concept, demo, sample, pilot, or beta", "Request product details, pricing, terms, or a proposal", "Give pricing, margin, onboarding, or operating-model feedback", "Identify where it would fit in the catalog, workflow, channel, or account base", "Introduce the right buyer or stakeholder", "Consider a small order, pilot, beta, or limited launch", "Other"] },
                { id: "deliveryFit", label: "Can you realistically serve this segment now?", type: "select", group: "Validation", otherLabel: "Define other delivery fit", requireOther: true, options: ["Not sure yet", "No, current product or operations cannot support them", "Maybe, but only with a narrow test", "Yes, with a small batch or manual process", "Yes, current product and operations can support them", "Other"] },
                { id: "revenuePotentialContext", label: "If this segment bought, would the opportunity be meaningful enough to matter?", type: "select", group: "Context", otherLabel: "Define other revenue potential", requireOther: true, options: ["Not sure yet", "Low: small or hard to repeat", "Medium: useful learning and possible early revenue", "High: meaningful revenue and repeatable path", "Strategic: strong proof or channel value even before revenue", "Other"] },
                { id: "risks", label: "What would make this segment hard to win or serve?", type: "multiSelectDropdown", group: "Risks", full: true, otherLabel: "Define other risk", requireOther: true, options: PRE_REVENUE_RISK_OPTIONS },
                { id: "assumptions", label: "What are you assuming about this segment?", type: "multiSelectDropdown", group: "Assumptions vs. Evidence", full: true, otherLabel: "Define other assumption", requireOther: true, options: ["They have the problem", "They know they have the problem", "They care enough to act", "They can afford the product", "They will trust a new brand", "They can be reached through current channels", "They will buy online", "Retailers will carry the product", "The price point works", "The product is differentiated enough", "The buying season is still open", "The team can fulfill demand", "Other"] },
                { id: "evidenceAvailableDtc", label: "For DTC, what consumer evidence is available?", type: "multiSelectDropdown", group: "Assumptions vs. Evidence", full: true, showWhen: { field: "likelyBuyerPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC evidence", requireOther: true, options: PRE_REVENUE_DTC_EVIDENCE_OPTIONS },
                { id: "evidenceAvailableDtcUnknown", label: "If you do not know the DTC evidence yet, what is the easiest evidence to collect first?", type: "multiSelectDropdown", group: "Assumptions vs. Evidence", full: true, showWhen: { field: "evidenceAvailableDtc", contains: "I don't know yet" }, otherLabel: "Define other DTC evidence to collect", requireOther: true, options: ["Buyer or user interview", "Concept, demo, sample, image, or mockup reaction", "Prototype, beta, sample, or concierge feedback", "Waitlist signup", "Price feedback", "Social post or content reaction", "Survey response", "Preorder, deposit, signup, or subscription intent", "Other"] },
                { id: "evidenceAvailableChannel", label: "For retail, wholesale, marketplace, or corporate sales, what buyer or channel evidence is available?", type: "multiSelectDropdown", group: "Assumptions vs. Evidence", full: true, showWhen: { field: "likelyBuyerPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel evidence", requireOther: true, options: PRE_REVENUE_CHANNEL_EVIDENCE_OPTIONS },
                { id: "evidenceAvailableChannelUnknown", label: "If you do not know the channel evidence yet, what is the easiest buyer evidence to collect first?", type: "multiSelectDropdown", group: "Assumptions vs. Evidence", full: true, showWhen: { field: "evidenceAvailableChannel", contains: "I don't know yet" }, otherLabel: "Define other channel evidence to collect", requireOther: true, options: ["Channel buyer, partner, or account conversation", "Concept, demo, sample, pilot, or beta review request", "Product details, pricing, terms, or proposal request", "Channel, catalog, workflow, or audience-fit feedback", "Pricing, margin, onboarding, or operating-model feedback", "Small order, pilot, beta, or limited launch interest", "Other"] },
                { id: "evidenceNotes", label: "Evidence notes", type: "textarea", group: "Assumptions vs. Evidence", full: true },
                { id: "buyingRequirements", label: "Who has to believe this is worth buying or carrying?", type: "multiSelectDropdown", group: "What must be true", full: true, otherLabel: "Define other buying requirement", requireOther: true, options: PRE_REVENUE_BUYER_ROLE_OPTIONS },
                { id: "implementationRequirements", label: "What would need to be true for delivery, fulfillment, onboarding, or use?", type: "multiSelectDropdown", group: "What must be true", full: true, otherLabel: "Define other delivery requirement", requireOther: true, options: ["Prototype, demo, sample, beta, or first version is ready", "Small batch, pilot, beta, or manual delivery can work", "Supplier, platform, partner, or team can support delivery", "Quality, reliability, or experience is consistent enough", "Packaging, onboarding, instructions, or setup are clear enough", "Fulfillment, access, implementation, or support can work", "Returns, cancellations, refunds, or exchanges can be handled", "Commercial terms are workable", "Minimum order, minimum commitment, or onboarding effort is workable", "Customer onboarding is simple", "No special implementation required", "Other"] },
                { id: "riskRequirementsDtc", label: "For DTC, what would the consumer worry could go wrong?", type: "multiSelectDropdown", group: "What must be true", full: true, showWhen: { field: "likelyBuyerPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC buyer worry", requireOther: true, options: PRE_REVENUE_DTC_BUYER_WORRY_OPTIONS },
                { id: "riskRequirementsDtcUnknown", label: "If you do not know the DTC worry yet, what concern should you test first?", type: "multiSelectDropdown", group: "What must be true", full: true, showWhen: { field: "riskRequirementsDtc", contains: "I don't know yet" }, otherLabel: "Define other DTC concern to test", requireOther: true, options: ["Quality, reliability, or outcome", "Fit, usability, setup, taste, comfort, or experience", "Price or value", "Trust", "Delivery, access, setup, or support", "Cancellation, returns, refunds, or exchanges", "Proof or reviews", "Product difference", "Other"] },
                { id: "riskRequirementsChannel", label: "For retail, wholesale, marketplace, or corporate sales, what would the buyer worry could go wrong?", type: "multiSelectDropdown", group: "What must be true", full: true, showWhen: { field: "likelyBuyerPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel buyer worry", requireOther: true, options: PRE_REVENUE_CHANNEL_BUYER_WORRY_OPTIONS },
                { id: "riskRequirementsChannelUnknown", label: "If you do not know the channel worry yet, what concern should you test first?", type: "multiSelectDropdown", group: "What must be true", full: true, showWhen: { field: "riskRequirementsChannel", contains: "I don't know yet" }, otherLabel: "Define other channel concern to test", requireOther: true, options: ["Sell-through, adoption, usage, or repeat demand", "Margin, pricing, or economic model", "Minimum order, minimum commitment, or onboarding effort", "Price point or budget fit", "Packaging, positioning, demo, onboarding, display, or merchandising", "Inventory, financial, brand, adoption, or delivery risk", "Replenishment, delivery, support, onboarding, or success requirements", "Customer demand proof", "Other"] },
                { id: "timingRequirements", label: "What event, deadline, budget cycle, or pressure would create action?", type: "multiSelectDropdown", group: "What must be true", full: true, otherLabel: "Define other timing requirement", requireOther: true, options: PRE_REVENUE_WHY_NOW_OPTIONS },
                { id: "successRequirements", label: "What would count as a successful validation signal for this segment?", type: "multiSelectDropdown", group: "What must be true", full: true, otherLabel: "Define other success signal", requireOther: true, options: ["Target buyer confirms the problem is real", "Target buyer says the product is clearly different or better", "Buyer or user joins a waitlist", "Buyer preorders, subscribes, signs up, or places a deposit", "Buyer reacts positively to a concept, prototype, demo, sample, or beta", "Buyer says the price feels reasonable", "Channel buyer requests product details, pricing, terms, proposal, demo, or sample", "Channel buyer says the product fits the catalog, workflow, audience, or assortment", "Channel buyer agrees to a test order, pilot, beta, or limited launch", "Partner, distributor, or marketplace buyer asks for next-step information", "Product sells, converts, gets used, or gets adopted in a small test", "Buyer requests a reorder, renewal, repeat purchase, or expanded use", "Acquisition cost or outreach effort looks workable", "I don't know yet", "Other"] },
                { id: "successRequirementsUnknown", label: "If you do not know the success signal yet, what action would prove this segment is worth another test?", type: "multiSelectDropdown", group: "What must be true", full: true, showWhen: { field: "successRequirements", contains: "I don't know yet" }, otherLabel: "Define other next-test signal", requireOther: true, options: ["Agrees to a short interview", "Responds to outreach", "Reviews a concept, prototype, demo, sample, or beta", "Shares price feedback", "Joins a waitlist", "Preorders, subscribes, signs up, or places a deposit", "Asks for pricing, terms, product details, proposal, or demo", "Requests a sample, pilot, beta, or review", "Introduces another buyer or stakeholder", "Agrees to a small order, pilot, beta, or limited launch", "Other"] },
                { id: "problemIntensity", label: "Problem intensity", type: "scoreSelect", group: "Score", options: ["Vague or nice-to-have problem", "Problem exists but is not urgent", "Clear problem with some business impact", "Painful problem tied to time, money, growth, or risk", "Urgent, expensive, frequent, and clearly recognized problem"] },
                { id: "urgencyTrigger", label: "Urgency / trigger", type: "scoreSelect", group: "Score", options: ["No clear timing reason", "Possible timing reason but weak", "Plausible trigger exists", "Clear trigger or event can create action", "Strong observable trigger creates near-term urgency"] },
                { id: "reachabilityScore", label: "Reachability", type: "scoreSelect", group: "Score", options: ["Buyers are hard to identify and reach", "Some buyers can be identified, but access is weak", "Buyers are identifiable and reachable with effort", "Buyers can be reached through known channels, communities, referrals, or lists", "Strong access exists through network, relationships, communities, or clear channels"] },
                { id: "credibilityRightToWin", label: "Credibility / right to win", type: "scoreSelect", group: "Score", options: ["No obvious credibility", "Weak credibility or generic claim", "Plausible credibility through founder insight, prototype, or domain knowledge", "Strong credibility through experience, relationships, or proof by proxy", "Direct credibility through domain authority, trusted network, design partner interest, or relevant experience"] },
                { id: "validationSpeed", label: "Validation speed", type: "scoreSelect", group: "Score", options: ["Hard to test within 30-60 days", "Test path exists but is slow or unclear", "Can run interviews or outreach within 30 days", "Can test message, product reaction, buyer interest, or next-step commitment within 30 days", "Immediate access to target buyers and a clear test path exists"] },
                { id: "deliveryFitScore", label: "Delivery fit", type: "scoreSelect", group: "Score", options: ["Current team/product cannot serve this segment", "Major delivery risk", "Possible with manual effort or narrow scope", "Good fit with current capabilities", "Strong fit; segment can be served quickly and create proof"] }
              ]
            }
          ]
        },
        {
          title: "Step 3: Choose and Validate",
          fields: [
            { id: "prePrimaryHypothesis", label: "Which candidate segment do you believe should be tested first?", type: "select", dynamicOptionsFrom: "preCustomerHypotheses", options: ["Not sure yet"], hint: "The report will still score and recommend a first-win segment. Use this to capture your current belief." },
            { id: "preHypothesisReason", label: "Why do you believe this segment should be first?", type: "multiSelectDropdown", full: true, otherLabel: "Define other reason", requireOther: true, options: ["Easiest to reach", "Strongest problem fit", "Fastest validation path", "Lowest cost to test", "Best founder credibility", "Best early revenue potential", "Best proof opportunity", "Best DTC demand signal", "Best wholesale / retail path", "Lowest delivery risk", "Most urgent timing", "Not sure yet", "Other"] },
            { id: "preHypothesisNotes", label: "Any notes about why this segment should be tested first?", type: "textarea", full: true }
          ]
        }
      ]
    },
    {
      id: "preRevenueProblem",
      title: "Problem and Urgency Hypothesis",
      description: "Define what might be painful enough for the first customer group to take action.",
      preRevenue: true,
      cards: [
        {
          title: "Problem Hypothesis",
          fields: [
            { id: "preProblemHypothesisDtc", label: "For DTC, what consumer problem, buying job, or unmet need might your product help with?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["End consumer / direct-to-consumer buyer", "Influencer, recommender, or community gatekeeper"] }, otherLabel: "Define other DTC problem", requireOther: true, options: PRE_REVENUE_DTC_PROBLEM_OPTIONS },
            { id: "prePainMechanismDtc", label: "For DTC, what would make the consumer care enough to consider buying?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["End consumer / direct-to-consumer buyer", "Influencer, recommender, or community gatekeeper"] }, otherLabel: "Define other DTC buying motivation", requireOther: true, options: PRE_REVENUE_DTC_PAIN_MECHANISM_OPTIONS },
            { id: "preUrgencyTriggerDtc", label: "For DTC, what might trigger action now?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["End consumer / direct-to-consumer buyer", "Influencer, recommender, or community gatekeeper"] }, otherLabel: "Define other DTC trigger", requireOther: true, options: PRE_REVENUE_DTC_URGENCY_OPTIONS },
            { id: "preCurrentWorkaroundDtc", label: "For DTC, what alternative might the consumer use or buy today?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["End consumer / direct-to-consumer buyer", "Influencer, recommender, or community gatekeeper"] }, otherLabel: "Define other DTC alternative", requireOther: true, options: PRE_REVENUE_DTC_ALTERNATIVE_OPTIONS },
            { id: "preProblemEvidenceDtc", label: "For DTC, what consumer evidence do you already have?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["End consumer / direct-to-consumer buyer", "Influencer, recommender, or community gatekeeper"] }, otherLabel: "Define other DTC evidence", requireOther: true, options: PRE_REVENUE_DTC_EVIDENCE_OPTIONS },
            { id: "preMissingEvidenceDtc", label: "For DTC, what consumer evidence is still missing?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["End consumer / direct-to-consumer buyer", "Influencer, recommender, or community gatekeeper"] }, otherLabel: "Define other missing DTC evidence", requireOther: true, options: PRE_REVENUE_MISSING_DTC_EVIDENCE_OPTIONS },
            { id: "preProblemHypothesisChannel", label: "For retail, wholesale, marketplace, distributor, or business sales, what buyer problem or buying job might your product help with?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["Retail / wholesale buyer", "Distributor or channel partner", "Marketplace buyer", "Business buyer"] }, otherLabel: "Define other channel problem", requireOther: true, options: PRE_REVENUE_CHANNEL_PROBLEM_OPTIONS },
            { id: "prePainMechanismChannel", label: "For retail, wholesale, marketplace, distributor, or business sales, what would make the buyer care enough to evaluate, carry, or test it?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["Retail / wholesale buyer", "Distributor or channel partner", "Marketplace buyer", "Business buyer"] }, otherLabel: "Define other channel buying motivation", requireOther: true, options: PRE_REVENUE_CHANNEL_PAIN_MECHANISM_OPTIONS },
            { id: "preUrgencyTriggerChannel", label: "For retail, wholesale, marketplace, distributor, or business sales, what might trigger action now?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["Retail / wholesale buyer", "Distributor or channel partner", "Marketplace buyer", "Business buyer"] }, otherLabel: "Define other channel trigger", requireOther: true, options: PRE_REVENUE_CHANNEL_URGENCY_OPTIONS },
            { id: "preCurrentWorkaroundChannel", label: "For retail, wholesale, marketplace, distributor, or business sales, what alternative might the buyer use or buy today?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["Retail / wholesale buyer", "Distributor or channel partner", "Marketplace buyer", "Business buyer"] }, otherLabel: "Define other channel alternative", requireOther: true, options: PRE_REVENUE_CHANNEL_ALTERNATIVE_OPTIONS },
            { id: "preProblemEvidenceChannel", label: "For retail, wholesale, marketplace, distributor, or business sales, what buyer or channel evidence do you already have?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["Retail / wholesale buyer", "Distributor or channel partner", "Marketplace buyer", "Business buyer"] }, otherLabel: "Define other channel evidence", requireOther: true, options: PRE_REVENUE_CHANNEL_EVIDENCE_OPTIONS },
            { id: "preMissingEvidenceChannel", label: "For retail, wholesale, marketplace, distributor, or business sales, what buyer or channel evidence is still missing?", type: "multiSelectDropdown", full: true, showWhen: { field: "preRevenueRouteToMarket", defaultVisible: true, values: ["Retail / wholesale buyer", "Distributor or channel partner", "Marketplace buyer", "Business buyer"] }, otherLabel: "Define other missing channel evidence", requireOther: true, options: PRE_REVENUE_MISSING_CHANNEL_EVIDENCE_OPTIONS }
          ]
        }
      ]
    },
    {
      id: "preRevenueWedge",
      title: "First Validation Offer / Buying Commitment",
      description: "Define the smallest credible offer, commitment, or next step that would prove someone may actually want the product.",
      preRevenue: true,
      cards: [
        {
          title: "First Offer or Commitment to Test",
          fields: [
            { id: "preWedgeOfferName", label: "Name of the first offer or commitment", type: "text", placeholder: "Example: waitlist, preorder, beta access, pilot, consultation, demo review, sample review, limited launch, signup, or small test order." },
            { id: "preWedgeOfferType", label: "What commitment are you trying to get?", type: "select", otherLabel: "Define other commitment type", requireOther: true, options: ["Waitlist signup", "Preorder", "Deposit", "Beta access request", "Free trial or early access signup", "Prototype, demo, sample, or concept feedback", "Founding customer offer", "Pilot or limited launch", "Consultation or discovery conversation", "Product details, pricing, or proposal request", "Small order or test commitment", "Buyer or stakeholder introduction", "Other"] },
            { id: "preWedgeOutcome", label: "What would this commitment help validate?", type: "multiSelectDropdown", otherLabel: "Define other validation signal", requireOther: true, options: ["Demand", "Willingness to pay", "Price point", "Use case or job-to-be-done", "Message clarity", "Gift, personal, team, or specialty purchase appeal", "Business or channel-buyer interest", "Channel, workflow, catalog, or audience fit", "Terms, onboarding, or commercial-model interest", "Demo, sample, beta, or review interest", "Small-order, pilot, signup, or trial interest", "Repeat purchase, renewal, usage, or expansion potential", "Other measurable outcome"] },
            { id: "preWedgeIncluded", label: "What would the buyer receive or agree to?", type: "textarea", full: true, placeholder: "Example: early access, preorder spot, product sample, demo, beta, consultation, pilot, pricing review, limited test, feedback conversation, or introduction." },
            { id: "preWedgeExcluded", label: "What is intentionally not included yet?", type: "textarea", full: true, placeholder: "Example: full launch, full product line, custom build, enterprise rollout, large inventory commitment, broad support scope, guaranteed delivery date, or complete partner program." },
            { id: "prePriceTest", label: "What price or commitment approach will you test?", type: "select", otherLabel: "Define other price or commitment approach", requireOther: true, options: ["No-price feedback", "Waitlist only", "Preorder at target price", "Refundable deposit", "Discounted early access", "Full-price limited launch", "Free trial, demo, beta, or sample review", "Paid pilot, beta, sample, or consultation", "Small order or test commitment", "Pricing, terms, or proposal feedback only", "Not sure yet", "Other"] },
            { id: "preWedgeSuccessCriteria", label: "What would make this validation offer successful?", type: "textarea", full: true, placeholder: "Example: 50 waitlist signups, 10 preorders, 5 beta requests, 3 demo or proposal requests, 2 pilot requests, or 1 small test order." }
          ]
        }
      ]
    },
    {
      id: "preRevenueBuyerDiscovery",
      title: "Buyer and Discovery Plan",
      description: "Plan who to talk to and what must be learned before building or scaling.",
      preRevenue: true,
      contextSummary: "preRevenueBuyerDiscovery",
      cards: [
        {
          title: "Check the Earlier Target",
          description: "Review the earlier target summary above. If it looks accurate, continue. If something is off, go back and revise the earlier target answers before using this section.",
          fields: [
            { id: "preDiscoveryTargetAccuracy", label: "Does this target, buying path, problem, and context look accurate enough to answer this section?", type: "select", full: true, options: ["", "Yes - continue", "No - go back and revise the earlier target"], hint: "If the target or path is wrong, revise the earlier section instead of correcting it here." },
            { id: "preDiscoveryReviseEarlierTarget", label: "Revise earlier target answers", type: "sectionLink", full: true, showWhen: { field: "preDiscoveryTargetAccuracy", value: "No - go back and revise the earlier target" }, targetSection: "preRevenueHypotheses", buttonLabel: "Go back to Think Big, Start Small", hint: "Update the first-win segment and buying-path answers there, then return to Buyer and Discovery Plan." }
          ]
        },
        {
          title: "DTC Buyer and Discovery Questions",
          description: "Use these when the first buying target is an end consumer, user, gift buyer, recommender, creator, or community influence path.",
          fields: [
            { id: "preDtcPrimaryBuyer", label: "For this segment, who is most likely to buy, use, influence, or recommend the product?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC buyer or influencer", requireOther: true, options: PRE_REVENUE_DTC_BUYER_ROLE_OPTIONS },
            { id: "preDtcBuyerMoment", label: "What buying moment should discovery focus on?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other buying moment", requireOther: true, options: ["Before a task, activity, event, season, or occasion", "During a task, activity, event, season, or occasion", "After a frustrating experience with the current option", "When replacing, upgrading, gifting, subscribing, or trying something new", "When a trusted person recommends it", "When social proof, reviews, or examples make the value clear", "When price, timing, availability, or convenience is right", "I don't know yet", "Other"] },
            { id: "preDtcLikelyBlocker", label: "What might stop this consumer from taking the next step?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC blocker", requireOther: true, options: PRE_REVENUE_DTC_BUYER_WORRY_OPTIONS },
            { id: "preDtcTrustConcerns", label: "What proof or trust question should discovery test?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC proof question", requireOther: true, options: ["Does the buyer understand the value quickly", "Does the product look meaningfully different", "Does the buyer trust the quality or outcome", "Does the buyer believe the price is fair", "Does the buyer need reviews, proof, or examples", "Does the buyer need a sample, demo, trial, or return option", "Does the buyer need reassurance about delivery, setup, access, or support", "I don't know yet", "Other"] },
            { id: "preDtcDiscoveryQuestions", label: "What should you ask this DTC buyer or user?", type: "textarea", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, placeholder: "Example: What do you use today? What would make you switch or try this? What would make this feel worth the price? What would you need to see before buying?" },
            { id: "preDtcBuyingUnknowns", label: "Which DTC buying unknowns need to be resolved?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Direct to consumer / end user", "Mixed or not sure yet"] }, otherLabel: "Define other DTC unknown", requireOther: true, options: ["Who buys vs who uses", "What triggers consideration", "What current alternative they use", "What value matters most", "What price feels acceptable", "What proof is needed", "What channel or source reaches them", "What action shows real demand", "I don't know yet", "Other"] }
          ]
        },
        {
          title: "Channel or Business Buyer Discovery Questions",
          description: "Use these when the first buying target is a retailer, wholesaler, distributor, marketplace, partner, corporate buyer, team buyer, or business account.",
          fields: [
            { id: "preChannelPrimaryBuyer", label: "For this segment, who is most likely to approve, buy, carry, test, or recommend it?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel or business buyer", requireOther: true, options: PRE_REVENUE_CHANNEL_BUYER_ROLE_OPTIONS },
            { id: "preChannelEconomicBuyer", label: "Who likely cares most about the economics or risk?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other economic or risk owner", requireOther: true, options: ["Owner / founder", "Retail buyer / merchant", "Category manager", "Department leader", "Operations leader", "Finance or procurement", "Marketplace operator", "Distributor or partner manager", "Store manager", "End customer demand owner", "I don't know yet", "Other"] },
            { id: "preChannelLikelyBlocker", label: "What might stop this buyer from taking the next step?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel blocker", requireOther: true, options: PRE_REVENUE_CHANNEL_BUYER_WORRY_OPTIONS },
            { id: "preChannelProofConcerns", label: "What proof or operating question should discovery test?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel proof question", requireOther: true, options: ["Will this sell through, get adopted, or create usage", "Does the margin, price, or business model work", "Does it fit the catalog, workflow, channel, or account base", "Does the buyer believe demand exists", "Are minimum order, pilot, onboarding, or setup requirements acceptable", "Can delivery, fulfillment, support, replenishment, or implementation work", "What proof reduces inventory, financial, brand, adoption, or delivery risk", "I don't know yet", "Other"] },
            { id: "preChannelDiscoveryQuestions", label: "What should you ask this channel or business buyer?", type: "textarea", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, placeholder: "Example: Where would this fit? What evidence would you need? What would make this worth a test? What terms, pricing, onboarding, or proof would matter?" },
            { id: "preChannelBuyingUnknowns", label: "Which channel or business buying unknowns need to be resolved?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["Retail, wholesale, distributor, or marketplace", "Corporate or team purchase", "Mixed or not sure yet"] }, otherLabel: "Define other channel unknown", requireOther: true, options: ["Who owns the decision", "Who controls budget or margin", "Who approves a test", "How they evaluate new products, services, vendors, or partners", "What proof reduces risk", "What commercial terms are required", "What operating requirements must be met", "What action shows real demand", "I don't know yet", "Other"] }
          ]
        },
        {
          title: "Mixed or Unclear Buying Path",
          description: "Use this as a routing decision. The goal is to decide which buying path should be tested first before doing deeper buyer discovery.",
          fields: [
            { id: "prePathOptionsUnderConsideration", label: "Which buying paths might apply to this segment?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["", "Mixed or not sure yet"] }, otherLabel: "Define other possible buying path", requireOther: true, options: ["DTC / end consumer", "Gift buyer or household buyer", "Community, creator, expert, or recommender path", "Retail / wholesale buyer", "Distributor or partner", "Marketplace", "Corporate, team, or business buyer", "Not sure yet", "Other"] },
            { id: "prePathEvidenceSignals", label: "What evidence points toward one path or another?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["", "Mixed or not sure yet"] }, otherLabel: "Define other evidence signal", requireOther: true, options: ["Consumers or users have shown interest", "Channel or business buyers have shown interest", "Founder has easier access to consumers or users", "Founder has easier access to channel or business buyers", "One path has clearer willingness to pay", "One path has clearer usage, adoption, or repeat demand", "One path has lower validation cost", "One path has faster feedback", "No evidence yet", "Other"] },
            { id: "preFastestPathToTest", label: "Which path could be tested fastest in the next 30 days?", type: "select", showWhen: { field: "preDiscoveryBuyingPath", values: ["", "Mixed or not sure yet"] }, otherLabel: "Define other fastest path", requireOther: true, options: ["", "DTC / end consumer", "Gift buyer or household buyer", "Community, creator, expert, or recommender path", "Retail / wholesale buyer", "Distributor or partner", "Marketplace", "Corporate, team, or business buyer", "Need to compare paths first", "Other"] },
            { id: "preStrongestPathSignal", label: "What signal would best prove the first path is worth testing further?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["", "Mixed or not sure yet"] }, otherLabel: "Define other validation signal", requireOther: true, options: ["Waitlist signup", "Preorder, deposit, signup, or subscription intent", "Sample, demo, beta, prototype, or concept review", "Pilot, test order, or limited launch interest", "Pricing, terms, proposal, or product-detail request", "Introduction to the correct buyer or stakeholder", "Repeat interest from multiple buyers or users", "Referral, share, or recommendation intent", "Other"] },
            { id: "prePathDecisionCriteria", label: "What would make you choose one path over the other?", type: "multiSelectDropdown", full: true, showWhen: { field: "preDiscoveryBuyingPath", values: ["", "Mixed or not sure yet"] }, otherLabel: "Define other decision criteria", requireOther: true, options: ["Stronger urgency", "Easier buyer access", "Clearer economics", "Lower operational risk", "Faster proof", "Better fit with current capacity", "Clearer willingness to pay", "Higher quality feedback", "Better path to repeatable revenue", "Other"] },
            { id: "preRoutingDecisionNextStep", label: "What is the next step to choose the first path?", type: "select", showWhen: { field: "preDiscoveryBuyingPath", values: ["", "Mixed or not sure yet"] }, otherLabel: "Define other routing next step", requireOther: true, options: ["", "Run 5 consumer or user conversations first", "Run 5 channel or business buyer conversations first", "Test both paths with a small equal sample", "Ask existing contacts which path is more realistic", "Compare path economics, access, proof, and operating risk", "Build a small list for each path before choosing", "Not sure yet", "Other"] }
          ]
        }
      ]
    },
    {
      id: "preRevenueValidationMotion",
      title: "Validation Motion",
      description: "Design the smallest 30-day GTM experiment that can produce useful learning.",
      preRevenue: true,
      contextSummary: "preRevenueValidationMotion",
      cards: [
        {
          title: "30-Day Validation Motion",
          fields: [
            { id: "preValidationChannel", label: "Use or revise our recommended channel, list, event, or source", type: "multiSelectDropdown", recommendationKey: "validationChannel", hint: "Select the sources you will actually use, or add another source if the recommendation is incomplete.", otherLabel: "Define other channel, list, event, or source", requireOther: true, options: ["Founder network", "Warm referrals", "Existing customer or prospect list", "Existing email list", "Existing social audience", "Existing community or membership", "Existing retail, partner, distributor, or buyer list", "LinkedIn outreach", "Email outreach", "Phone outreach", "Text or direct message outreach", "Customer or user interviews", "Industry communities, forums, or groups", "Trade show", "Conference or industry event", "Local event, market, pop-up, or demo day", "Retailer, wholesaler, distributor, or partner outreach", "Marketplace listing or marketplace outreach", "Partner introductions", "Advisor, investor, or mentor introductions", "Creator, influencer, expert, or affiliate outreach", "Content post", "Landing page or waitlist test", "Survey", "Paid search test", "Paid social test", "In-person field test", "Other"] },
            { id: "preTargetListWho", label: "Use or revise our recommended first test audience", type: "multiSelectDropdown", full: true, recommendationKey: "targetListWho", hint: "Select the audience rules you want to keep, revise, or add.", otherLabel: "Define other first-test audience", requireOther: true, options: ["People who match the selected first-win segment", "People who have the problem or buying job we are testing", "People who use or influence the product category", "People who already follow, subscribe, attend, buy, or participate in a relevant context", "People in the founder's network", "Warm referral targets", "Retail, wholesale, distributor, marketplace, partner, or business buyers", "Existing prospects, leads, subscribers, or community members", "Use recommendation as written", "Not sure yet", "Other"] },
            { id: "preTargetListFitSignals", label: "Use or revise our recommended first-test fit rules", type: "multiSelectDropdown", full: true, recommendationKey: "targetListFitSignals", hint: "Select what makes someone worth putting on the first validation list.", otherLabel: "Define other first-test fit signal", requireOther: true, options: ["Easy to reach in the next 30 days", "Likely to understand the problem quickly", "Likely to give honest feedback", "Likely to have current alternatives or workarounds", "Likely to care about the use case, activity, workflow, category, or occasion", "Can take a small next step without a long buying process", "Can introduce the right buyer, user, approver, or influencer", "Can give pricing, terms, product, sample, demo, beta, pilot, or concept feedback", "Representative of a segment we may want more of later", "Use recommendation as written", "Not sure yet", "Other"] },
            { id: "preTargetListExclusions", label: "Use or revise our recommended exclusion rules", type: "multiSelectDropdown", full: true, recommendationKey: "targetListExclusions", hint: "Select anything that should keep a target off the first validation list.", otherLabel: "Define other exclusion", requireOther: true, options: ["People or accounts we cannot reach quickly", "Targets outside the selected first-win segment", "Targets with no clear connection to the problem or use case", "Targets that require a long approval process before giving feedback", "Targets that are too broad or generic to teach us anything", "Targets that would need too much customization, inventory, setup, support, or operational effort", "Targets where the buying path is unknown and cannot be tested quickly", "Use recommendation as written", "No exclusions yet", "Other"] },
            { id: "preTargetListCriteria", label: "Optional target-list notes", type: "textarea", full: true, placeholder: "Add any specific names, list sources, filters, locations, communities, events, categories, or buying windows that should shape the first test list." },
            { id: "preMessageLead", label: "Use or revise our recommended message lead", type: "select", recommendationKey: "messageLead", hint: "Choose Use recommendation as written, or choose the lead angle you want to test.", otherLabel: "Define other message lead", requireOther: true, options: ["", "Use recommendation as written", "The problem or buying job", "The use case, occasion, workflow, or category moment", "A better current alternative or workaround", "A clear product difference", "A lower-risk way to test or try it", "Customer, user, channel, or account demand", "Margin, economics, efficiency, or business value", "Timing, seasonality, launch, budget, or decision window", "Not sure yet", "Other"] },
            { id: "preMessageProofPoint", label: "Use or revise our recommended proof or credibility cue", type: "multiSelectDropdown", full: true, recommendationKey: "messageProofPoint", hint: "Select what you will use to make the message credible, or add what is missing.", otherLabel: "Define other proof or credibility cue", requireOther: true, options: ["Founder has relevant experience", "Prototype, demo, sample, beta, concept, or mockup exists", "User, buyer, or channel feedback exists", "Comparable product, service, category, or behavior signal exists", "Clear use case or job-to-be-done", "Clear price, margin, terms, or test commitment", "Relevant community, event, channel, or buyer access", "Product difference is visible or easy to explain", "No proof yet - message should ask for feedback", "Use recommendation as written", "Other"] },
            { id: "preMessageAsk", label: "Use or revise our recommended ask / next step", type: "multiSelectDropdown", full: true, recommendationKey: "messageAsk", hint: "Select the action you will ask the buyer or user to take.", otherLabel: "Define other message ask", requireOther: true, options: ["Answer 3-5 discovery questions", "React to a concept, demo, sample, prototype, beta, image, or mockup", "Share current alternative or workaround", "Give price, terms, margin, or willingness-to-pay feedback", "Join a waitlist, sign up, preorder, subscribe, or place a deposit", "Request product details, pricing, terms, proposal, sample, demo, or review materials", "Consider a pilot, test order, beta, trial, limited launch, or small test", "Introduce the right buyer, user, approver, partner, or influencer", "Use recommendation as written", "Not sure yet", "Other"] },
            { id: "preMessageToTest", label: "Optional message notes", type: "textarea", full: true, placeholder: "Optional: write the exact message angle or wording if you already know it." },
            { id: "preWeeklyActivityTarget", label: "Use or revise our recommended weekly activity target", type: "select", recommendationKey: "weeklyActivityTarget", hint: "Choose the closest target or use Custom if needed.", options: ["", "Use recommendation as written", "5 people or accounts contacted", "10 people or accounts contacted", "20 people or accounts contacted", "5 conversations requested", "10 conversations requested", "20 conversations requested", "3 conversations completed", "5 conversations completed", "10 conversations completed", "1 sample, demo, beta, concept, or pilot review requested", "2 sample, demo, beta, concept, or pilot reviews requested", "1 waitlist, preorder, signup, deposit, test order, or pilot requested", "Custom"] },
            { id: "preWeeklyActivityMix", label: "Use or revise our recommended weekly work pattern", type: "multiSelectDropdown", full: true, recommendationKey: "weeklyActivityMix", hint: "Select the weekly actions you will actually run.", otherLabel: "Define other weekly activity", requireOther: true, options: ["Build or clean the target list", "Send outreach", "Follow up with non-responders", "Run interviews or feedback calls", "Show concept, demo, sample, prototype, beta, image, or mockup", "Ask for price, terms, margin, or willingness-to-pay feedback", "Ask for a waitlist, preorder, signup, deposit, sample/demo review, pilot, test order, referral, or introduction", "Record evidence and objections", "Review results and revise the test", "Use recommendation as written", "Other"] },
            { id: "prePositiveSignal", label: "Use or revise our recommended positive signal", type: "multiSelectDropdown", full: true, recommendationKey: "positiveSignal", hint: "Select the signals that would prove the test is working.", otherLabel: "Define other positive signal", requireOther: true, options: ["Agrees the problem is real or urgent", "Shares current workaround or alternative", "Uses strong language about the need", "Asks about price, terms, timing, or availability", "Requests follow-up", "Requests sample, demo, beta, prototype, concept, pilot, trial, or limited launch", "Requests product details, pricing, proposal, review materials, or terms", "Asks about margin, adoption, usage, sell-through, delivery, support, replenishment, onboarding, or requirements", "Joins waitlist, signs up, preorders, subscribes, places deposit, or asks to be notified", "Introduces another stakeholder, buyer, user, partner, or influencer", "Shares data, examples, objections, or buying criteria", "Says they would pay, buy, carry, recommend, test, or use it", "Use recommendation as written", "Other"] },
            { id: "preContinueCriteria", label: "Use or revise our recommended continue rule", type: "multiSelectDropdown", full: true, recommendationKey: "continueCriteria", hint: "Select what would justify continuing the test.", otherLabel: "Define other continue criteria", requireOther: true, options: ["Multiple targets confirm the problem or buying job matters", "At least 30% of contacted targets respond or engage", "At least 5 useful conversations or feedback responses are completed", "At least 3 targets request a meaningful next step", "At least 1 target gives a strong buying, signup, preorder, test, pilot, or review signal", "Target buyers can explain where it fits and why it matters", "Objections are solvable without changing the core product or audience", "The channel/source can produce enough targets for another test", "Use recommendation as written", "Other"] },
            { id: "preReviseTriggers", label: "Use or revise our recommended revise rule", type: "multiSelectDropdown", full: true, recommendationKey: "reviseTriggers", hint: "Select what would tell you to change the message, audience, offer, or channel.", otherLabel: "Define other revise trigger", requireOther: true, options: ["People respond but do not understand the value", "People agree politely but will not take a next step", "The problem exists but urgency is weak", "The target list is too broad or hard to reach", "The message attracts the wrong audience", "Price, terms, commitment, or risk feels wrong", "A different buyer role is clearly more relevant", "A different channel or source produces better conversations", "Proof, credibility, sample, demo, or details are missing", "Use recommendation as written", "Other"] },
            { id: "preStopTriggers", label: "Use or revise our recommended stop or pause rule", type: "multiSelectDropdown", full: true, recommendationKey: "stopTriggers", hint: "Select what would tell you this test is no longer worth running as designed.", otherLabel: "Define other stop or pause trigger", requireOther: true, options: ["No meaningful responses after enough outreach", "Targets do not recognize the problem or use case", "No one will take a small next step", "The segment is not reachable with current access", "The buying path requires too much time or complexity for this stage", "The economics, risk, operations, or delivery requirements do not work", "Feedback points to a different segment, buyer, problem, or offer", "The product needs more definition before validation can continue", "Use recommendation as written", "Other"] },
            { id: "preContinueRule", label: "Optional continue notes", type: "textarea", full: true, placeholder: "Optional: add a specific numeric threshold or decision rule if the guided choices need more detail." },
            { id: "preReviseRule", label: "Optional revise notes", type: "textarea", full: true, placeholder: "Optional: add what you would revise first if signals are mixed." },
            { id: "preStopRule", label: "Optional stop or pause notes", type: "textarea", full: true, placeholder: "Optional: add a hard stop condition if there is one." }
          ]
        }
      ]
    },
    {
      id: "preRevenueEvidenceTracker",
      title: "Evidence Tracker",
      description: "Define what will be tracked so the experiment creates learning, not just activity.",
      preRevenue: true,
      contextSummary: "preRevenueEvidenceTracker",
      cards: [
        {
          title: "Learning System",
          fields: [
            { id: "preEvidenceTracked", label: "What evidence will change the next decision?", type: "multiSelectDropdown", recommendationKey: "evidenceTracked", hint: "Start with must-know evidence. Nice to know. Disregard if knowing does not impact the next decision.", options: ["Buyer role", "Problem intensity", "Current workaround", "Trigger event", "Willingness to pay", "Objections", "Words buyers use", "Requested proof", "Next-step conversion", "Pilot interest", "Other"] },
            { id: "preTrackingLocation", label: "Where will the evidence be tracked?", type: "select", recommendationKey: "trackingLocation", options: ["Spreadsheet", "CRM", "Notion / docs", "Airtable", "Call notes", "Survey tool", "Other"] },
            { id: "preReviewCadence", label: "How often will the evidence be reviewed?", type: "select", recommendationKey: "reviewCadence", options: ["Twice weekly", "Weekly", "Every two weeks", "At the end of 30 days", "Not sure yet"] },
            { id: "preLearningOwner", label: "Who owns reviewing the evidence?", type: "select", recommendationKey: "learningOwner", otherLabel: "Define other evidence review owner", requireOther: true, options: ["Founder or person running the validation motion", "Sales or customer development owner", "Marketing or growth owner", "Product owner", "Shared founder/team review", "Advisor or mentor review", "Not sure yet", "Other"] },
            { id: "preDecisionRules", label: "Do these continue, revise, and stop rules fit this validation test?", type: "select", recommendationKey: "decisionRules", hint: "Use these rules to decide what evidence would make you continue the test, revise the test, or stop/pause it.", full: true, options: ["Use our recommendations", "Revise the continue rule", "Revise the revise rule", "Revise the stop or pause rule", "Use different rules", "Not sure yet"] },
            { id: "preDecisionRulesRevision", label: "What needs to change in the decision rules?", type: "textarea", full: true, showWhen: { field: "preDecisionRules", values: ["Revise the continue rule", "Revise the revise rule", "Revise the stop or pause rule", "Use different rules"] }, placeholder: "Example: Continue only if at least 3 buyers request a sample or pilot. Revise if the buyer is interested but the proof requirement is different. Stop if no buyer recognizes the problem after 20 qualified contacts." }
          ]
        }
      ]
    },
    {
      id: "quickIcp",
      title: "Customer Priority Framework",
      description: "Define customer groups as hypotheses, score them against five ICP dimensions, and choose the group most worth validating or pursuing now.",
      introBlocks: [
        {
          title: "What makes a good customer group?",
          body: "A customer group should be measurable, reachable, meaningfully different, actionable, and valuable enough to prioritize. Good: Multi-location franchise systems with 50-250 locations. Poor: Businesses."
        },
        {
          title: "How is the customer group score used?",
          body: "The score evaluates each customer group as a hypothesis across five dimensions: fit, pain / urgency, economic value, winability, and evidence confidence. High-scoring groups are better ICP candidates because they are easier to validate, reach, sell, and turn into action plans."
        },
        {
          title: "What is a Customer Segment?",
          body: "A customer segment is a group of similar buyers who have the same kind of problem or buying job, similar buying needs, and a similar reason to act. A segment can be based on industry, company size, business model, buyer role, geography, trigger event, product category, channel, or current problem.",
          examples: ["Niche retailers that need differentiated products", "Multi-location home service businesses", "Early-stage SaaS companies with founder-led sales", "Franchise brands trying to improve local lead flow", "Healthcare practices with manual intake processes", "Companies that recently changed leadership or raised funding"]
        },
        {
          title: "How does this become an ICP?",
          body: "The ICP is the output of this framework, not the starting answer. First compare customer groups, evidence, reachability, readiness, and timing. Then use the strongest pattern to derive the customer profile."
        }
      ],
      content: [
        {
          title: "Start With the Customer Context",
          hint: "Describe the customer in plain language before scoring customer-group hypotheses. The ICP Brief uses this as qualitative source context.",
          fields: [
            { id: "customerContextStarter", label: "Describe the customer, user, or buyer you most want to reach", type: "textarea", full: true, hint: "Include who they are, the situation they are in, what they are trying to accomplish, what is difficult today, and details that would help find more of them.", placeholder: "Add a detailed customer description or generate a company-specific example below." }
          ]
        },
        {
          title: "Step 1: Possible Customer Groups",
          hint: "List 1-3 customer-group hypotheses you could realistically sell to, then score each one across fit, pain / urgency, economic value, winability, and evidence confidence.",
          fields: [
            { id: "customerRouteLenses", label: "Who are we evaluating as the customer in this section?", type: "multiSelectDropdown", hint: "Select all that apply. Some products may need both the end user and the channel, partner, business, or marketplace buyer.", otherLabel: "Define other customer route", requireOther: true, options: CUSTOMER_ROUTE_TO_MARKET_OPTIONS }
          ],
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
              maxRows: 999,
              addLabel: "Add another customer group",
              advancedGroups: ["Advanced segment scoring"],
              collapsibleGroups: ["Customer group definition", "B2C / channel context", "Step 2: Customer Group Hypothesis Score", "Step 2: Evidence-Based Fit Check"],
              columns: [
                { id: "groupName", label: "Customer group name", type: "text", group: "Customer group", placeholder: "Example: Multi-location service businesses" },
                { id: "routeToMarketLens", label: "Which customer lens does this group represent?", type: "multiSelectDropdown", group: "Customer group", hint: "For B2C plus wholesale, select both the consumer side and the channel buyer side when both matter.", otherLabel: "Define other route-to-market lens", requireOther: true, options: CUSTOMER_ROUTE_TO_MARKET_OPTIONS },
                { id: "whoTheyAre", label: "Who are they?", type: "textarea", group: "Customer group", full: true, placeholder: "Example: Companies with 5-50 locations and centralized marketing." },
                { id: "segmentIdentityDetails", label: "What makes this a distinct segment?", type: "textarea", group: "Customer group definition", full: true, placeholder: "Example: vertical, business model, category, geography, stage, customer type, or operating model." },
                { id: "endConsumerProfile", label: "If an end consumer is involved, who ultimately uses or wants the product?", type: "textarea", group: "B2C / channel context", full: true, placeholder: "Example: People with a specific problem, use case, activity, goal, life stage, role, community, or buying occasion." },
                { id: "consumerPurchaseTrigger", label: "What would trigger the end consumer to buy?", type: "multiSelectDropdown", group: "B2C / channel context", otherLabel: "Define other consumer trigger", requireOther: true, options: CONSUMER_PURCHASE_TRIGGER_OPTIONS },
                { id: "channelBuyerProfile", label: "If a retailer, wholesaler, distributor, partner, business buyer, or marketplace is involved, who decides whether to carry, approve, test, or buy it?", type: "textarea", group: "B2C / channel context", full: true, placeholder: "Example: Buyer, owner, operator, category lead, marketplace manager, department head, partner manager, or procurement owner." },
                { id: "channelBuyingCriteria", label: "What will the channel buyer care about before saying yes?", type: "multiSelectDropdown", group: "B2C / channel context", otherLabel: "Define other channel buying criteria", requireOther: true, options: CHANNEL_BUYING_CRITERIA_OPTIONS },
                { id: "sizeDefinition", label: "How would you define their size or scale?", type: "textarea", group: "Customer group definition", full: true, placeholder: "Example: $2M-$20M revenue, 5-50 employees, 3-10 products, 5-50 locations, or another measurable size marker." },
                { id: "economicFitDefinition", label: "What would make this group economically attractive?", type: "textarea", group: "Customer group definition", full: true, placeholder: "Example: budget source, willingness to pay, margin potential, lifetime value, expansion potential, or strategic deal value." },
                { id: "useCaseDefinition", label: "What specific use cases or jobs-to-be-done make them a fit?", type: "multiSelectDropdown", group: "Customer group definition", hint: "Choose up to 3 if possible. Use Other only when the use case is not in the list.", otherLabel: "Define other use case", requireOther: true, options: CUSTOMER_USE_CASE_OPTIONS },
                { id: "resourceConstraintDefinition", label: "If resources are part of this group description, how would you recognize or quantify that?", type: "textarea", group: "Customer group definition", full: true, placeholder: "Example: no dedicated sourcing lead, fewer than 3 people on the product team, founder still owns operations, or no internal implementation team. Leave blank if this is not relevant." },
                { id: "expertiseGap", label: "If a capability or expertise gap is part of this group description, what is missing?", type: "textarea", group: "Customer group definition", full: true, placeholder: "Example: sourcing, manufacturing, CRM setup, paid acquisition, enterprise sales, finance approval, compliance, or launch operations. Leave blank if this is not relevant." },
                { id: "observableCompanySignals", label: "What public or observable signals would help find them?", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add observable signal", otherLabel: "Define other observable signal", requireOther: true, options: ICP_FIT_SIGNAL_OPTIONS },
                { id: "listBuildingClues", label: "Where could you find more companies like this?", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add list source", otherLabel: "Define other list source", requireOther: true, options: CUSTOMER_ACCESS_SOURCE_OPTIONS },
                { id: "competitiveContext", label: "What alternatives, competitors, or workarounds are they using today?", type: "textarea", group: "Customer group definition", full: true, placeholder: "Example: spreadsheets, agencies, internal team, current vendor, doing nothing, manual process, or competitor product." },
                { id: "evidenceSource", label: "What evidence supports this customer group?", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add evidence source", otherLabel: "Define other evidence source", requireOther: true, options: CUSTOMER_EVIDENCE_OPTIONS },
                { id: "problem", label: "What problem, buying job, or unmet need do they have that your product, service, or offer helps solve?", type: "multiSelectDropdown", group: "Customer group", otherLabel: "Define other customer problem", requireOther: true, options: CUSTOMER_PROBLEM_OPTIONS },
                { id: "whyNow", label: "Why might they buy now?", type: "textarea", group: "Customer group", full: true, placeholder: "Example: Lead costs are rising and conversion rates are falling." },
                { id: "implementationFit", label: "Fit", type: "scoreSelect", group: "Step 2: Customer Group Hypothesis Score", hint: "Does this group match the product, use case, tech, operations, and success requirements?", scoreScale: 3, options: ["Weak fit: product, use case, operations, or success requirements are unclear or mismatched", "Possible fit: the use case is plausible but needs validation", "Strong fit: the group clearly matches the offer, use case, delivery model, and success requirements"] },
                { id: "urgency", label: "Pain / urgency", type: "scoreSelect", group: "Step 2: Customer Group Hypothesis Score", hint: "Do they have a meaningful problem and a reason to act now?", scoreScale: 3, options: ["Mostly assumption: problem may exist, but urgency is unconfirmed", "Some signal: prospects mention the problem, but timing is inconsistent", "Direct evidence: buyers have meaningful pain and are actively trying to solve it now"] },
                { id: "abilityToPay", label: "Economic value", type: "scoreSelect", group: "Step 2: Customer Group Hypothesis Score", hint: "Can they pay, renew, expand, and justify acquisition cost?", scoreScale: 3, options: ["Weak economics: budget, willingness to pay, expansion, or margin potential is unclear", "Possible economics: budget may exist, but value still needs validation", "Strong economics: budget source, willingness to pay, margin, renewal, or expansion potential is clear"] },
                { id: "easeOfAccess", label: "Winability", type: "scoreSelect", group: "Step 2: Customer Group Hypothesis Score", hint: "Can you reach them, differentiate, navigate the buying process, and beat alternatives?", scoreScale: 3, options: ["Low winability: hard to identify, reach, differentiate, or navigate the buying process", "Possible winability: there is a plausible path to reach and win them", "Strong winability: the group is reachable, differentiation is clear, and the buying path is navigable"] },
                { id: "proofEvidence", label: "Evidence confidence", type: "scoreSelect", group: "Step 2: Customer Group Hypothesis Score", hint: "Is this based on data, customer conversations, wins/losses, or mostly assumptions?", scoreScale: 3, options: ["Low confidence: mostly assumption or internal belief", "Medium confidence: some customer conversation, market signal, or adjacent proof", "High confidence: supported by wins, losses, CRM data, customer interviews, usage data, or direct proof"] },
                { id: "tradeoffRisk", label: "Why might this group be a bad first focus?", type: "multiSelectDropdown", group: "Step 2: Evidence-Based Fit Check", otherLabel: "Define other first-focus risk", requireOther: true, options: CUSTOMER_FIRST_FOCUS_RISK_OPTIONS },
                { id: "strategicValue", label: "Strategic value", type: "select", group: "Advanced segment scoring", options: ["", "Low", "Medium", "High"] },
                { id: "salesCycleFit", label: "Sales-cycle fit", type: "select", group: "Advanced segment scoring", options: ["", "Poor", "Okay", "Strong"] },
                { id: "revenuePotential", label: "Revenue potential", type: "select", group: "Advanced segment scoring", options: ["", "Low", "Medium", "High"] },
                { id: "notesEvidence", label: "Notes / evidence", type: "text", group: "Advanced segment scoring", full: true, placeholder: "Add notes or evidence for this score." }
              ]
            }
          ]
        },
        {
          title: "Step 3: Primary Customer Priority Segment",
          hint: "Choose the customer group that is most likely to buy, get value, and be worth serving now. Treat this as a recommendation that can improve as evidence gets stronger.",
          fields: [
            { id: "bestFitCustomerGroup", label: "Best-fit customer group to focus on first", type: "select", dynamicOptionsFrom: "possibleCustomerGroups", options: ["Not sure yet"] },
            { id: "bestFitPrimaryPain", label: "Primary pain", type: "multiSelectDropdown", otherLabel: "Define other primary pain", requireOther: true, options: CUSTOMER_PROBLEM_OPTIONS },
            { id: "bestFitTrigger", label: "Primary trigger event or timing signal", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add trigger", otherLabel: "Define other trigger", requireOther: true, options: ["Leadership change", "New funding", "Growth initiative", "Market expansion", "New location", "Hiring for relevant role", "Compliance pressure", "Cost pressure", "Customer complaints", "Vendor dissatisfaction", "System change", "Budget cycle", "Merger / acquisition", "New product launch", "Category reset or assortment planning", "Seasonal buying window", "Trade show or buying event", "Inventory shortfall", "Supplier issue", "Operational breakdown", "Competitor pressure", "Renewal window", "Other"] },
            { id: "bestFitDecisionMaker", label: "Buyer / decision maker", type: "select", otherLabel: "Define other decision maker", requireOther: true, options: ["", "Founder / Owner", "CEO", "COO", "CFO / Finance", "CMO / Marketing", "Head of Sales", "Head of Revenue", "Head of Operations", "Product Leader", "Operations Leader", "Retail buyer / merchant", "Category manager", "Merchandise planner", "Store owner", "Store manager", "Procurement", "IT / Technical leader", "Department leader", "Other", "Not sure yet"] },
            { id: "bestFitChampion", label: "Day-to-day user or champion", type: "select", otherLabel: "Define other champion", requireOther: true, options: ["", "Founder / Owner", "Operations manager", "Product manager", "Marketing manager", "Sales manager", "Customer success", "Finance manager", "Project manager", "Retail buyer / merchant", "Category manager", "Merchandise planner", "Store manager", "Department lead", "Frontline user", "Other", "Not sure yet"] },
            { id: "bestFitFirstUseCase", label: "First use case to sell", type: "multiSelectDropdown", hint: "Choose the strongest 1-3 use cases already reflected in the customer-group work.", otherLabel: "Define other first use case", requireOther: true, options: CUSTOMER_USE_CASE_OPTIONS },
            { id: "bestFitEvidence", label: "Why this customer is a good fit", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add evidence", otherLabel: "Define other fit evidence", requireOther: true, options: CUSTOMER_EVIDENCE_OPTIONS }
          ]
        },
        {
          title: "Step 4: Fit, Caution, and Disqualification Rules",
          hint: "Choose observable rules that separate high-priority accounts from possible, caution, and bad-fit accounts. If you choose Other, define the rule in the follow-up field.",
          fields: [
            { id: "icpMustHaveSignals", label: "Must-have fit signals", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add must-have signal", otherLabel: "Define other must-have fit signal", requireOther: true, options: ICP_FIT_SIGNAL_OPTIONS },
            { id: "icpNiceToHaveSignals", label: "Nice-to-have fit signals", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add nice-to-have signal", otherLabel: "Define other nice-to-have signal", requireOther: true, options: ICP_FIT_SIGNAL_OPTIONS },
            { id: "icpCautionSignals", label: "Caution signals", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add caution signal", otherLabel: "Define other caution signal", requireOther: true, options: ["Unclear owner", "Low urgency", "Budget freeze", "Competing priorities", "Heavy implementation burden", "Long decision cycle", "Weak proof match", "Hard to reach buyer", "Unclear success metric", "Needs custom work", "Other"] },
            { id: "icpDisqualificationRules", label: "Disqualification rules", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add disqualification rule", otherLabel: "Define other disqualification rule", requireOther: true, options: ["No budget", "Too small", "Too custom", "Wrong geography", "Unsupported tech stack", "No clear owner", "No executive sponsor", "Poor data quality", "Implementation burden too high", "Long procurement cycle", "Low margin", "Low strategic value", "Other"] }
          ]
        },
        {
          title: "Step 5: Buying Signals",
          hint: "Choose observable signs that suggest this customer may be ready to buy. If you choose Other, define the trigger in the follow-up field.",
          fields: [
            { id: "buyingTriggersSummary", label: "Additional buying triggers", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add buying trigger", otherLabel: "Define other buying trigger", requireOther: true, options: ["Leadership change", "New funding", "Growth initiative", "Market expansion", "New location", "Hiring for relevant role", "Compliance pressure", "Cost pressure", "Customer complaints", "Vendor dissatisfaction", "System change", "Budget cycle", "Merger / acquisition", "New product launch", "Category reset or assortment planning", "Seasonal buying window", "Trade show or buying event", "Inventory shortfall", "Supplier issue", "Operational breakdown", "Competitor pressure", "Increased product usage", "Expansion in current account", "Renewal window", "Other"] }
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
          hint: "Use this section to verify or refine answers already suggested by earlier customer-group, fit, signal, proof, and revenue-motion inputs. Choose from the guided options where possible. If you choose Other, define it.",
          fields: [
            { id: "bestFitRevenueRange", label: "Best-fit revenue range", type: "text", placeholder: "Example: $1M-$20M annual revenue" },
            { id: "bestFitHeadcountRange", label: "Best-fit headcount range", type: "text", placeholder: "Example: 10-100 employees" },
            { id: "bestFitSizeScaleRange", label: "Other size / scale marker", type: "text", placeholder: "Example: 5-50 locations, 500+ monthly leads, 3+ sales reps" },
            { id: "bestFitMaturityStage", label: "Maturity stage", type: "select", otherLabel: "Define other maturity stage", requireOther: true, options: ["", "Early adopter", "Growth stage", "Mature operator", "Enterprise", "Turnaround", "New market entry", "Digitally transforming", "Other"] },
            { id: "bestFitBuyingStages", label: "Stages most likely to buy", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add buying stage", otherLabel: "Define other buying stage", requireOther: true, options: ["Early adopter", "Growth stage", "Mature operator", "Enterprise", "Turnaround", "New market entry", "Digitally transforming", "Budget planning", "Active vendor evaluation", "Renewal / replacement window", "Expansion planning", "Other"] },
            { id: "bestFitCurrentWorkaround", label: "Current workaround", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add current workaround", otherLabel: "Define other current workaround", requireOther: true, options: ["Manual work", "Spreadsheets", "Internal team", "Incumbent vendor", "Point solution", "Agency or consultant", "Generic tool", "No formal solution", "Personal relationships / referrals", "Doing nothing", "Other"] },
            { id: "bestFitBudgetCategory", label: "Likely budget source", type: "select", hint: "Where would the buyer likely find budget for this?", otherLabel: "Define other budget source", requireOther: true, options: ["", "Operations", "Sales", "Marketing", "Technology", "Finance", "HR", "Training", "Service", "Product", "Risk", "Capital expense", "Other", "Unknown"] },
            { id: "bestFitBudgetAbility", label: "Budget / ability to pay", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add budget signal", otherLabel: "Define other budget signal", requireOther: true, options: ["Confirmed budget owner", "Existing spend on this problem", "Budget likely but unconfirmed", "Budget available next cycle", "Strong cash position", "Can fund a pilot", "Can fund a strategic project", "Budget unknown", "Low or no budget", "Other"] },
            { id: "bestFitLikelySalesMotion", label: "Likely sales motion", type: "select", otherLabel: "Define other likely sales motion", requireOther: true, options: ["", "Self-serve", "Inside sales", "Field sales", "Founder-led", "Partner-led", "Enterprise sales", "Product-led", "Ecommerce", "Services / consultative selling", "Other"] },
            { id: "bestFitExpectedSalesCycle", label: "Expected sales cycle", type: "select", options: ["", "Under 14 days", "15-30 days", "30-60 days", "60-90 days", "Longer than 90 days", "Unknown"] },
            { id: "bestFitImplementationRequirements", label: "Implementation requirements", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add implementation requirement", otherLabel: "Define other implementation requirement", requireOther: true, options: ["Clean data", "System access", "Executive sponsor", "Implementation owner", "Process change", "Training / enablement", "Technical integration", "Security or privacy review", "Procurement review", "Customer success support", "Low customization", "Other"] },
            { id: "bestFitExpansionValue", label: "Expansion or strategic value", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add expansion / strategic value", otherLabel: "Define other expansion or strategic value", requireOther: true, options: ["Upsell potential", "Cross-sell potential", "Renewal potential", "Referral potential", "Case study potential", "Reference customer", "Strategic logo", "Category learning", "Product roadmap insight", "New market access", "Partner introduction", "Other"] },
            { id: "bestFitDisqualificationSignals", label: "Disqualification signals", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add disqualification signal", otherLabel: "Define other disqualification signal", requireOther: true, options: ["No budget", "Too small", "Too custom", "Wrong geography", "Unsupported tech stack", "No clear owner", "No executive sponsor", "Poor data quality", "Implementation burden too high", "Long procurement cycle", "Low margin", "Low strategic value", "Other"] }
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
        { id: "goal30", label: "Primary GTM goal for the next 30 days", type: "select", options: ["Lead flow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal60", label: "Primary GTM goal for the next 60 days", type: "select", options: ["Lead flow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal90", label: "Primary GTM goal for the next 90 days", type: "select", options: ["Lead flow", "Revenue", "Awareness", "Retention", "Expansion", "Systems / processes", "Sales / marketing resources", "Hiring", "Other"] },
        { id: "goal90RevenueTarget", label: "90-day revenue target", type: "money", required: true, showWhen: { field: "goal90", value: "Revenue" }, placeholder: "Example: 100000", hint: "Required when Revenue is the 90-day goal. Enter the revenue amount you want to create or close in the next 90 days." },
        { id: "clientAttribute", label: "Most important attribute for new clients", type: "select", options: ["Strong cash position", "Pilot participation", "Testimonials", "Inform roadmap", "Provide referrals / introductions", "Ability to expand rapidly", "Other"] },
        { id: "supportedSalesCycle", label: "Sales cycle the company can realistically support", type: "select", options: ["Under 14 days", "15-30 days", "30-60 days", "60-90 days", "Longer"] },
        { id: "capacityNotes", label: "Are there any customers you should avoid because they require more support, implementation, or customization than your team can currently handle?", type: "textarea", full: true, placeholder: "Example: We avoid enterprise customers requiring custom integrations because our team is small." },
        { id: "lowYieldActivity", label: "Which sales, marketing, GTM activity, or deal stage consumes significant time but produces little pipeline, revenue, or learning?", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add low-yield activity or stage", otherLabel: "Define other low-yield activity or stage", requireOther: true, options: ["Trade shows", "Cold email campaigns", "Cold calling", "Social posting", "Content creation", "Paid ads", "Webinars / events", "Manual reporting", "Manual prospect research", "Unqualified discovery calls", "Custom demos", "Proposal / quote creation", "Procurement stage", "Security or legal review stage", "Technical evaluation stage", "Implementation scoping stage", "Custom development before close", "Internal handoff / approval stage", "Follow-up with stalled opportunities", "Low-fit customer support", "Other"] }
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
            { id: "provenCustomerOutcomes", label: "Which customer outcomes can you realistically prove?", type: "multiSelectDropdown", hint: "Select outcomes you could support with a case study, testimonial, ROI analysis, pilot result, customer reference, usage data, referral, review, or measurable result.", optionsFromMultiselect: "usageProof", options: ["Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Improve adoption", "Improve retention", "Improve customer satisfaction", "Improve productivity", "Reduce implementation burden", "Other measurable outcome"] }
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
                { id: "ownerNextAction", label: "Owner / next action", type: "text", placeholder: "Example: Sarah to ask for quote after the customer call." }
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
              title: "",
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
                { id: "procurement-finance", label: "Finance / Procurement" },
                { id: "legal", label: "Legal" },
                { id: "operations", label: "Operations" },
                { id: "customer-success-support", label: "Customer Success / Support" },
                { id: "external-advisor-consultant", label: "External Advisor / Consultant" },
                { id: "board-investor", label: "Board / Investor" },
                { id: "likely-blocker", label: "Likely Blocker" }
              ],
              columns: [
                { id: "involved", label: "Is this role involved?", type: "select", group: "Role", options: ["", "Yes", "No", "Not sure"] },
                { id: "commonTitles", label: "Common titles", type: "text", group: "Role", placeholder: "Example: CEO, Founder, COO, CFO, VP Sales" },
                { id: "roleInDecision", label: "Role in the decision", type: "multiSelectDropdown", group: "Role", options: ["Owns budget", "Approves purchase", "Feels pain", "Sponsors initiative", "Uses solution", "Implements solution", "Reviews technical / security risk", "Reviews financial / procurement risk", "Influences decision", "Blocks decision", "Signs contract", "Measures success", "Other"] },
                { id: "influenceLevel", label: "Influence level", type: "select", group: "Role", options: ["", "High", "Medium", "Low", "Unknown"] },
                { id: "decisionPower", label: "Decision power", type: "select", group: "Role", options: ["", "High", "Medium", "Low", "Unknown"] },
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
                { id: "targetCustomerGroup", label: "Customer groups this offer is for", type: "multiSelectDropdown", dynamicOptionsFrom: "possibleCustomerGroups", options: ["Create a new customer group for this offer", "Not sure yet"] },
                { id: "newOfferCustomerGroup", label: "New customer group for this offer", type: "text", showWhen: { field: "targetCustomerGroup", contains: "Create a new customer group for this offer" }, placeholder: "Example: Early-stage SaaS companies with founder-led sales" },
                { id: "primaryBuyer", label: "Who is the primary buyer or decision driver for this offer?", type: "select", otherLabel: "Define other primary buyer", requireOther: true, hint: "Choose the person who has the strongest reason to care, the authority to move the decision forward, or the most influence over whether this offer gets prioritized.", options: ["", "CEO / Founder", "President / Owner", "COO / Operations Leader", "CFO / Finance Leader", "CMO / Marketing Leader", "CRO / Sales Leader", "Product Leader", "IT / Technical Leader", "HR / People Leader", "Department Head", "Franchise Owner / Operator", "Procurement", "Other", "Not sure yet"] },
                { id: "buyingCommitteeRoles", label: "Who else is usually involved in the buying decision?", type: "multiSelectDropdown", hint: "Buying decisions usually involve more than one person. Select the other roles that influence, approve, use, implement, or block this purchase.", options: ["Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Finance / Procurement", "Technical / Security Reviewer", "Legal", "Operations", "Customer Success / Support", "Likely Blocker", "External Advisor / Consultant", "Board / Investor", "Other", "Not sure yet"] },
                { id: "buyingCommitteePrimaryConcern", label: "Primary committee concerns", type: "multiSelectDropdown", options: ["ROI", "Risk", "Price", "Implementation effort", "Adoption", "Quality", "Speed", "Compliance", "Disruption", "Internal capacity", "Security", "Procurement complexity", "Other"] },
                { id: "buyingCommitteeProofNeeded", label: "Proof needed by the committee", type: "multiSelectDropdown", options: ["ROI calculator", "Case study", "Demo", "Implementation plan", "Testimonial", "Pricing / business case", "Security packet", "Reference customer", "Before / after story", "Other"] },
                { id: "buyingCommitteeLikelyObjection", label: "Likely committee objection", type: "multiSelectDropdown", options: ["Price", "Risk", "Competing priorities", "Change effort", "Lack of proof", "Technical / security concern", "Unclear ROI", "Procurement friction", "Other"] },
                { id: "buyingCommitteeMessageAngle", label: "Suggested message angle for the buying committee", type: "textarea", full: true, placeholder: "The tool will suggest this from the buyer, committee roles, concerns, proof needs, and available assets." },
                { id: "buyingCommitteeMissingAssetNote", label: "Potential missing asset", type: "textarea", full: true, placeholder: "The tool will flag valuable proof or sales assets that may be missing." },
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
          hint: "Define the shared data sources, owners, cadence, and cross-play disqualification rules that support all targeting strategies. These are not about one customer; they apply only when a rule should reduce priority across every customer group or play.",
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
              title: "Cross-Play Disqualification Rules",
              layout: "cards",
              repeatable: true,
              rowLabel: "Disqualification Rule",
              minRows: 1,
              maxRows: 20,
              addLabel: "Add cross-play rule",
              columns: [
                { id: "signal", label: "What would make any account lower priority?", type: "select", options: ["", "No clear budget owner", "Company too small", "Too custom", "Poor data quality", "Heavy implementation burden", "Long procurement cycle", "Low urgency", "Wrong geography", "Unsupported tech stack", "No executive sponsor", "Low strategic value", "Low margin", "Other"] },
                { id: "action", label: "What should happen by default?", type: "select", options: ["", "Reduce score", "Disqualify", "Needs review", "Nurture only", "Ask qualification question"] },
                { id: "whyItMatters", label: "What evidence makes this a real rule?", type: "textarea", placeholder: "Example: Deals without a budget owner stall after discovery and do not convert." }
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
                { id: "primaryBuyerPersona", label: "Primary buyer persona", type: "select", options: ["", "Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Finance / Procurement", "Technical / Security Reviewer", "Legal", "Operations", "Customer Success / Support", "Likely Blocker", "External Advisor / Consultant", "Board / Investor", "Other", "Not sure yet"] },
                { id: "buyingCommitteeRoles", label: "Who else is usually involved in this buying decision?", type: "multiSelectDropdown", hint: "Select the other roles that influence, approve, use, implement, or block this targeting play.", options: ["Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Finance / Procurement", "Technical / Security Reviewer", "Legal", "Operations", "Customer Success / Support", "Likely Blocker", "External Advisor / Consultant", "Board / Investor", "Other", "Not sure yet"] },
                { id: "gtmMotion", label: "GTM motion / channel", type: "select", options: ["", "Outbound sales", "Inbound lead qualification", "Account-based marketing", "Partner / referral motion", "Paid acquisition", "Events / webinars", "Expansion / customer success", "Product-led motion", "Founder-led selling", "Retail / local selling", "Not sure yet", "Other"] },
                { id: "playPriority", label: "Priority", type: "select", hint: "Primary means this is the targeting play the action plan should focus on first.", options: ["", "Primary targeting strategy", "Secondary", "Future", "Not sure"] },
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
      description: "Inventory possible channels and revenue motions, then choose which motion is ready enough to test, structure, or improve.",
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
              title: "",
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
          hint: "First define possible revenue motions. A channel/source is where opportunities come from, such as referrals, outbound, inbound, partners, paid search, events, or customer expansion. A sales motion is how the opportunity is worked, such as founder-led, inside sales, partner-led, self-serve, or consultative selling. A revenue motion combines customer group, offer, channel/source, sales motion, owner, and goal. Do not name the motion with only a channel like Cold calls or only a sales motion like Founder-led.",
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
                { id: "playName", label: "Name this complete revenue motion", type: "text", placeholder: "Example: Founder-led referral motion for price-check wedge offer" },
                { id: "currentStatus", label: "Is this motion active today?", type: "select", options: ["", "Active and working", "Active but inconsistent", "Testing now", "Planned but not tested", "Possible idea", "Not sure"] },
                { id: "customerGroup", label: "Which customer group would this motion target?", type: "select", dynamicOptionsFrom: "revenueCustomerGroups", options: ["Create a new customer group for this motion", "Not sure yet"] },
                { id: "newCustomerGroup", label: "New customer group for this motion", type: "text" },
                { id: "offer", label: "Which offer or use case would this motion promote?", type: "select", dynamicOptionsFrom: "revenueOffers", options: ["Create a new offer for this motion", "Not sure yet"] },
                { id: "newOffer", label: "New offer for this motion", type: "text" },
                { id: "channelSource", label: "Where would the opportunity come from? (channel / source)", type: "select", options: ["", "Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Social media posts", "Social media ads", "Website conversion / booking flow", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Network referrals", "Customer referrals", "Trade shows", "Partners / affiliates / resellers", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Customer success outreach", "Product usage / product-led", "Retail / field / local selling", "Other", "Not sure yet"] },
                { id: "salesMotionType", label: "How would the opportunity be worked? (sales motion)", type: "select", options: ["", "Founder-led", "Inside sales", "Field sales", "Enterprise sales", "Partner-led", "Product-led", "Ecommerce / self-serve", "Customer expansion", "Account management", "Services / consultative selling", "Hybrid", "Not sure yet", "Other"] },
                { id: "primaryBuyer", label: "Who would this motion need to reach first?", type: "select", dynamicOptionsFrom: "revenueBuyerRoles", otherLabel: "Define other buyer role or title", requireOther: true, hint: "Choose the specific role or title the motion should reach first. Roles already named elsewhere in the intake appear first.", options: ["", "CEO / Founder / Owner", "COO", "CFO", "CRO", "CMO", "CTO / CIO", "VP Sales / Head of Sales", "VP Marketing / Head of Marketing", "VP Operations / Head of Operations", "VP Finance / Finance Director", "VP Customer Success / Head of Customer Success", "Revenue Operations / Sales Operations", "Procurement / Purchasing", "IT / Security", "Legal / Compliance", "Department Manager", "Store / Category Buyer", "Distributor / Channel Partner", "End User / Practitioner", "Economic Buyer", "Executive Sponsor", "Champion", "Implementation Owner", "Likely Blocker", "Other", "Not sure yet"] },
                { id: "buyingCommitteeRoles", label: "Who else is usually involved in this revenue motion?", type: "multiSelectDropdown", dynamicOptionsFrom: "revenueBuyerRoles", otherLabel: "Define other stakeholder role or title", requireOther: true, hint: "Select the specific titles or roles that influence, approve, implement, use, review risk, or block this motion. Roles already named elsewhere in the intake appear first.", options: ["CEO / Founder / Owner", "COO", "CFO", "CRO", "CMO", "CTO / CIO", "VP Sales / Head of Sales", "VP Marketing / Head of Marketing", "VP Operations / Head of Operations", "VP Finance / Finance Director", "VP Customer Success / Head of Customer Success", "Revenue Operations / Sales Operations", "Procurement / Purchasing", "IT / Security", "Legal / Compliance", "Department Manager", "Store / Category Buyer", "Distributor / Channel Partner", "End User / Practitioner", "Economic Buyer", "Executive Sponsor", "Champion", "Implementation Owner", "Likely Blocker", "Other", "Not sure yet"] },
                { id: "linkedSignalPlay", label: "Related targeting strategy", type: "select", dynamicOptionsFrom: "signalPlayPortfolio", options: ["Not linked yet"] },
                { id: "playGoal", label: "What would this motion need to create?", type: "text", placeholder: "Example: Book 10 qualified diagnostics in 60 days." },
                { id: "evidenceOrUnknowns", label: "What evidence or unknowns do we have about this motion?", type: "textarea", placeholder: "Example: Referrals have closed before, but we do not know if LinkedIn outbound can create qualified calls." },
                { id: "playPriority", label: "Priority", type: "select", options: ["", "Primary revenue motion", "Secondary", "Future", "Not sure"] },
                { id: "assessmentDepth", label: "Assessment depth", type: "select", options: ["", "Summary only", "Full motion analysis"], hint: "Choose Full motion analysis for revenue motions you want scored and turned into operating recommendations." }
              ]
            }
          ]
        },
        {
          title: "Primary Revenue Motion",
          fields: [
            { id: "primaryRevenueMotion", label: "After comparing the options above, which revenue motion should be the primary GTM focus for the next 90 days?", type: "select", dynamicOptionsFrom: "revenueMotionPortfolio", options: [], hint: "Choose the motion that is clearest, most realistic to run, and most connected to the priority customer group and offer. Other motions can still be summarized or fully assessed." }
          ]
        },
        {
          title: "Revenue Motion Readiness Assessments",
          hint: "Detailed assessment panels appear here for revenue motions marked Full motion analysis."
        }
      ],
      legacyTables: [
        { id: "channelPerformance", title: "Channel Performance", rows: ["Inbound website leads", "Direct outbound email", "Cold calling", "LinkedIn / social selling", "Social media posts", "Social media ads", "Website conversion / booking flow", "Content / SEO", "Paid search / paid social", "Events / webinars / communities", "Network referrals", "Customer referrals", "Trade shows", "Partners / affiliates / resellers", "Marketplaces / app stores / directories", "Current customer expansion / upsell", "Retail / field / local selling", "Other"], columns: [{ id: "channel", label: "Channel", type: "text" }, { id: "currentActivity", label: "Channel description", type: "text" }, { id: "active", label: "Performance status", type: "select", options: ["", "Active and working", "Active but unproven", "Paused", "Not active"] }, { id: "revenueRank", label: "Revenue rank", type: "select", options: ["", "1", "2", "3", "4", "5"] }, { id: "last90DayResults", label: "Last 90-day results", type: "text" }, { id: "owner", label: "Owner", type: "select", options: ["", "Founder", "Marketing Lead", "Sales Lead", "Other"] }, { id: "confidence", label: "Confidence", type: "select", options: ["", "High", "Medium", "Low"] }, { id: "notes", label: "Notes", type: "text" }] },
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
