import { baseItem } from '../../../js/baseItem.js';

const ShoeBlade = {
    ...baseItem,
    name: "Shoe Blade",
    type: "Weapon",
    secondaryType: "Apparel",
    tier: "Silver",
    cost: 3,
    cooldown: 7.0,
    size: 1,
    damage: 40,
    crit: 0.3,
    image: "./assets/images/ShoeBlade.webp"
};

export default ShoeBlade; 