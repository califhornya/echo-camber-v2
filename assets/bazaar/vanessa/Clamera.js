import { baseItem } from '../../../js/baseItem.js';

const Clamera = {
    ...baseItem,
    name: "Clamera",
    type: ["Aquatic"],
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/Clamera.webp",
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 10.0,
            slow: true,
            slowTargets: 1,
            slowDuration: 1,
            shield: 30,
            heal: 45,
            poison: 3,
            burn: 4
        },
        Silver: {
            value: 2,
            cooldown: 10.0,
            slow: true,
            slowTargets: 2,
            slowDuration: 2,
            shield: 40,
            heal: 60,
            poison: 4,
            burn: 5
        },
        Gold: {
            value: 4,
            cooldown: 10.0,
            slow: true,
            slowTargets: 3,
            slowDuration: 3,
            shield: 50,
            heal: 75,
            poison: 5,
            burn: 6
        },
        Diamond: {
            value: 8,
            cooldown: 10.0,
            slow: true,
            slowTargets: 4,
            slowDuration: 4,
            shield: 60,
            heal: 90,
            poison: 6,
            burn: 7
        }
    },

    passive: "At the start of each fight, use this.",

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowDurationMultiplier: 2
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
                hasteDuration: 2
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
                crit: 0.5
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

export default Clamera; 