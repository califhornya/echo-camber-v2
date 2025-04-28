import { baseItem } from '../../../js/baseItem.js';

const Coral = {
    ...baseItem,
    name: "Coral",
    type: ["Aquatic"],
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/Coral.webp",
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 5.0,
            heal: 20
        },
        Silver: {
            value: 2,
            cooldown: 5.0,
            heal: 30
        },
        Gold: {
            value: 4,
            cooldown: 5.0,
            heal: 40
        },
        Diamond: {
            value: 8,
            cooldown: 5.0,
            heal: 50
        }
    },

    passive: "When you buy an Aquatic item, this gains Heal 3 » 6 » 9 » 12.",

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
                shield: true,
                shieldAmount: 0,
                scalingType: "equal",
                scaler: "heal"
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
                poison: 0,
                scalingType: "percentage",
                scaler: "heal",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "heal",
                scalingValue: 0.1
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
                damage: 0,
                scalingType: "equal",
                scaler: "heal"
            }
        }
    }
};

export default Coral; 