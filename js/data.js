/* =========================================================
   SRI PROPERTIES — Property data
   Edit this file to add / change listings. Everything on the
   site (grid, filters, drawer, booking form) is generated
   from this array.
   ========================================================= */

window.SITE_CONFIG = {
  currency: "USD",
  locale: "en-US",
  areaUnit: "acres"
};

window.PROPERTIES = [
  {
    id: "golden-valley-farm-estate",
    title: "Golden Valley Farm Estate",
    type: "farmland",
    typeLabel: "Farmland",
    location: "Prairie County",
    price: 1250000,
    acres: 42,
    featured: 1,
    tag: "New listing",
    image: "assets/img/aerial-farmland.jpg",
    focus: "50% 60%",
    gallery: ["assets/img/aerial-farmland.jpg", "assets/img/drone-poster.jpg", "assets/img/drone-poster-2.jpg"],
    facts: { Water: "2 wells + canal", Soil: "Deep loam", Road: "Paved frontage", Power: "3-phase grid" },
    description:
      "A working patchwork of irrigated fields around a compact farmstead with barns, grain silos and equipment sheds. Gentle terrain, deep loam soil and paved road frontage make it ideal for row crops, leasing or long-term holding.",
    amenities: ["Equipment barns & grain silos", "Two tested borewells", "Canal irrigation rights", "Paved road frontage", "Surveyed & fenced boundary", "Clear title report on file"]
  },
  {
    id: "red-barn-homestead",
    title: "Red Barn Homestead",
    type: "farmhouse",
    typeLabel: "Farmhouse",
    location: "Maple Hollow",
    price: 685000,
    acres: 18,
    featured: 2,
    tag: "Most viewed",
    image: "assets/img/red-barn.jpg",
    focus: "45% 55%",
    gallery: ["assets/img/red-barn.jpg", "assets/img/aerial-farmland.jpg"],
    facts: { House: "3 bed farmhouse", Barn: "Restored red barn", Pasture: "14 acres", Water: "Spring-fed well" },
    description:
      "A storybook homestead in rolling green hills — a restored red barn with silo, a white three-bedroom farmhouse and post-and-rail fenced pastures. Move in, keep a small herd, and watch the sunset from the porch.",
    amenities: ["3-bedroom farmhouse", "Restored barn & silo", "Fenced pastures", "Spring-fed well", "Mature shade trees", "Gravel access lane"]
  },
  {
    id: "willow-creek-equestrian-ranch",
    title: "Willow Creek Equestrian Ranch",
    type: "ranch",
    typeLabel: "Ranch",
    location: "Blue Ridge",
    price: 3450000,
    acres: 65,
    featured: 3,
    tag: "Signature estate",
    image: "assets/img/luxury-ranch.jpg",
    focus: "45% 45%",
    gallery: ["assets/img/luxury-ranch.jpg", "assets/img/red-barn.jpg", "assets/img/mountain-house.jpg"],
    facts: { Manor: "6 bed stone manor", Paddocks: "5 fenced", Water: "Stocked pond", Stables: "12 stalls" },
    description:
      "A stone-and-timber manor set among landscaped gardens, a spring-fed pond with dock, and miles of white-board paddock fencing. Designed for horses, hospitality and multi-generational living.",
    amenities: ["6-bedroom stone manor", "12-stall stable", "Spring-fed pond & dock", "Landscaped gardens", "5 fenced paddocks", "Circular stone driveway"]
  },
  {
    id: "summit-ridge-retreat",
    title: "Summit Ridge Retreat",
    type: "retreat",
    typeLabel: "Mountain retreat",
    location: "Granite Peaks",
    price: 2180000,
    acres: 12,
    featured: 4,
    tag: "Panoramic views",
    image: "assets/img/mountain-house.jpg",
    focus: "30% 50%",
    gallery: ["assets/img/mountain-house.jpg", "assets/img/luxury-ranch.jpg"],
    facts: { Home: "4 bed glass lodge", View: "Peaks & river", Elevation: "Cliff-top", Access: "Private road" },
    description:
      "A cliff-top glass lodge with a cantilevered deck, stone fireplace and an uninterrupted view of snow-capped peaks and the river valley below. Terraced meadow land below the ridge is suited to grazing or orchards.",
    amenities: ["Cantilevered view deck", "Stone fireplace", "Floor-to-ceiling glazing", "Terraced meadow below", "River valley access", "Private road"]
  },
  {
    id: "amber-fields-plot",
    title: "Amber Fields",
    type: "farmland",
    typeLabel: "Farmland",
    location: "Wheatland Valley",
    price: 540000,
    acres: 25,
    featured: 5,
    tag: "Harvest ready",
    image: "assets/img/drone-poster.jpg",
    focus: "50% 50%",
    gallery: ["assets/img/drone-poster.jpg", "assets/img/drone-poster-2.jpg", "assets/img/aerial-farmland.jpg"],
    facts: { Crop: "Winter wheat", Soil: "Silty clay loam", Road: "Gravel road", Water: "Rain-fed + well" },
    description:
      "Wide, open wheat land in a gently rolling valley — currently under winter wheat with a local farmer happy to continue a lease. A low-maintenance holding with strong soil and good drainage.",
    amenities: ["Current crop in field", "Optional existing lease", "Good drainage", "Gravel road access", "Surveyed boundary", "Drone survey available"]
  },
  {
    id: "riverbend-pasture",
    title: "Riverbend Pasture",
    type: "farmland",
    typeLabel: "Farmland",
    location: "Granite Peaks",
    price: 295000,
    acres: 8,
    featured: 6,
    tag: "River frontage",
    image: "assets/img/mountain-house.jpg",
    focus: "82% 85%",
    gallery: ["assets/img/mountain-house.jpg", "assets/img/drone-poster-2.jpg"],
    facts: { Frontage: "River", Use: "Pasture / orchard", Road: "Valley lane", Power: "Nearby grid" },
    description:
      "Terraced green pasture curling along a clear mountain river, with a small barn and paddocks already in place. An affordable entry into valley land with spectacular surroundings.",
    amenities: ["River frontage", "Small barn on site", "Terraced pasture", "Valley lane access", "Grid power nearby", "Mountain views"]
  },
  {
    id: "meadowlark-orchard-plots",
    title: "Meadowlark Orchard Plots",
    type: "farmland",
    typeLabel: "Farmland",
    location: "Prairie County",
    price: 165000,
    acres: 5,
    featured: 7,
    tag: "Starter plot",
    image: "assets/img/aerial-farmland.jpg",
    focus: "85% 75%",
    gallery: ["assets/img/aerial-farmland.jpg", "assets/img/drone-poster-2.jpg"],
    facts: { Plot: "5 acres", Use: "Orchard / garden", Water: "Shared well", Road: "Farm road" },
    description:
      "Neatly surveyed five-acre plots carved from a larger farm, each with water access and farm-road frontage. A great first step into land ownership — plant an orchard, a kitchen garden, or simply hold.",
    amenities: ["Individually surveyed", "Shared well access", "Farm road frontage", "Optional orchard planting", "Optional caretaker", "Clear individual titles"]
  },
  {
    id: "stonegate-pond-estate",
    title: "Stonegate Pond Estate",
    type: "ranch",
    typeLabel: "Ranch",
    location: "Blue Ridge",
    price: 1890000,
    acres: 34,
    featured: 8,
    tag: "Lakeside",
    image: "assets/img/luxury-ranch.jpg",
    focus: "90% 70%",
    gallery: ["assets/img/luxury-ranch.jpg", "assets/img/red-barn.jpg"],
    facts: { Water: "Private pond", Pasture: "28 acres", Fencing: "Board fence", Build: "Approved site" },
    description:
      "Rolling pasture around a reflective private pond, enclosed by stone pillars and board fencing, with an approved building site overlooking the water. Bring your architect.",
    amenities: ["Private pond with dock", "Approved building site", "Stone-pillar entrance", "Board-fenced pasture", "Mature hardwoods", "Utilities at boundary"]
  }
];

// Site currently lists farmland only.
window.PROPERTIES = window.PROPERTIES.filter((p) => p.type === "farmland");
