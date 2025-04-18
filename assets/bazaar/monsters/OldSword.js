import { baseItem } from '../../../js/baseItem.js';

const OldSword = {
    ...baseItem,
    name: "Old Sword",
    type: "Weapon",
    tier: "Silver",
    cost: 3,
    cooldown: 5.0,
    size: 1,
    damage: 10,
    passive: "When you sell this, your leftmost Weapon gains +6 Damage.",
    image: "./assets/images/OldSword.webp"
};

export default OldSword; 