import { baseItem } from '../../../js/baseItem.js';

const MedKit = {
    ...baseItem,
    name: "Med Kit",
    type: "Loot",
    tier: "Gold",
    size: 1,
    isNonCombat: true,
    passive: "When you sell this, your leftmost Heal item gains 20 Heal.",
    image: "./assets/images/MedKit.webp",
};

export default MedKit; 