// Inspection Minigame Data: Tool Safety & Ingredient Quality
// Each target has one correct option followed by two plausible distractors.
// The inspection component randomizes their display positions at runtime.

const option = (id, name, description, img, fallbackIcon, reason) => ({
  id,
  name,
  description,
  img,
  fallbackIcon,
  reason,
});

export const TOOL_INSPECTION_ITEMS = [
  {
    id: 'knife', name: 'Knife', toolType: 'Cutting Tool',
    correctOption: option('knife-correct', 'Sanitized Stainless Chef Knife', 'Pristine stainless steel blade, razor-sharp edge, and a tight, clean handle.', '/assets/tool_knife_safe.webp', '🔪', 'Correct: this is the requested knife for sanitary food preparation.'),
    distractors: [
      option('knife-bread', 'Bread Knife', 'Long serrated blade designed for slicing bread and delicate baked goods.', '/assets/tool_bread_knife.webp', '🔪', 'This is a useful bread knife, but it is not the requested chef knife.'),
      option('knife-cleaver', 'Cleaver Knife', 'Broad, heavy blade designed for chopping dense ingredients and bones.', '/assets/tool_cleaver_knife.webp', '🔪', 'This is a cleaver knife, but it is not the requested chef knife.'),
    ],
  },
  {
    id: 'cutting_board', name: 'Cutting Board', toolType: 'Food Prep Surface',
    correctOption: option('board-wooden', 'Sanitized Wooden Chopping Board', 'Smooth, flat wooden surface with a clean perimeter groove and no deep cuts or cracks.', '/assets/tool_cutting_board_safe.webp', '🪵', 'Correct: the sanitized wooden board is the requested chopping surface.'),
    distractors: [
      option('board-blue', 'Blue Plastic Chopping Board', 'Clean blue plastic board used for color-coded seafood preparation.', '/assets/tool_cutting_board_blue.webp', '🟦', 'This is a blue plastic board, but it is not the requested board.'),
      option('board-red', 'Red Plastic Chopping Board', 'Clean red plastic board used for color-coded raw meat preparation.', '/assets/tool_cutting_board_red.webp', '🟥', 'This is a red plastic board, but it is not the requested board.'),
    ],
  },
  {
    id: 'bowl', name: 'Mixing Bowl', toolType: 'Food Preparation Vessel',
    correctOption: option('bowl-stainless', 'Stainless Mixing Bowl', 'Deep polished stainless steel bowl with an intact rim and spotless food-contact surface.', '/assets/tool_bowl_stainless.webp', '🥣', 'Correct: this is the requested stainless mixing bowl.'),
    distractors: [
      option('bowl-tupperware', 'Tupperware', 'Reusable plastic food-storage container with a fitted airtight lid.', '/assets/tool_tupperware_container.webp', '🧊', 'This is a storage container, but it is not the requested mixing bowl.'),
      option('bowl-plate', 'Plate', 'Flat ceramic serving plate with a smooth glazed food-contact surface.', '/assets/dish_ceramic_plate.webp', '🍽️', 'This is a plate, but it is not the requested mixing bowl.'),
    ],
  },
  {
    id: 'tongs', name: 'Tongs', toolType: 'Food Handling Tool',
    correctOption: option('tongs-stainless', 'Stainless Tongs', 'Clean stainless tongs with secure scalloped tips and a working locking ring.', '/assets/tool_tongs_kitchen.webp', '🥢', 'Correct: these are the requested stainless food-handling tongs.'),
    distractors: [
      option('tongs-pasta', 'Pasta Tongs', 'Spring-hinged tongs with toothed prongs designed for noodles and pasta.', '/assets/tool_pasta_tongs.webp', '🥢', 'These are pasta tongs, but they are not the requested tongs.'),
      option('tongs-scissor', 'Scissor Tongs', 'Scissor-action metal tongs with flat paddle tips and finger loops.', '/assets/tool_scissor_tongs.webp', '✂️', 'These are scissor tongs, but they are not the requested tongs.'),
    ],
  },
  {
    id: 'dehydrator', name: 'Dehydrator', toolType: 'Convection Drying Appliance',
    correctOption: option('dehydrator', 'Dehydrator', 'Clean drying appliance with sanitized trays, clear vents, and an intact grounded plug.', '/assets/equip_dehydrator_safe.webp', '💨', 'Correct: this is the requested dehydrator.'),
    distractors: [
      option('dehydrator-microwave', 'Microwave Oven', 'Countertop oven with a glass turntable and microwave control panel.', '/assets/equip_microwave_oven.webp', '📻', 'This is a microwave oven, but it is not the requested dehydrator.'),
      option('dehydrator-air-fryer', 'Air Fryer', 'Compact countertop convection appliance with a pull-out cooking basket.', '/assets/equip_air_fryer.webp', '🍟', 'This is an air fryer, but it is not the requested dehydrator.'),
    ],
  },
  {
    id: 'food_processor', name: 'Food Processor', toolType: 'Electrical Grinding Appliance',
    correctOption: option('food-processor', 'Food Processor', 'Clean motor base, intact safety interlock lid, and insulated power cord.', '/assets/equip_food_processor_safe.webp', '⚙️', 'Correct: this is the requested food processor.'),
    distractors: [
      option('food-processor-blender', 'Blender', 'Countertop appliance with a pitcher and blade assembly for liquid blending.', '/assets/equip_blender.webp', '🥤', 'This is a blender, but it is not the requested food processor.'),
      option('food-processor-grinder', 'Meat Grinder', 'Electric appliance with a loading hopper and extrusion plate for mincing.', '/assets/equip_meat_grinder.webp', '⚙️', 'This is a meat grinder, but it is not the requested food processor.'),
    ],
  },
  {
    id: 'colander', name: 'Colander', toolType: 'Draining Cookware',
    correctOption: option('colander-stainless', 'Stainless-Steel Colander', 'Polished stainless perforated bowl with stable foot ring and clean handles.', '/assets/tool_colander_safe.webp', '🥣', 'Correct: this is the requested stainless-steel colander.'),
    distractors: [
      option('colander-plastic', 'Plastic Colander', 'Lightweight lime-green perforated plastic bowl with molded handles.', '/assets/tool_colander_plastic.webp', '🥣', 'This is a plastic colander, but it is not the requested stainless-steel colander.'),
      option('colander-noodle', 'Noodle Strainer', 'Deep wire-mesh basket with a long handle for dipping and draining noodles.', '/assets/tool_noodle_strainer.webp', '🍜', 'This is a noodle strainer, but it is not the requested colander.'),
    ],
  },
  {
    id: 'spatula', name: 'Spatula', toolType: 'Mixing and Scraping Tool',
    correctOption: option('spatula-silicone', 'Rubber/Silicone Spatula', 'Smooth food-grade silicone head with an intact beveled edge and secure handle.', '/assets/tool_spatula_kitchen.webp', '🟥', 'Correct: this is the requested rubber/silicone spatula.'),
    distractors: [
      option('spatula-metal', 'Metal Spatula', 'Slotted stainless turner with a flat head for flipping food.', '/assets/tool_metal_spatula.webp', '🍳', 'This is a metal spatula, but it is not the requested silicone spatula.'),
      option('spatula-fish', 'Fish Spatula', 'Thin flexible slotted turner designed for lifting delicate foods.', '/assets/tool_fish_spatula.webp', '🐟', 'This is a fish spatula, but it is not the requested silicone spatula.'),
    ],
  },
  {
    id: 'plate', name: 'Plate', toolType: 'Serving Dish',
    correctOption: option('plate-ceramic', 'Ceramic Plate', 'Clean white ceramic plate with a smooth glazed surface.', '/assets/dish_ceramic_plate.webp', '🍽️', 'Correct: this is the requested ceramic plate.'),
    distractors: [
      option('plate-paper', 'Paper Plate', 'Lightweight disposable paper plate with a fluted rim.', '/assets/dish_paper_plate.webp', '🍽️', 'This is a paper plate, but it is not the requested ceramic plate.'),
      option('plate-styrofoam', 'Styrofoam Plate', 'Lightweight disposable foam plate with a segmented rim.', '/assets/dish_styrofoam_plate.webp', '🍽️', 'This is a Styrofoam plate, but it is not the requested ceramic plate.'),
    ],
  },
  {
    id: 'measuring_glass', name: 'Measuring Glass', toolType: 'Liquid Measuring Tool',
    correctOption: option('measuring-glass', 'Measuring Glass', 'Spotless transparent glass with an intact handle, pour spout, and readable markings.', '/assets/tool_measuring_glass.webp', '🥛', 'Correct: this is the requested measuring glass.'),
    distractors: [
      option('measuring-glass-cup', 'Measuring Cup', 'Stainless one-cup measure for dry ingredients and starches.', '/assets/tool_measuring_cups.webp', '🥛', 'This is a measuring cup, but it is not the requested measuring glass.'),
      option('measuring-glass-spoon', 'Measuring Spoon', 'Set of graduated spoons for small quantities of ingredients.', '/assets/tool_measuring_spoons.webp', '🥄', 'This is a measuring spoon, but it is not the requested measuring glass.'),
    ],
  },
  {
    id: 'steamer', name: 'Steamer', toolType: 'Steam Cooking Equipment',
    correctOption: option('steamer-stainless', 'Stainless-Steel Steamer', 'Polished multi-tier steamer with intact perforated tiers, secure handles, and fitted lid.', '/assets/equip_steamer_safe.webp', '♨️', 'Correct: this is the requested stainless-steel steamer.'),
    distractors: [
      option('steamer-rice-cooker', 'Rice Cooker', 'Electric cooker with a lidded inner pot and cook/warm controls.', '/assets/equip_rice_cooker.webp', '🍚', 'This is a rice cooker, but it is not the requested steamer.'),
      option('steamer-plastic-container', 'Plastic Container', 'Clear square food-prep container with volume markings and snap-on lid.', '/assets/9fbe0ab2-e823-4fc7-8ead-9d431ce7f263.webp', '🧊', 'This is a plastic container, but it is not the requested steamer.'),
    ],
  },
  {
    id: 'frying_pan', name: 'Frying Pan', toolType: 'Heating Cookware',
    correctOption: option('frying-pan', 'Frying Pan', 'Clean stainless frying pan with a stable base and secure heat-resistant handles.', '/assets/equip_frying_pan_safe.webp', '🍳', 'Correct: this is the requested frying pan.'),
    distractors: [
      option('frying-pan-oven', 'Oven Toaster', 'Compact countertop oven with a glass door, rack, and heating elements.', '/assets/equip_oven_toaster.webp', '🔥', 'This is an oven toaster, but it is not the requested frying pan.'),
      option('frying-pan-saucepan', 'Saucepan', 'Deep stainless pan with a long handle and pour lip.', '/assets/equip_sauce_pan.webp', '🍲', 'This is a saucepan, but it is not the requested frying pan.'),
    ],
  },
  {
    id: 'stove', name: 'Stove', toolType: 'Heating Appliance',
    correctOption: option('stove', 'Stove', 'Clean countertop stove with intact grates, burner heads, control knobs, and stable base.', '/assets/equip_stove_countertop.webp', '🔥', 'Correct: this is the requested stove.'),
    distractors: [
      option('stove-rice-cooker', 'Rice Cooker', 'Electric cooker with a lidded inner pot and cook/warm controls.', '/assets/equip_rice_cooker.webp', '🍚', 'This is a rice cooker, but it is not the requested stove.'),
      option('stove-air-fryer', 'Air Fryer', 'Compact countertop convection appliance with a pull-out cooking basket.', '/assets/equip_air_fryer.webp', '🍟', 'This is an air fryer, but it is not the requested stove.'),
    ],
  },
  {
    id: 'measuring_spoon', name: 'Measuring Spoon', toolType: 'Small-Volume Measuring Tool',
    correctOption: option('measuring-spoon', 'Measuring Spoon', 'Graduated spoons for accurately portioning salt, spices, and other small quantities.', '/assets/tool_measuring_spoons.webp', '🥄', 'Correct: this is the requested measuring spoon.'),
    distractors: [
      option('measuring-spoon-cup', 'Plastic Measuring Cup', 'Clear plastic cup with graduated volume markings and pour spout.', '/assets/tool_measuring_cup_plastic.webp', '🥛', 'This is a plastic measuring cup, but it is not the requested measuring spoon.'),
      option('measuring-spoon-plastic', 'Plastic Spoon', 'Reusable food-grade plastic spoon for stirring and tasting.', '/assets/tool_plastic_spoon.webp', '🥄', 'This is a plastic spoon, but it is not the requested measuring spoon.'),
    ],
  },
];

