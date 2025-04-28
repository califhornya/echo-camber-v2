import { baseItem } from '../../../js/baseItem.js';

const Chum = {
    ...baseItem,
    name: "Chum",
    type: ["Aquatic"],
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/Chum.webp",
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 5.0,
            shield: 20,
            heal: 30,
            poison: 2,
            burn: 3
        },
        Silver: {
            value: 2,
            cooldown: 5.0,
            shield: 30,
            heal: 45,
            poison: 3,
            burn: 4
        },
        Gold: {
            value: 4,
            cooldown: 5.0,
            shield: 40,
            heal: 60,
            poison: 4,
            burn: 5
        },
        Diamond: {
            value: 8,
            cooldown: 5.0,
            shield: 50,
            heal: 75,
            poison: 5,
            burn: 6
        }
    },

    passive: "Your Aquatic items gain +4% » +6% » +8% » +10% Crit Chance for the fight.",

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 1,
                slowDuration: 1
            }
        },
        icy: {
            name: "Icy",
            effect: {
                freezeTargets: 1,
                freezeDuration: 1,
                freezeSize: "small"
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                hasteTargets: 1,
                hasteDuration: 1
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                shieldMultiplier: 2
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                healMultiplier: 2
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poisonMultiplier: 2
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burnMultiplier: 2
            }
        },
        shiny: {
            name: "Shiny",
            effect: {
                multicast: 2
            }
        },
        deadly: {
            name: "Deadly",
            effect: {
                critMultiplier: 2
            }
        },
        radiant: {
            name: "Radiant",
            effect: {
                immuneToFreeze: true,
                immuneToSlow: true,
                immuneToDestroy: true
            }
        },
        obsidian: {
            name: "Obsidian",
            effect: {
                damage: 30
            }
        }
    }
};

export default Chum; 