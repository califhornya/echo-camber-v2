import { baseItem } from '../../../js/baseItem.js';

const CoralArmor = {
    ...baseItem,
    name: "Coral Armor",
    type: ["Aquatic", "Apparel"],
    size: 2,
    currentTier: "Bronze",
    image: "./assets/images/CoralArmor.webp",
    
    tiers: {
        Bronze: {
            value: 2,
            cooldown: 6.0,
            shield: 50
        },
        Silver: {
            value: 4,
            cooldown: 6.0,
            shield: 75
        },
        Gold: {
            value: 8,
            cooldown: 6.0,
            shield: 100
        },
        Diamond: {
            value: 16,
            cooldown: 6.0,
            shield: 125
        }
    },

    passive: "When you buy another Aquatic item, this gains 5 » 10 » 15 » 20 Shield.",

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 2
            }
        },
        icy: {
            name: "Icy",
            effect: {
                freezeTargets: 1,
                freezeDuration: 2,
                freezeSize: "medium"
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                hasteTargets: 2,
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
                heal: true,
                healAmount: 0,
                scalingType: "equal",
                scaler: "shield"
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "shield",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "shield",
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
                scaler: "shield"
            }
        }
    }
};

export default CoralArmor; 