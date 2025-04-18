import { baseItem } from '../../../js/baseItem.js';

const GearnolaBar = {
    ...baseItem,
    name: "Gearnola Bar",
    type: "Food",
    tier: "Bronze",
    cost: 3,
    cooldown: 5.0,
    size: 1,
    shield: true,
    shieldAmount: 30,
    maxAmmo: 2,
    ammo: 2,
    passive: "When you sell a Tool, this gains +1 Max Ammo.",
    image: "./assets/images/GearnolaBar.webp",
    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 1,
                slowDuration: 2
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
                damageMultiplier: 2
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "equal",
                scaler: "shieldAmount"
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "shieldAmount",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "shieldAmount",
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
                scaler: "shieldAmount"
            }
        }
    }
};

export default GearnolaBar; 