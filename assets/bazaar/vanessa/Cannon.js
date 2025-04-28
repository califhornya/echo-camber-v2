import { baseItem } from '../../../js/baseItem.js';

const Cannon = {
    ...baseItem,
    name: "Cannon",
    type: ["Weapon"],
    size: 2,
    currentTier: "Bronze",
    image: "./assets/images/Cannon.webp",
    maxAmmo: 2,
    ammo: 2,
    
    tiers: {
        Bronze: {
            value: 2,
            cooldown: 5.0,
            damage: 40,
            burn: 4
        },
        Silver: {
            value: 4,
            cooldown: 5.0,
            damage: 60,
            burn: 6
        },
        Gold: {
            value: 8,
            cooldown: 5.0,
            damage: 80,
            burn: 8
        },
        Diamond: {
            value: 16,
            cooldown: 5.0,
            damage: 100,
            burn: 10
        }
    },

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 6
            }
        },
        icy: {
            name: "Icy",
            effect: {
                freezeTargets: 1,
                freezeDuration: 6,
                freezeSize: "medium"
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                hasteTargets: 2,
                hasteDuration: 6
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
                scalingType: "equal",
                scaler: "burn"
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
                damageMultiplier: 2
            }
        }
    }
};

export default Cannon; 