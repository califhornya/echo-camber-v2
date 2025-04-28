import { baseItem } from '../../../js/baseItem.js';

const Scrap = {
    ...baseItem,
    name: "Scrap",
    type: "Loot",
    tier: "Bronze",
    cooldown: 0,
    size: 1,
    isNonCombat: true,
    image: "./assets/images/Scrap.webp"
};

export default Scrap; 