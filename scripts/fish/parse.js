const { writeFileSync } = require("node:fs");

const fishes = require("./fish.json");

const dict = {
  lab_fish_quality1: "Blue",
  lab_fish_quality2: "Purple",
  lab_fish_quality3: "Orange",
  lab_fish_quality4: "Red",
  fish_type1: "Small Fish",
  fish_type2: "Medium Fish",
  fish_type3: "Large Fish",
  fish_type4: "Aquatic Creatures",
  fish_type5: "MISC items",
  fish_type6: "Collections",
  card_attr_1: "HP",
  card_attr_2: "SPD",
  card_attr_3: "ATK",
  card_attr_4: "DEF",
  card_attr_11: "HP %",
  card_attr_12: "SPD %",
  card_attr_13: "ATK %",
  card_attr_14: "DEF %",
  card_attr_20: "Full Status",
  card_attr_21: "Hit Rate",
  card_attr_22: "Dodge",
  card_attr_23: "CT Rate",
  card_attr_24: "Resist CT",
  card_attr_25: "Treat Effect",
  card_attr_26: "Treated Effect",
  card_attr_27: "C.DMG Inc.",
  card_attr_28: "C.DMG Redu.",
  card_attr_29: "Control",
  card_attr_30: "Resi-Ctrl.",
  card_attr_40: "DMG Bonus",
  card_attr_41: "DMG Redu.",
  card_attr_42: "M.D. Bonus",
  card_attr_43: "M.D. Redu.",
  card_attr_44: "P.D. Bonus",
  card_attr_45: "P.D. Redu.",
  card_attr_46: "% reduction in ongoing DMG buffs",
  card_attr_47: "Basic skill effect enhance% ",
  card_attr_48: "Anger skill effect enhance% ",
  card_attr_49: "PVP DMG Bonus ",
  card_attr_50: "PVP DMG Reduction ",
  card_attr_51: "Final DMG Bonus ",
  card_attr_52: "Final DMG Reduction ",
  card_attr_53: "PVE DMG Bonus",
  card_attr_54: "PVE DMG Reduction",
  card_attr_55: "DMG against Sanctuary ",
  card_attr_56: "Sanctuary DR",
  card_attr_57: "DMG against Darkin ",
  card_attr_58: "Darkin DR",
  card_attr_59: "DMG against Alliance ",
  card_attr_60: "Alliance DR",
  card_attr_61: "DMG against Wild ",
  card_attr_62: "Wild DR",
  card_attr_63: "DMG against Forest ",
  card_attr_64: "Forest DR",
  card_attr_65: "DMG Bonus to bosses",
  card_attr_66: "DMG Redu. to bosses",
  card_attr_67: "DMG against Assault ",
  card_attr_68: "Assault DR",
  card_attr_69: "DMG against Magic ",
  card_attr_70: "Magic DR",
  card_attr_71: "DMG against Support ",
  card_attr_72: "Support DR",
  card_attr_73: "DMG against Defense ",
  card_attr_74: "Defense DR",
};

const parsed = fishes.map((fish) => {
  return {
    id: fish.id,
    name: fish.name,
    description: fish.description,
    type: dict[`fish_type${fish.type}`],
    quality: dict[`card_suit_quality_${fish.quality}`],
    attributes: Array.isArray(fish.effects)
      ? fish.effects.map((e) => dict[`card_attr_${e}`])
      : [],
    length_min: fish.length_min,
    length_max: fish.length_max,
  };
});

writeFileSync("parsed.json", JSON.stringify(parsed, null, 4));
