(function () {
  const INDUSTRY_OPTIONS = [
    { id: "healthcare_providers", label: "Healthcare Providers", group: "Healthcare & Life Sciences" },
    { id: "digital_health", label: "Digital Health", group: "Healthcare & Life Sciences" },
    { id: "biotechnology", label: "Biotechnology", group: "Healthcare & Life Sciences" },
    { id: "pharmaceuticals", label: "Pharmaceuticals", group: "Healthcare & Life Sciences" },
    { id: "medical_devices", label: "Medical Devices", group: "Healthcare & Life Sciences" },
    { id: "health_wellness", label: "Health & Wellness", group: "Healthcare & Life Sciences" },
    { id: "banking", label: "Banking", group: "Financial Services" },
    { id: "fintech", label: "Fintech", group: "Financial Services" },
    { id: "payments", label: "Payments", group: "Financial Services" },
    { id: "insurance", label: "Insurance", group: "Financial Services" },
    { id: "wealth_management", label: "Wealth Management", group: "Financial Services" },
    { id: "accounting_bookkeeping", label: "Accounting & Bookkeeping", group: "Financial Services" },
    { id: "k12_education", label: "K-12 Education", group: "Education" },
    { id: "higher_education", label: "Higher Education", group: "Education" },
    { id: "online_education", label: "Online Education", group: "Education" },
    { id: "corporate_training", label: "Corporate Training", group: "Education" },
    { id: "tutoring_coaching", label: "Tutoring & Coaching", group: "Education" },
    { id: "online_retail", label: "Online Retail", group: "Retail & Ecommerce" },
    { id: "brick_and_mortar_retail", label: "Brick-and-Mortar Retail", group: "Retail & Ecommerce" },
    { id: "consumer_products", label: "Consumer Products", group: "Retail & Ecommerce" },
    { id: "fashion_apparel", label: "Fashion & Apparel", group: "Retail & Ecommerce" },
    { id: "beauty_personal_care", label: "Beauty & Personal Care", group: "Retail & Ecommerce" },
    { id: "restaurants", label: "Restaurants", group: "Food, Beverage & Hospitality" },
    { id: "food_beverage_products", label: "Food & Beverage Products", group: "Food, Beverage & Hospitality" },
    { id: "hotels_lodging", label: "Hotels & Lodging", group: "Food, Beverage & Hospitality" },
    { id: "travel_tourism", label: "Travel & Tourism", group: "Food, Beverage & Hospitality" },
    { id: "events_hospitality", label: "Events & Hospitality", group: "Food, Beverage & Hospitality" },
    { id: "residential_real_estate", label: "Residential Real Estate", group: "Real Estate & Property" },
    { id: "commercial_real_estate", label: "Commercial Real Estate", group: "Real Estate & Property" },
    { id: "property_management", label: "Property Management", group: "Real Estate & Property" },
    { id: "construction_property_tech", label: "Construction & Property Tech", group: "Real Estate & Property" },
    { id: "home_services", label: "Home Services", group: "Home & Local Services" },
    { id: "repair_maintenance", label: "Repair & Maintenance", group: "Home & Local Services" },
    { id: "cleaning_services", label: "Cleaning Services", group: "Home & Local Services" },
    { id: "landscaping", label: "Landscaping", group: "Home & Local Services" },
    { id: "personal_services", label: "Personal Services", group: "Home & Local Services" },
    { id: "consulting", label: "Consulting", group: "Professional Services" },
    { id: "marketing_advertising", label: "Marketing & Advertising", group: "Professional Services" },
    { id: "legal_services", label: "Legal Services", group: "Professional Services" },
    { id: "hr_recruiting", label: "HR & Recruiting", group: "Professional Services" },
    { id: "business_services", label: "Business Services", group: "Professional Services" },
    { id: "cybersecurity", label: "Cybersecurity", group: "Technology & IT" },
    { id: "it_services", label: "IT Services", group: "Technology & IT" },
    { id: "cloud_infrastructure", label: "Cloud & Infrastructure", group: "Technology & IT" },
    { id: "data_analytics", label: "Data & Analytics", group: "Technology & IT" },
    { id: "ai_automation", label: "AI & Automation", group: "Technology & IT" },
    { id: "media_publishing", label: "Media & Publishing", group: "Media, Entertainment & Creator Economy" },
    { id: "entertainment", label: "Entertainment", group: "Media, Entertainment & Creator Economy" },
    { id: "gaming", label: "Gaming", group: "Media, Entertainment & Creator Economy" },
    { id: "music_audio", label: "Music & Audio", group: "Media, Entertainment & Creator Economy" },
    { id: "creator_influencer_business", label: "Creator / Influencer Business", group: "Media, Entertainment & Creator Economy" },
    { id: "manufacturing", label: "Manufacturing", group: "Manufacturing & Industrial" },
    { id: "industrial_products", label: "Industrial Products", group: "Manufacturing & Industrial" },
    { id: "chemicals_materials", label: "Chemicals & Materials", group: "Manufacturing & Industrial" },
    { id: "packaging", label: "Packaging", group: "Manufacturing & Industrial" },
    { id: "machinery_equipment", label: "Machinery & Equipment", group: "Manufacturing & Industrial" },
    { id: "freight_logistics", label: "Freight & Logistics", group: "Logistics & Transportation" },
    { id: "delivery", label: "Delivery", group: "Logistics & Transportation" },
    { id: "trucking", label: "Trucking", group: "Logistics & Transportation" },
    { id: "mobility", label: "Mobility", group: "Logistics & Transportation" },
    { id: "supply_chain", label: "Supply Chain", group: "Logistics & Transportation" },
    { id: "energy", label: "Energy", group: "Energy & Utilities" },
    { id: "renewable_energy", label: "Renewable Energy", group: "Energy & Utilities" },
    { id: "utilities", label: "Utilities", group: "Energy & Utilities" },
    { id: "climate_sustainability", label: "Climate & Sustainability", group: "Energy & Utilities" },
    { id: "agriculture", label: "Agriculture", group: "Agriculture & Natural Resources" },
    { id: "food_production", label: "Food Production", group: "Agriculture & Natural Resources" },
    { id: "forestry_fishing", label: "Forestry & Fishing", group: "Agriculture & Natural Resources" },
    { id: "mining_natural_resources", label: "Mining & Natural Resources", group: "Agriculture & Natural Resources" },
    { id: "government", label: "Government", group: "Government, Nonprofit & Public Sector" },
    { id: "nonprofit", label: "Nonprofit", group: "Government, Nonprofit & Public Sector" },
    { id: "civic_social_impact", label: "Civic & Social Impact", group: "Government, Nonprofit & Public Sector" },
    { id: "public_safety", label: "Public Safety", group: "Government, Nonprofit & Public Sector" },
    { id: "other_not_sure", label: "Other / Not sure", group: "Other" }
  ];

  const BUSINESS_TYPE_OPTIONS = [
    { id: "b2b_saas", label: "B2B SaaS", group: "Software / Digital Product" },
    { id: "enterprise_saas", label: "Enterprise SaaS", group: "Software / Digital Product" },
    { id: "self_serve_plg_saas", label: "Self-serve / Product-led SaaS", group: "Software / Digital Product" },
    { id: "developer_tool_api", label: "Developer Tool / API", group: "Software / Digital Product" },
    { id: "consumer_app", label: "Consumer App", group: "Software / Digital Product" },
    { id: "ai_software_automation_tool", label: "AI Software / Automation Tool", group: "Software / Digital Product" },
    { id: "consulting_firm", label: "Consulting Firm", group: "Services" },
    { id: "agency", label: "Agency", group: "Services" },
    { id: "professional_services_firm", label: "Professional Services Firm", group: "Services" },
    { id: "managed_services_provider", label: "Managed Services Provider", group: "Services" },
    { id: "implementation_services_partner", label: "Implementation / Services Partner", group: "Services" },
    { id: "coaching_training_business", label: "Coaching / Training Business", group: "Services" },
    { id: "dtc_ecommerce_brand", label: "DTC Ecommerce Brand", group: "Ecommerce / Physical Product" },
    { id: "retail_business", label: "Retail Business", group: "Ecommerce / Physical Product" },
    { id: "wholesale_product_business", label: "Wholesale Product Business", group: "Ecommerce / Physical Product" },
    { id: "subscription_box", label: "Subscription Box", group: "Ecommerce / Physical Product" },
    { id: "marketplace_seller", label: "Marketplace Seller", group: "Ecommerce / Physical Product" },
    { id: "consumer_packaged_goods_brand", label: "Consumer Packaged Goods Brand", group: "Ecommerce / Physical Product" },
    { id: "two_sided_marketplace", label: "Two-sided Marketplace", group: "Marketplace / Platform" },
    { id: "b2b_marketplace", label: "B2B Marketplace", group: "Marketplace / Platform" },
    { id: "creator_platform", label: "Creator Platform", group: "Marketplace / Platform" },
    { id: "community_platform", label: "Community Platform", group: "Marketplace / Platform" },
    { id: "booking_listing_platform", label: "Booking / Listing Platform", group: "Marketplace / Platform" },
    { id: "local_service_business", label: "Local Service Business", group: "Local / Location-Based Business" },
    { id: "local_retail_business", label: "Local Retail Business", group: "Local / Location-Based Business" },
    { id: "restaurant_hospitality_business", label: "Restaurant / Hospitality Business", group: "Local / Location-Based Business" },
    { id: "clinic_wellness_practice", label: "Clinic / Wellness Practice", group: "Local / Location-Based Business" },
    { id: "franchise_location_based_business", label: "Franchise / Location-Based Business", group: "Local / Location-Based Business" },
    { id: "course_business", label: "Course Business", group: "Media / Content / Education" },
    { id: "newsletter_media_business", label: "Newsletter / Media Business", group: "Media / Content / Education" },
    { id: "membership_community", label: "Membership Community", group: "Media / Content / Education" },
    { id: "events_business", label: "Events Business", group: "Media / Content / Education" },
    { id: "podcast_video_media_brand", label: "Podcast / Video / Media Brand", group: "Media / Content / Education" },
    { id: "manufacturing_business", label: "Manufacturing Business", group: "Industrial / B2B Product" },
    { id: "hardware_equipment_company", label: "Hardware / Equipment Company", group: "Industrial / B2B Product" },
    { id: "logistics_supply_chain_business", label: "Logistics / Supply Chain Business", group: "Industrial / B2B Product" },
    { id: "distribution_business", label: "Distribution Business", group: "Industrial / B2B Product" },
    { id: "nonprofit_organization", label: "Nonprofit Organization", group: "Nonprofit / Public Sector" },
    { id: "government_public_sector_organization", label: "Government / Public-Sector Organization", group: "Nonprofit / Public Sector" },
    { id: "social_impact_organization", label: "Social Impact Organization", group: "Nonprofit / Public Sector" },
    { id: "other_not_sure", label: "Other / Not sure", group: "Other" }
  ];

  const ARCHETYPE_GROUPS = [
    { id: "b2b_software", label: "B2B Software", scoreModel: "b2b_software", businessTypes: ["b2b_saas", "enterprise_saas", "self_serve_plg_saas", "developer_tool_api", "ai_software_automation_tool"] },
    { id: "services", label: "Services Business", scoreModel: "services", businessTypes: ["consulting_firm", "agency", "professional_services_firm", "managed_services_provider", "implementation_services_partner", "coaching_training_business"] },
    { id: "ecommerce_physical_product", label: "Ecommerce / Physical Product", scoreModel: "ecommerce_physical_product", businessTypes: ["dtc_ecommerce_brand", "retail_business", "wholesale_product_business", "subscription_box", "marketplace_seller", "consumer_packaged_goods_brand"] },
    { id: "marketplace_platform", label: "Marketplace / Platform", scoreModel: "marketplace_platform", businessTypes: ["two_sided_marketplace", "b2b_marketplace", "creator_platform", "community_platform", "booking_listing_platform"] },
    { id: "local_business", label: "Local / Location-Based Business", scoreModel: "local_business", businessTypes: ["local_service_business", "local_retail_business", "restaurant_hospitality_business", "clinic_wellness_practice", "franchise_location_based_business"] },
    { id: "media_content_education", label: "Media / Content / Education", scoreModel: "media_content_education", businessTypes: ["course_business", "newsletter_media_business", "membership_community", "events_business", "podcast_video_media_brand"] },
    { id: "industrial_b2b", label: "Industrial / B2B", scoreModel: "industrial_b2b", businessTypes: ["manufacturing_business", "hardware_equipment_company", "logistics_supply_chain_business", "distribution_business"] },
    { id: "nonprofit_public_sector", label: "Nonprofit / Public Sector", scoreModel: "nonprofit_public_sector", businessTypes: ["nonprofit_organization", "government_public_sector_organization", "social_impact_organization"] }
  ];

  const TRUST_SENSITIVE_INDUSTRIES = new Set([
    "healthcare_providers",
    "digital_health",
    "biotechnology",
    "pharmaceuticals",
    "medical_devices",
    "banking",
    "fintech",
    "payments",
    "insurance",
    "government",
    "public_safety",
    "legal_services"
  ]);

  function getIndustryById(id) {
    return INDUSTRY_OPTIONS.find((option) => option.id === id);
  }

  function getBusinessTypeById(id) {
    return BUSINESS_TYPE_OPTIONS.find((option) => option.id === id);
  }

  function deriveGtmArchetype(industryId, businessTypeId) {
    const match = ARCHETYPE_GROUPS.find((group) => group.businessTypes.includes(businessTypeId));
    const archetype = match || {
      id: "general",
      label: "General / Needs Review",
      scoreModel: "general"
    };
    const notes = [];

    if (TRUST_SENSITIVE_INDUSTRIES.has(industryId)) {
      notes.push("Likely regulated or trust-sensitive GTM motion.");
    }

    return {
      id: archetype.id,
      label: archetype.label,
      scoreModel: archetype.scoreModel,
      notes
    };
  }

  window.GTM_TAXONOMY = {
    INDUSTRY_OPTIONS,
    BUSINESS_TYPE_OPTIONS,
    getIndustryById,
    getBusinessTypeById,
    deriveGtmArchetype
  };
})();
