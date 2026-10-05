// Orientation Data: Scientific Concepts, PPE Equipment, and Handwashing Protocol

export const LECTURE_CONCEPTS = [
  {
    id: "ubod",
    title: "Coconut Palm",
    tag: "",
    icon: "🥥",
    summary: "",
    details: "The term coconut refers to the fruit of the coconut palm. Coir fibre and fibre palm are extracted from the coconut husk. This will be the main ingredient."
  },
  {
    id: "steaming",
    title: "Steaming",
    tag: "",
    icon: "♨️",
    summary: "",
    details: "Steaming is a moist-heat cooking method that helps to cook food using the hot vapor from boiling or simmering water below."
  },
  {
    id: "dehydration",
    title: "Dehydration",
    tag: "",
    icon: "💨",
    summary: "",
    details: "Dehydration keeps heat trapped and protects food from dust or pests. It also removes food moisture content."
  },
  {
    id: "flash_puffing",
    title: "Deep Frying",
    tag: "",
    icon: "🍳",
    summary: "",
    details: "A really fast cooking method where the food is completely covered in hot oil."
  }
];

export const PPE_ITEMS = [
  {
    id: "hairnet",
    name: "Sanitary Hairnet",
    icon: "🧢",
    img: "/assets/ppe_hairnet.webp",
    role: "Restrains stray hair strands from falling into food products.",
    isCorrect: true,
    critical: true
  },
  {
    id: "apron",
    name: "Clean Lab Gown / Apron",
    icon: "🥼",
    img: "/assets/ppe_clean_apron.webp",
    role: "Shields clothing fibers and outdoor dust from contaminating sanitized prep surfaces.",
    isCorrect: true,
    critical: true
  },
  {
    id: "distractor_scarf",
    name: "Knitted Wool Scarf",
    icon: "🧣",
    img: "/assets/distractor_scarf.webp",
    role: "Loose knitted cloth that traps dust, sheds loose fibers into food, and poses a burn risk near stoves.",
    isCorrect: false,
    reason: "Teacher mia: You selected the wrong attire! Knitted scarf shouldn’t be use. It can cause hazard like near burns.",
    critical: false
  },
  {
    id: "mask",
    name: "Clear Spit Guard / Mask",
    icon: "😷",
    img: "/assets/ppe_spit_guard.webp",
    role: "Prevents oral droplet dispersal while speaking near open food vessels.",
    isCorrect: true,
    critical: true
  },
  {
    id: "distractor_goggles",
    name: "Heavy Chemical Goggles",
    icon: "🥽",
    img: "/assets/distractor_goggles.webp",
    role: "Enclosed chemical lab goggles that fog up from hot cooking steam and obstruct culinary visibility.",
    isCorrect: false,
    reason: "Teacher mia: You selected the wrong attire! Heavy goggles shouldn’t wear because you won’t be able to see clearly.",
    critical: false
  },
  {
    id: "gloves",
    name: "Food-Grade Vinyl Gloves",
    icon: "🧤",
    img: "/assets/ppe_food_gloves.webp",
    role: "Maintains sterile contact with ingredients and ready-to-eat crackers.",
    isCorrect: true,
    critical: true
  },
  {
    id: "heat_gloves",
    name: "Thermal Heat Mitts",
    icon: "🧤",
    img: "/assets/ppe_heat_gloves.webp",
    role: "Protects hands from burns during high-heat steaming and deep frying operations.",
    isCorrect: true,
    critical: true
  },
  {
    id: "shoes",
    name: "Non-Slip Safety Shoes",
    icon: "👟",
    img: "/assets/ppe_shoes.webp",
    role: "Closed-toe non-skid footwear prevents slips and protects from hot liquid spills.",
    isCorrect: true,
    critical: true
  }
];

export const HANDWASHING_STEPS = [
  {
    id: "wet_hands",
    step: 1,
    action: "Wet Hands with Clean Water",
    desc: "Wet hands thoroughly under clean, warm running potable water before applying cleanser.",
    icon: "🚰",
    isCorrect: true,
    reason: "Water wets skin and creates the emulsion base needed for soap lathering."
  },
  {
    id: "apply_soap",
    step: 2,
    action: "Apply Antibacterial Soap",
    desc: "Dispense enough antibacterial soap to cover all hand and palm surfaces.",
    icon: "🧼",
    img: "/assets/sanitation_handwash_soap.webp",
    isCorrect: true,
    reason: "Soap surfactants emulsify surface oils and trap food residues and microbes."
  },
  {
    id: "distractor_quick_rinse",
    step: null,
    action: "Quick Water-Only Splash (No Soap)",
    desc: "Rinse hands quickly under cold water for 3 seconds without dispensing soap.",
    icon: "🌊",
    isCorrect: false,
    reason: "Water alone cannot dissolve grease or break down lipophilic bacterial cell membranes."
  },
  {
    id: "rub_palms",
    step: 3,
    action: "Rub Palms & Interlace Fingers",
    desc: "Rub palm to palm and interlace fingers to clean webbing between digits.",
    icon: "👐",
    isCorrect: true,
    reason: "Mechanical friction dislodges bacteria hidden between webbed fingers."
  },
  {
    id: "scrub_backs",
    step: 4,
    action: "Scrub Backs of Hands & Thumbs",
    desc: "Rub right palm over left dorsum with interlaced fingers, rotate around both thumbs.",
    icon: "✋",
    isCorrect: true,
    reason: "Dorsal skin and thumbs are the most frequently missed areas during hand hygiene."
  },
  {
    id: "distractor_sanitizer_grease",
    step: null,
    action: "Apply Alcohol Gel on Greasy Hands",
    desc: "Squirt alcohol hand rub directly onto oily, visibly soiled hands instead of washing.",
    icon: "🧴",
    isCorrect: false,
    reason: "Alcohol gel is inactivated by organic grease and food soil; soap and water is mandatory for soiled hands."
  },
  {
    id: "scrub_nails",
    step: 5,
    action: "Scrub Nails & Fingertips",
    desc: "Rub rotational fingertips back and forth in opposite palms to scrub subungual areas.",
    icon: "💅",
    isCorrect: true,
    reason: "Nail beds harbor high densities of bacteria and food soil that require direct friction."
  },
  {
    id: "rinse_hands",
    step: 6,
    action: "Rinse Thoroughly for 20 Seconds",
    desc: "Rinse all lather and suspended dirt away completely under continuous flowing water.",
    icon: "💧",
    isCorrect: true,
    reason: "Flowing water carries away emulsified soil, dead skin cells, and dislodged pathogens."
  },
  {
    id: "distractor_wipe_apron",
    step: null,
    action: "Wipe Hands on Cooking Apron",
    desc: "Dry damp hands on work apron fabric to save time during food preparation.",
    icon: "🥼",
    isCorrect: false,
    reason: "Aprons collect grease and airborne contaminants; wiping on clothing instantly re-contaminates clean hands."
  },
  {
    id: "dry_towel",
    step: 7,
    action: "Dry with Single-Use Towel",
    desc: "Pat dry thoroughly with clean disposable paper towel; use towel to shut off faucet.",
    icon: "🧻",
    img: "/assets/sanitation_spray_cloth.webp",
    isCorrect: true,
    reason: "Single-use paper towels dry hands without recontamination and prevent bare-hand faucet contact."
  }
];