export const INGREDIENT_INSPECTION_ITEMS = [
  {
    id: 'ubod', name: 'Coconut Palm',
    correctOption: option('ubod', 'Coconut Palm (Ubod)', 'Bright ivory-white color, crisp firm texture, and a mild pleasant coconut aroma.', '/assets/ing_ubod_fresh.webp', '🥥', 'Correct: this is the requested coconut palm ingredient.'),
    distractors: [
      option('ubod-leaf', 'Coconut Leaf', 'Fresh green coconut palm frond with long pinnate leaflets.', '/assets/ing_coconut_leaf.webp', '🌿', 'This is a coconut leaf, but it is not the requested coconut palm ingredient.'),
      option('ubod-fruit', 'Coconut Fruit', 'Whole and cracked coconut showing fresh meat and coconut water.', '/assets/ing_coconut_fruit.webp', '🥥', 'This is a coconut fruit, but it is not the requested coconut palm ingredient.'),
    ],
  },
  {
    id: 'salt', name: 'Salt',
    correctOption: option('salt', 'Salt', 'Clean sparkling white crystals that are dry, loose, and food-grade.', '/assets/ing_salt_fresh.webp', '🧂', 'Correct: this is the requested salt.'),
    distractors: [
      option('salt-sugar', 'Sugar', 'Dry white granulated sugar for sweetening and flavor balance.', '/assets/ing_sugar.webp', '🍚', 'This is sugar, but it is not the requested salt.'),
      option('salt-baking-powder', 'Baking Powder', 'Sealed leavening powder used to create an airy texture in dough.', '/assets/ing_baking_powder.webp', '🥫', 'This is baking powder, but it is not the requested salt.'),
    ],
  },
  {
    id: 'water', name: 'Water',
    correctOption: option('water', 'Water', 'Clear, transparent, odorless potable water with no suspended particles.', '/assets/ing_water_clean.webp', '💧', 'Correct: this is the requested water.'),
    distractors: [
      option('water-vinegar', 'Vinegar', 'Clear bottled vinegar with a mild acidic aroma.', '/assets/ing_vinegar_bottle.webp', '🍾', 'This is vinegar, but it is not the requested water.'),
      option('water-milk', 'Milk', 'Sealed carton of fresh whole milk for dairy-based formulations.', '/assets/ing_milk_carton.webp', '🥛', 'This is milk, but it is not the requested water.'),
    ],
  },
  {
    id: 'oil', name: 'Vegetable Oil',
    correctOption: option('oil-vegetable', 'Vegetable Oil', 'Clear pale-golden oil with no sediment and a clean neutral odor.', '/assets/ing_oil_fresh.webp', '🫗', 'Correct: this is the requested vegetable oil.'),
    distractors: [
      option('oil-coconut', 'Coconut Oil', 'Golden-tinted coconut oil in a sealed bottle with a tropical label.', '/assets/ing_coconut_oil.webp', '🫗', 'This is coconut oil, but it is not the requested vegetable oil.'),
      option('oil-sesame', 'Sesame Oil', 'Amber toasted sesame oil in a sealed bottle with a warm nutty profile.', '/assets/ing_sesame_oil.webp', '🫗', 'This is sesame oil, but it is not the requested vegetable oil.'),
    ],
  },
  {
    id: 'rice_flour', name: 'Rice Flour',
    correctOption: option('rice-flour', 'Rice Flour', 'Fine silky white powder that is dry, free-flowing, sealed, and neutral in aroma.', '/assets/ing_rice_flour_clean.webp', '🌾', 'Correct: this is the requested rice flour.'),
    distractors: [
      option('rice-flour-bread', 'Bread Flour', 'Sealed high-protein flour intended for bread dough and gluten structure.', '/assets/ing_bread_flour.webp', '🌾', 'This is bread flour, but it is not the requested rice flour.'),
      option('rice-flour-all-purpose', 'All-Purpose Flour', 'Sealed versatile wheat flour intended for general baking and cooking.', '/assets/ing_all_purpose_flour.webp', '🌾', 'This is all-purpose flour, but it is not the requested rice flour.'),
    ],
  },
];
