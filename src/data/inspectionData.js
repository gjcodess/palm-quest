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
      option('knife-bread', 'Bread Knife', 'Long serrated blade designed for slicing bread and delicate baked goods.', '/assets/tool_bread_knife.webp', '🔪', 'A bread knife uses its serrated edge to saw through crusts without crushing the bread. It is not the smooth-edged chef knife requested for controlled ingredient cutting.'),
      option('knife-cleaver', 'Cleaver Knife', 'Broad, heavy blade designed for chopping dense ingredients and bones.', '/assets/tool_cleaver_knife.webp', '🔪', 'A cleaver knife is used for heavy chopping of dense ingredients and bones. Its broad, weighty blade is not the requested chef knife for controlled slicing and dicing.'),
    ],
  },
  {
    id: 'cutting_board', name: 'Cutting Board', toolType: 'Food Prep Surface',
    correctOption: option('board-wooden', 'Sanitized Wooden Chopping Board', 'Smooth, flat wooden surface with a clean perimeter groove and no deep cuts or cracks.', '/assets/tool_cutting_board_safe.webp', '🪵', 'Correct: the sanitized wooden board is the requested chopping surface.'),
    distractors: [
      option('board-blue', 'Blue Plastic Chopping Board', 'Clean blue plastic board used for color-coded seafood preparation.', '/assets/tool_cutting_board_blue.webp', '🟦', 'This blue plastic board is used for seafood in a color-coded preparation system. It may be clean, but the target is the sanitized wooden chopping board.'),
      option('board-red', 'Red Plastic Chopping Board', 'Clean red plastic board used for color-coded raw meat preparation.', '/assets/tool_cutting_board_red.webp', '🟥', 'This red plastic board is used for raw meat in a color-coded preparation system. Using it for this task risks mixing food categories; the target is the sanitized wooden board.'),
    ],
  },
  {
    id: 'bowl', name: 'Mixing Bowl', toolType: 'Food Preparation Vessel',
    correctOption: option('bowl-stainless', 'Stainless Mixing Bowl', 'Deep polished stainless steel bowl with an intact rim and spotless food-contact surface.', '/assets/tool_bowl_stainless.webp', '🥣', 'Correct: this is the requested stainless mixing bowl.'),
    distractors: [
      option('bowl-tupperware', 'Tupperware', 'Reusable plastic food-storage container with a fitted airtight lid.', '/assets/tool_tupperware_container.webp', '🧊', 'This lidded container is for storing prepared food. Its shape and lid serve storage, while the requested deep stainless bowl gives room to combine ingredients.'),
      option('bowl-plate', 'Plate', 'Flat ceramic serving plate with a smooth glazed food-contact surface.', '/assets/dish_ceramic_plate.webp', '🍽️', 'A plate is for serving food. Its shallow surface does not hold and mix ingredients like the requested stainless mixing bowl.'),
    ],
  },
  {
    id: 'tongs', name: 'Tongs', toolType: 'Food Handling Tool',
    correctOption: option('tongs-stainless', 'Stainless Tongs', 'Clean stainless tongs with secure scalloped tips and a working locking ring.', '/assets/tool_tongs_kitchen.webp', '🥢', 'Correct: these are the requested stainless food-handling tongs.'),
    distractors: [
      option('tongs-pasta', 'Pasta Tongs', 'Spring-hinged tongs with toothed prongs designed for noodles and pasta.', '/assets/tool_pasta_tongs.webp', '🥢', 'Pasta tongs grip and serve slippery noodles with their toothed prongs. The target is the stainless food-handling tongs with scalloped tips.'),
      option('tongs-scissor', 'Scissor Tongs', 'Scissor-action metal tongs with flat paddle tips and finger loops.', '/assets/tool_scissor_tongs.webp', '✂️', 'Scissor tongs use finger loops and flat paddles to pick up or serve food. Their grip differs from the requested scalloped-tip stainless tongs.'),
    ],
  },
  {
    id: 'dehydrator', name: 'Dehydrator', toolType: 'Convection Drying Appliance',
    correctOption: option('dehydrator', 'Dehydrator', 'Clean drying appliance with sanitized trays, clear vents, and an intact grounded plug.', '/assets/equip_dehydrator_safe.webp', '💨', 'Correct: this is the requested dehydrator.'),
    distractors: [
      option('dehydrator-microwave', 'Microwave Oven', 'Countertop oven with a glass turntable and microwave control panel.', '/assets/equip_microwave_oven.webp', '📻', 'A microwave oven heats food quickly with microwaves. It does not provide the prolonged, controlled airflow needed from the requested dehydrator to remove moisture.'),
      option('dehydrator-air-fryer', 'Air Fryer', 'Compact countertop convection appliance with a pull-out cooking basket.', '/assets/equip_air_fryer.webp', '🍟', 'An air fryer cooks food rapidly with hot circulating air. The requested dehydrator uses gentler, sustained airflow to dry ingredients evenly.'),
    ],
  },
  {
    id: 'food_processor', name: 'Food Processor', toolType: 'Electrical Grinding Appliance',
    correctOption: option('food-processor', 'Food Processor', 'Clean motor base, intact safety interlock lid, and insulated power cord.', '/assets/equip_food_processor_safe.webp', '⚙️', 'Correct: this is the requested food processor.'),
    distractors: [
      option('food-processor-blender', 'Blender', 'Countertop appliance with a pitcher and blade assembly for liquid blending.', '/assets/equip_blender.webp', '🥤', 'A blender blends liquids and soft ingredients in a pitcher. The requested food processor has a work bowl and blade suited to chopping and processing the prepared ingredients.'),
      option('food-processor-grinder', 'Meat Grinder', 'Electric appliance with a loading hopper and extrusion plate for mincing.', '/assets/equip_meat_grinder.webp', '⚙️', 'A meat grinder pushes food through a plate to mince it. That specialized action is different from the requested food processor, which chops ingredients in a work bowl.'),
    ],
  },
  {
    id: 'colander', name: 'Colander', toolType: 'Draining Cookware',
    correctOption: option('colander-stainless', 'Stainless-Steel Colander', 'Polished stainless perforated bowl with stable foot ring and clean handles.', '/assets/tool_colander_safe.webp', '🥣', 'Correct: this is the requested stainless-steel colander.'),
    distractors: [
      option('colander-plastic', 'Plastic Colander', 'Lightweight lime-green perforated plastic bowl with molded handles.', '/assets/tool_colander_plastic.webp', '🥣', 'A plastic colander drains washed foods through its holes. It can serve that purpose, but the target specifies the stainless-steel colander.'),
      option('colander-noodle', 'Noodle Strainer', 'Deep wire-mesh basket with a long handle for dipping and draining noodles.', '/assets/tool_noodle_strainer.webp', '🍜', 'A noodle strainer lifts noodles from hot water and drains them in its mesh basket. The target is a freestanding stainless-steel colander for draining larger batches.'),
    ],
  },
  {
    id: 'spatula', name: 'Spatula', toolType: 'Mixing and Scraping Tool',
    correctOption: option('spatula-silicone', 'Rubber/Silicone Spatula', 'Smooth food-grade silicone head with an intact beveled edge and secure handle.', '/assets/tool_spatula_kitchen.webp', '🟥', 'Correct: this is the requested rubber/silicone spatula.'),
    distractors: [
      option('spatula-metal', 'Metal Spatula', 'Slotted stainless turner with a flat head for flipping food.', '/assets/tool_metal_spatula.webp', '🍳', 'A metal spatula slides under food to flip it during cooking. Its flat, slotted head does not scrape and fold mixtures like the requested silicone spatula.'),
      option('spatula-fish', 'Fish Spatula', 'Thin flexible slotted turner designed for lifting delicate foods.', '/assets/tool_fish_spatula.webp', '🐟', 'A fish spatula lifts delicate cooked food with a thin, slotted blade. The target is a silicone spatula for scraping and mixing ingredients.'),
    ],
  },
  {
    id: 'plate', name: 'Plate', toolType: 'Serving Dish',
    correctOption: option('plate-ceramic', 'Ceramic Plate', 'Clean white ceramic plate with a smooth glazed surface.', '/assets/dish_ceramic_plate.webp', '🍽️', 'Correct: this is the requested ceramic plate.'),
    distractors: [
      option('plate-paper', 'Paper Plate', 'Lightweight disposable paper plate with a fluted rim.', '/assets/dish_paper_plate.webp', '🍽️', 'A paper plate is for disposable serving. It is lightweight and single-use, while the target is a reusable ceramic plate with a smooth glazed surface.'),
      option('plate-styrofoam', 'Styrofoam Plate', 'Lightweight disposable foam plate with a segmented rim.', '/assets/dish_styrofoam_plate.webp', '🍽️', 'A foam plate is for disposable serving and is less sturdy. The requested ceramic plate is reusable and has a smooth glazed serving surface.'),
    ],
  },
  {
    id: 'measuring_glass', name: 'Measuring Glass', toolType: 'Liquid Measuring Tool',
    correctOption: option('measuring-glass', 'Measuring Glass', 'Spotless transparent glass with an intact handle, pour spout, and readable markings.', '/assets/tool_measuring_glass.webp', '🥛', 'Correct: this is the requested measuring glass.'),
    distractors: [
      option('measuring-glass-cup', 'Measuring Cup', 'Stainless one-cup measure for dry ingredients and starches.', '/assets/tool_measuring_cups.webp', '🥛', 'This cup portions dry ingredients by volume. The requested transparent measuring glass has a spout and markings that let you read and pour liquid amounts.'),
      option('measuring-glass-spoon', 'Measuring Spoon', 'Set of graduated spoons for small quantities of ingredients.', '/assets/tool_measuring_spoons.webp', '🥄', 'Measuring spoons portion small amounts such as salt or spices. They are too small for the liquid volume measured in the requested measuring glass.'),
    ],
  },
  {
    id: 'steamer', name: 'Steamer', toolType: 'Steam Cooking Equipment',
    correctOption: option('steamer-stainless', 'Stainless-Steel Steamer', 'Polished multi-tier steamer with intact perforated tiers, secure handles, and fitted lid.', '/assets/equip_steamer_safe.webp', '♨️', 'Correct: this is the requested stainless-steel steamer.'),
    distractors: [
      option('steamer-rice-cooker', 'Rice Cooker', 'Electric cooker with a lidded inner pot and cook/warm controls.', '/assets/equip_rice_cooker.webp', '🍚', 'A rice cooker heats rice and water in its inner pot. The requested steamer uses perforated tiers so steam can circulate around the food.'),
      option('steamer-plastic-container', 'Plastic Container', 'Clear square food-prep container with volume markings and snap-on lid.', '/assets/9fbe0ab2-e823-4fc7-8ead-9d431ce7f263.webp', '🧊', 'This plastic container stores or holds prepared ingredients. It has no heat source or perforated tiers, so it cannot perform the requested steam-cooking step.'),
    ],
  },
  {
    id: 'frying_pan', name: 'Frying Pan', toolType: 'Heating Cookware',
    correctOption: option('frying-pan', 'Frying Pan', 'Clean stainless frying pan with a stable base and secure heat-resistant handles.', '/assets/equip_frying_pan_safe.webp', '🍳', 'Correct: this is the requested frying pan.'),
    distractors: [
      option('frying-pan-oven', 'Oven Toaster', 'Compact countertop oven with a glass door, rack, and heating elements.', '/assets/equip_oven_toaster.webp', '🔥', 'An oven toaster bakes or toasts food inside an enclosed chamber. The target is an open frying pan for cooking food directly on the stove.'),
      option('frying-pan-saucepan', 'Saucepan', 'Deep stainless pan with a long handle and pour lip.', '/assets/equip_sauce_pan.webp', '🍲', 'A saucepan is deep and suited to simmering liquids. The requested frying pan has a broad, shallow cooking surface for frying.'),
    ],
  },
  {
    id: 'stove', name: 'Stove', toolType: 'Heating Appliance',
    correctOption: option('stove', 'Stove', 'Clean countertop stove with intact grates, burner heads, control knobs, and stable base.', '/assets/equip_stove_countertop.webp', '🔥', 'Correct: this is the requested stove.'),
    distractors: [
      option('stove-rice-cooker', 'Rice Cooker', 'Electric cooker with a lidded inner pot and cook/warm controls.', '/assets/equip_rice_cooker.webp', '🍚', 'A rice cooker automatically cooks rice in its inner pot. It cannot hold and heat the separate cookware used on the requested countertop stove.'),
      option('stove-air-fryer', 'Air Fryer', 'Compact countertop convection appliance with a pull-out cooking basket.', '/assets/equip_air_fryer.webp', '🍟', 'An air fryer cooks food in a basket with circulating hot air. The requested stove has burners for heating a pan or steamer.'),
    ],
  },
  {
    id: 'measuring_spoon', name: 'Measuring Spoon', toolType: 'Small-Volume Measuring Tool',
    correctOption: option('measuring-spoon', 'Measuring Spoon', 'Graduated spoons for accurately portioning salt, spices, and other small quantities.', '/assets/tool_measuring_spoons.webp', '🥄', 'Correct: this is the requested measuring spoon.'),
    distractors: [
      option('measuring-spoon-cup', 'Plastic Measuring Cup', 'Clear plastic cup with graduated volume markings and pour spout.', '/assets/tool_measuring_cup_plastic.webp', '🥛', 'A measuring cup portions larger liquid volumes using its marked side. The requested measuring spoons give accurate small portions of salt or spices.'),
      option('measuring-spoon-plastic', 'Plastic Spoon', 'Reusable food-grade plastic spoon for stirring and tasting.', '/assets/tool_plastic_spoon.webp', '🥄', 'A plastic spoon stirs or tastes food. Without calibrated volumes, it cannot replace the requested measuring spoon for accurate small portions.'),
    ],
  },
];

