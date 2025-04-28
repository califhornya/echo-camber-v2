import { baseItem } from '../../../js/baseItem.js';

const TuskedHelm = {
    ...baseItem,
    name: "Tusked Helm",
    type: "Weapon",
    secondaryType: "Apparel",
    tier: "Bronze",
    cooldown: 10.0,
    size: 1,
    damage: 15,
    shield: true,
    shieldAmount: 15,
    multicast: 2,
    image: "./assets/images/TuskedHelm.webp"
};

export default TuskedHelm; 