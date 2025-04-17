import { baseItem } from './baseItem.js';

// Database of all available items and their properties
const testDatabase = {
    items: [
        {
            ...baseItem,
            name: "Cove",
            type: "Aquatic",
            secondaryType: "Property",
            tier: "Bronze",
            cost: 6,
            cooldown: 4,
            size: 3,
            shield: true,
            shieldAmount: 3,
            value: 3,
            image: "./assets/images/Cove.webp",
            passive: "When you sell an item, this gains 1 value",
            trigger: "Cooldown",
            valueMultiplier: 1,
        },
        {
            ...baseItem,
            name: "Katana",
            type: "Weapon",
            tier: "Bronze",
            cost: 4,
            cooldown: 2,
            size: 2,
            damage: 5,
            image: "./assets/images/Katana.webp",
            enchantmentEffects: {
                heavy: {
                    name: "Heavy",
                    effect: {
                        slowTargets: 2,
                        slowDuration: 1
                    }
                },
                icy: {
                    name: "Icy",
                    effect: {
                        freezeTargets: 1,
                        freezeDuration: 1,
                        freezeSize: "medium"
                    }
                },
                turbo: {
                    name: "Turbo",
                    effect: {
                        hasteTargets: 2,
                        hasteDuration: 1
                    }
                },
                shielded: {
                    name: "Shielded",
                    effect: {
                        shield: true,
                        shieldAmount: 5
                    }
                },
                restorative: {
                    name: "Restorative",
                    effect: {
                        heal: true,
                        healAmount: 5
                    }
                },
                toxic: {
                    name: "Toxic",
                    effect: {
                        poison: 0, // Poison value will be dynamically calculated
                        scalingType: "percentage", // Poison is a percentage of damage
                        scaler: "damage", // Use the item's damage for scaling
                        scalingValue: 0.1 // 10% of damage
                    }
                },
                fiery: {
                    name: "Fiery",
                    effect: {
                        burn: 0, // Burn value will be dynamically calculated
                        scalingType: "percentage", // Burn is a percentage of damage
                        scaler: "damage", // Use the item's damage for scaling
                        scalingValue: 0.1 // 10% of damage
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
        },
        {
            ...baseItem,
            name: "Cutlass",
            type: "Weapon",
            tier: "Bronze",
            cost: 4,
            cooldown: 6,
            size: 2,
            damage: 10,
            multicast: 2,
            baseMulticast: 2,
            critMultiplier: 3,
            image: "./assets/images/Cutlass.webp",
            enchantmentEffects: {
                toxic: {
                    name: "Toxic",
                    effect: {
                        poison: 0, // Poison value will be dynamically calculated
                        scalingType: "percentage", // Poison is a percentage of damage
                        scaler: "damage", // Use the item's damage for scaling
                        scalingValue: 0.1 // 10% of damage
                    }
                },
                fiery: {
                    name: "Fiery",
                    effect: {
                        burn: 0, // Burn value will be dynamically calculated
                        scalingType: "percentage", // Burn is a percentage of damage
                        scaler: "damage", // Use the item's damage for scaling
                        scalingValue: 0.1 // 10% of damage
                    }
                },
                shiny: {
                    name: "Shiny",
                    effect: {
                        multicast: 1
                    }
                },
                heavy: {
                    name: "Heavy",
                    effect: {
                        slowTargets: 2,
                        slowDuration: 1
                    }
                },
                icy: {
                    name: "Icy",
                    effect: {
                        freezeTargets: 1,
                        freezeDuration: 1,
                        freezeSize: "medium"
                    }
                },
                turbo: {
                    name: "Turbo",
                    effect: {
                        hasteTargets: 2,
                        hasteDuration: 1
                    }
                },
                shielded: {
                    name: "Shielded",
                    effect: {
                        shield: true,
                        shieldAmount: 10
                    }
                },
                restorative: {
                    name: "Restorative",
                    effect: {
                        heal: true,
                        healAmount: 10
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
        },
        {
            ...baseItem,
            name: "Grenade",
            type: "Weapon",
            tier: "Bronze",
            cost: 2,
            cooldown: 5,
            size: 1,
            damage: 50,
            crit: 0.25,
            maxAmmo: 1,
            ammo: 1,
            image: "./assets/images/Grenade.webp",
            enchantmentEffects: {
                heavy: {
                    name: "Heavy",
                    effect: {
                        slowTargets: 1,
                        slowDuration: 6
                    }
                },
                icy: {
                    name: "Icy",
                    effect: {
                        freezeTargets: 1,
                        freezeDuration: 3,
                        freezeSize: "small"
                    }
                },
                turbo: {
                    name: "Turbo",
                    effect: {
                        hasteTargets: 1,
                        hasteDuration: 6
                    }
                },
                shielded: {
                    name: "Shielded",
                    effect: {
                        shield: true,
                        shieldAmount: 50
                    }
                },
                restorative: {
                    name: "Restorative",
                    effect: {
                        heal: true,
                        healAmount: 50
                    }
                },
                toxic: {
                    name: "Toxic",
                    effect: {
                        poison: 0, // Poison value will be dynamically calculated
                        scalingType: "percentage", // Poison is a percentage of damage
                        scaler: "damage", // Use the item's damage for scaling
                        scalingValue: 0.1 // 10% of damage
                    }
                },
                fiery: {
                    name: "Fiery",
                    effect: {
                        burn: 0, // Burn value will be dynamically calculated
                        scalingType: "percentage", // Burn is a percentage of damage
                        scaler: "damage", // Use the item's damage for scaling
                        scalingValue: 0.1 // 10% of damage
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
                        critDamage: 4
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
        },
        {
            ...baseItem,
            name: "Trebuchet",
            type: "Weapon",
            tier: "Bronze",
            cost: 6,
            cooldown: 10,
            size: 3,
            damage: 100,
            burn: 4, // Base burn value
            maxAmmo: 1,
            ammo: 1,
            image: "./assets/images/Trebuchet.webp",
            enchantmentEffects: {
                heavy: {
                    name: "Heavy",
                    effect: {
                        slowTargets: 1,
                        slowDuration: 3
                    }
                },
                icy: {
                    name: "Icy",
                    effect: {
                        freezeTargets: 1,
                        freezeDuration: 2
                    }
                },
                turbo: {
                    name: "Turbo",
                    effect: {
                        hasteTargets: 1,
                        hasteDuration: 3
                    }
                },
                shielded: {
                    name: "Shielded",
                    effect: {
                        shield: true,
                        shieldAmount: 0, // Dynamically calculated
                        scalingType: "equal", // Shield equals damage
                        scaler: "damage" // Use damage for scaling
                    }
                },
                restorative: {
                    name: "Restorative",
                    effect: {
                        heal: true,
                        healAmount: 0, // Dynamically calculated
                        scalingType: "equal", // Heal equals damage
                        scaler: "damage" // Use damage for scaling
                    }
                },
                toxic: {
                    name: "Toxic",
                    effect: {
                        poison: 0, // Poison value will be dynamically calculated
                        scalingType: "equal", // Poison equals burn
                        scaler: "burn" // Use burn value for scaling
                    }
                },
                fiery: {
                    name: "Fiery",
                    effect: {
                        burn: 0, // Burn value will be dynamically calculated
                        scalingType: "multiplier", // Burn is doubled
                        scaler: "burn", // Use burn value for scaling
                        scalingValue: 2 // Double the burn value
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
                        crit: 0.5 // +50% Crit Chance
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
                        damageMultiplier: 2 // Double the damage
                    }
                }
            }
        },
        {
            ...baseItem,
            name: "Lighter",
            type: "Tool",
            tier: "Bronze",
            cost: 2,
            cooldown: 3,
            size: 1,
            burn: 2, // Base burn value
            image: "./assets/images/Lighter.webp",
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
                        shieldAmount: 0, // Dynamically calculated
                        scalingType: "multiplier", // Shield scales with burn
                        scaler: "burn", // Use burn value for scaling
                        scalingValue: 10 // 10x burn value
                    }
                },
                restorative: {
                    name: "Restorative",
                    effect: {
                        heal: true,
                        healAmount: 0, // Dynamically calculated
                        scalingType: "multiplier", // Heal scales with burn
                        scaler: "burn", // Use burn value for scaling
                        scalingValue: 10 // 10x burn value
                    }
                },
                toxic: {
                    name: "Toxic",
                    effect: {
                        poison: 0, // Poison value will be dynamically calculated
                        scalingType: "equal", // Poison equals burn
                        scaler: "burn" // Use burn value for scaling
                    }
                },
                fiery: {
                    name: "Fiery",
                    effect: {
                        burn: 0, // Burn value will be dynamically calculated
                        scalingType: "multiplier", // Burn is doubled
                        scaler: "burn", // Use burn value for scaling
                        scalingValue: 2 // Double the burn value
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
                        crit: 0.5 // +50% Crit Chance
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
                        damage: 0, // Dynamically calculated
                        scalingType: "multiplier", // Damage scales with burn
                        scaler: "burn", // Use burn value for scaling
                        scalingValue: 10 // 10x burn value
                    }
                }
            }
        }
    ],

    searchItems(query) {
        if (!query) return [];
        
        query = query.toLowerCase();
        return this.items.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query) ||
            item.tier.toLowerCase().includes(query)
        );
    }
};

// Default monster build for testing
const coconutCrabBuild = {
    name: "Coconut Crab",
    health: 200,
    slots: [
        null,
        null,
        null,
        {
            ...baseItem,
            name: "Coconut",
            type: "Food",
            tier: "Bronze",
            cost: 2,
            cooldown: 0,  // Passive item
            size: 1,
            isNonCombat: true, // Mark as non-combat
            image: "./assets/images/Coconut.webp",
        },
        {
            ...baseItem,
            name: "Crusher Claw",
            type: "Weapon",
            tier: "Bronze",
            cost: 4,
            cooldown: 9,
            size: 2,
            damage: 0,  // Base damage is 0, actual damage based on shields
            shield: false,  // It doesn't provide shield
            shieldBonus: 2,  // Amount it increases other items' shields by
            image: "./assets/images/CrusherClaw.webp",
        },
        null,
        {
            ...baseItem,
            name: "Sea Shell",
            type: "Aquatic",
            tier: "Bronze",
            cost: 3,
            cooldown: 6,
            size: 1,
            shield: true,
            shieldAmount: 10,   // Base shield amount per aquatic item
            image: "./assets/images/SeaShell.webp",
        },
        null,
        null,
        null
    ]
};

export { testDatabase, coconutCrabBuild as monsterBuild };