export const INGREDIENT_INSPECTION_ITEMS = [
  {
    id: 'ubod', name: 'Coconut Palm',
    correctOption: option('ubod', 'Coconut Palm (Ubod)', 'Bright ivory-white color, crisp firm texture, and a mild pleasant coconut aroma.', '/assets/ing_ubod_fresh.webp', '🥥', 'Correct: this is the requested coconut palm ingredient.'),
    distractors: [
      option('ubod-leaf', 'Coconut Leaf', 'Fresh green coconut palm frond with long pinnate leaflets.', '/assets/ing_coconut_leaf.webp', '🌿', 'A coconut leaf is a frond of the palm, commonly used for weaving or wrapping. The recipe needs ubod, the tender inner palm shoot, rather than a leaf.'),
      option('ubod-fruit', 'Coconut Fruit', 'Whole and cracked coconut showing fresh meat and coconut water.', '/assets/ing_coconut_fruit.webp', '🥥', 'A coconut fruit supplies coconut meat and water. This recipe calls for ubod, the tender inner palm shoot, which has a different texture and role.'),
    ],
  },
  {
    id: 'salt', name: 'Salt',
    correctOption: option('salt', 'Salt', 'Clean sparkling white crystals that are dry, loose, and food-grade.', '/assets/ing_salt_fresh.webp', '🧂', 'Correct: this is the requested salt.'),
    distractors: [
      option('salt-sugar', 'Sugar', 'Dry white granulated sugar for sweetening and flavor balance.', '/assets/ing_sugar.webp', '🍚', 'Sugar sweetens food, even though its white crystals can resemble salt. The requested salt seasons the cracker mixture rather than adding sweetness.'),
      option('salt-baking-powder', 'Baking Powder', 'Sealed leavening powder used to create an airy texture in dough.', '/assets/ing_baking_powder.webp', '🥫', 'Baking powder is a leavening agent that releases gas in dough. It does not provide the seasoning expected from the requested salt.'),
    ],
  },
  {
    id: 'water', name: 'Water',
    correctOption: option('water', 'Water', 'Clear, transparent, odorless potable water with no suspended particles.', '/assets/ing_water_clean.webp', '💧', 'Correct: this is the requested water.'),
    distractors: [
      option('water-vinegar', 'Vinegar', 'Clear bottled vinegar with a mild acidic aroma.', '/assets/ing_vinegar_bottle.webp', '🍾', 'Vinegar adds acidity and a sour flavor to food. The requested potable water adds moisture without changing the mixture with acid.'),
      option('water-milk', 'Milk', 'Sealed carton of fresh whole milk for dairy-based formulations.', '/assets/ing_milk_carton.webp', '🥛', 'Milk adds dairy solids and flavor to recipes. The requested potable water supplies moisture without introducing those dairy ingredients.'),
    ],
  },
  {
    id: 'oil', name: 'Vegetable Oil',
    correctOption: option('oil-vegetable', 'Vegetable Oil', 'Clear pale-golden oil with no sediment and a clean neutral odor.', '/assets/ing_oil_fresh.webp', '🫗', 'Correct: this is the requested vegetable oil.'),
    distractors: [
      option('oil-coconut', 'Coconut Oil', 'Golden-tinted coconut oil in a sealed bottle with a tropical label.', '/assets/ing_coconut_oil.webp', '🫗', 'Coconut oil is made from coconut and can add a coconut flavor. This task specifies the clear, neutral vegetable oil shown as the target, so this bottle is a different ingredient.'),
      option('oil-sesame', 'Sesame Oil', 'Amber toasted sesame oil in a sealed bottle with a warm nutty profile.', '/assets/ing_sesame_oil.webp', '🫗', 'Toasted sesame oil is often used to add a strong nutty flavor. The target is a neutral vegetable oil, so sesame oil would change the recipe’s flavor.'),
    ],
  },
  {
    id: 'rice_flour', name: 'Rice Flour',
    correctOption: option('rice-flour', 'Rice Flour', 'Fine silky white powder that is dry, free-flowing, sealed, and neutral in aroma.', '/assets/ing_rice_flour_clean.webp', '🌾', 'Correct: this is the requested rice flour.'),
    distractors: [
      option('rice-flour-bread', 'Bread Flour', 'Sealed high-protein flour intended for bread dough and gluten structure.', '/assets/ing_bread_flour.webp', '🌾', 'Bread flour is wheat flour with protein that forms a strong gluten network for bread. The requested rice flour behaves differently and gives the cracker mixture its intended texture.'),
      option('rice-flour-all-purpose', 'All-Purpose Flour', 'Sealed versatile wheat flour intended for general baking and cooking.', '/assets/ing_all_purpose_flour.webp', '🌾', 'All-purpose flour is wheat flour used in many baked foods. It forms gluten when mixed with water, unlike the requested rice flour, so it would change the cracker texture.'),
    ],
  },
];
