import { baseItem } from '../../../js/baseItem.js';

const JunkyardClub = {
    ...baseItem,
    name: "Junkyard Club",
    type: "Weapon",
    tier: "Silver",
    cooldown: 11.0,
    size: 2,
    damage: 60,
    passive: "When you sell this, your Weapons gain 6 Damage.",
    image: "./assets/images/JunkyardClub.webp",
    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 3
            }
        },
        icy: {
            name: "Icy",
            effect: {
                freezeTargets: 1,
                freezeDuration: 3,
                freezeSize: "medium"
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                hasteTargets: 2,
                hasteDuration: 3
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                shield: true,
                shieldAmount: 0,
                scalingType: "equal",
                scaler: "damage"
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "equal",
                scaler: "damage"
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "damage",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "damage",
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
                damageMultiplier: 2
            }
        }
    }
};

export default JunkyardClub; 