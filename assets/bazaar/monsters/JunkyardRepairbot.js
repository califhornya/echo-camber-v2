import { baseItem } from '../../../js/baseItem.js';

const JunkyardRepairbot = {
    ...baseItem,
    name: "Junkyard Repairbot",
    type: "Friend",
    secondaryType: "Tech",
    tier: "Silver",
    cooldown: 8.0,
    size: 2,
    heal: true,
    healAmount: 60,
    passive: "When you sell this, your leftmost Heal item gains +15 Heal.",
    image: "./assets/images/JunkyardRepairbot.webp",
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
                shield: true,
                shieldAmount: 0,
                scalingType: "equal",
                scaler: "healAmount"
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                healAmount: 0,
                scalingType: "multiplier",
                scaler: "healAmount",
                scalingValue: 2
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "healAmount",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "healAmount",
                scalingValue: 0.1
            }
        },
        shiny: {
            name: "Shiny",
            effect: {
                multicast: 1
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
                scaler: "healAmount"
            }
        }
    }
};

export default JunkyardRepairbot; 