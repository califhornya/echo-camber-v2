import { baseItem } from '../../../js/baseItem.js';

const Coconut = {
    ...baseItem,
    name: "Coconut",
    type: "Food",
    tier: "Bronze",
    cost: 2,
    cooldown: 0,
    size: 1,
    isNonCombat: true,
    image: "./assets/images/Coconut.webp"
};

export default Coconut; 