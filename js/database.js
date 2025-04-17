import { baseItem } from './baseItem.js';

// Database of all available items and their properties
const bazaar = {
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
        },
        // Rogue Scrapper Items
        {
            ...baseItem,
            name: "Scrap",
            type: "Loot",
            tier: "Gold",
            cost: 1,
            size: 1,
            isNonCombat: true,
            passive: "When you sell this, your leftmost Shield item gains +12 Shield.",
            image: "./assets/images/Scrap.webp",
        },
        {
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
            image: "./assets/images/GearnolaBat.webp",
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
        },
        {
            ...baseItem,
            name: "Junkyard Club",
            type: "Weapon",
            tier: "Silver",
            cost: 4,
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
        },
        {
            ...baseItem,
            name: "Junkyard Repairbot",
            type: "Friend",
            secondaryType: "Tech",
            tier: "Silver",
            cost: 4,
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
        },
        {
            ...baseItem,
            name: "Barbed Wire",
            type: "Weapon",
            tier: "Silver",
            cost: 3,
            cooldown: 5.0,
            size: 1,
            damage: 10,
            passive: "When you Shield, this gains 5 Damage for the fight.",
            image: "./assets/images/BarbedWire.webp",
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
        },
        {
            ...baseItem,
            name: "Med Kit",
            type: "Loot",
            tier: "Gold",
            cost: 1,
            size: 1,
            isNonCombat: true,
            passive: "When you sell this, your leftmost Heal item gains 20 Heal.",
            image: "./assets/images/MedKit.webp",
        },
        {
            ...baseItem,
            name: "Crusher Claw",
            type: "Weapon",
            secondaryType: "Aquatic",
            tier: "Bronze",
            cost: 4,
            cooldown: 9.0,
            size: 2,
            damage: 0,  // Base damage is 0, actual damage based on shields
            shield: false,  // It doesn't provide shield
            shieldBonus: 2,  // Amount it increases other items' shields by
            passive: "Your Shield items gain +2 Shield for the fight.",
            image: "./assets/images/CrusherClaw.webp",
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
        },
        {
            ...baseItem,
            name: "Sea Shell",
            type: "Aquatic",
            tier: "Bronze",
            cost: 3,
            cooldown: 6.0,
            size: 1,
            shield: true,
            shieldAmount: 10,   // Base shield amount per aquatic item
            passive: "Shield 10 for each Aquatic item you have.",
            image: "./assets/images/SeaShell.webp",
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
                        shieldAmount: 0,
                        scalingType: "multiplier",
                        scaler: "shieldAmount",
                        scalingValue: 2
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
            cooldown: 0,
            size: 1,
            isNonCombat: true, // Mark as non-combat
            image: "./assets/images/Coconut.webp",
        },
        {
            ...baseItem,
            name: "Crusher Claw",
            type: "Weapon",
            secondaryType: "Aquatic",
            tier: "Bronze",
            cost: 4,
            cooldown: 9.0,
            size: 2,
            damage: 0,
            shield: false,
            shieldBonus: 2,  // Amount it increases other items' shields by
            passive: "Your Shield items gain +2 Shield for the fight.",
            image: "./assets/images/CrusherClaw.webp",
        },
        null,
        {
            ...baseItem,
            name: "Sea Shell",
            type: "Aquatic",
            tier: "Bronze",
            cost: 3,
            cooldown: 6.0,
            size: 1,
            shield: true,
            shieldAmount: 10,   // Base shield amount per aquatic item
            passive: "Shield 10 for each Aquatic item you have.",
            image: "./assets/images/SeaShell.webp",
        },
        null,
        null,
        null
    ]
};

const rogueScrapper = {
    name: "Rogue Scrapper",
    health: 450,
    slots: [
        null,
        {
            ...baseItem,
            name: "Scrap",
            type: "Loot",
            tier: "Bronze",
            cost: 2,
            cooldown: 0,
            size: 1,
            isNonCombat: true, // Mark as non-combat
            image: "./assets/images/Scrap.webp",
        },
        {
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
        },
        {
            ...baseItem,
            name: "Junkyard Club",
            type: "Weapon",
            tier: "Silver",
            cost: 4,
            cooldown: 11.0,
            size: 2,
            damage: 60,
            passive: "When you sell this, your Weapons gain 6 Damage.",
            image: "./assets/images/JunkyardClub.webp",
        },
        null, // This slot is occupied by Junkyard Club
        {
            ...baseItem,
            name: "Junkyard Repairbot",
            type: "Friend",
            secondaryType: "Tech",
            tier: "Silver",
            cost: 4,
            cooldown: 8.0,
            size: 2,
            heal: true,
            healAmount: 60,
            passive: "When you sell this, your leftmost Heal item gains +15 Heal.",
            image: "./assets/images/JunkyardRepairbot.webp",
        },
        null, // This slot is occupied by Junkyard Repairbot
        {
            ...baseItem,
            name: "Barbed Wire",
            type: "Weapon",
            tier: "Silver",
            cost: 3,
            cooldown: 5.0,
            size: 1,
            damage: 10,
            passive: "When you Shield, this gains 10 Damage for the fight.",
            image: "./assets/images/BarbedWire.webp",
        },
        {
            ...baseItem,
            name: "Med Kit",
            type: "Loot",
            tier: "Gold",
            cost: 1,
            size: 1,
            isNonCombat: true,
            passive: "When you sell this, your leftmost Heal item gains 20 Heal.",
            image: "./assets/images/MedKit.webp",
        },
        null
    ]
};

const boarrior = {
    name: "Boarrior",
    health: 300,
    slots: [
        null,
        {
            ...baseItem,
            name: "Scrap",
            type: "Loot",
            tier: "Bronze",
            cost: 2,
            cooldown: 0,
            size: 1,
            isNonCombat: true, // Mark as non-combat
            image: "./assets/images/Scrap.webp",
        },
        {
            ...baseItem,
            name: "Tusked Helm",
            type: "Weapon",
            secondaryType: "Apparel",
            tier: "Bronze",
            cost: 4,
            cooldown: 10.0,
            size: 1,
            damage: 15,
            shield: true,
            shieldAmount: 15,
            multicast: 2,
            image: "./assets/images/TuskedHelm.webp",
        },
        {
            ...baseItem,
            name: "Old Sword",
            type: "Weapon",
            tier: "Silver",
            cost: 3,
            cooldown: 5.0,
            size: 1,
            damage: 10,
            passive: "When you sell this, your leftmost Weapon gains +6 Damage.",
            image: "./assets/images/OldSword.webp",
        },
        {
            ...baseItem,
            name: "Hatchet",
            type: "Weapon",
            secondaryType: "Tool",
            tier: "Silver",
            cost: 3,
            cooldown: 6.0,
            size: 1,
            damage: 12,
            image: "./assets/images/Hatchet.webp",
        },
        {
            ...baseItem,
            name: "Shoe Blade",
            type: "Weapon",
            secondaryType: "Apparel",
            tier: "Silver",
            cost: 3,
            cooldown: 7.0,
            size: 1,
            damage: 40,
            crit: 0.3,
            image: "./assets/images/ShoeBlade.webp",
        },
        {
            ...baseItem,
            name: "Lumboars",
            type: "Weapon",
            tier: "Bronze",
            cost: 4,
            cooldown: 7.0,
            size: 2,
            damage: 10,
            multicast: 2,
            passive: "Your Weapons gain 10 Damage for the fight.",
            image: "./assets/images/Lumboars.webp",
        },
        null, // Occupied by Lumboars
        {
            ...baseItem,
            name: "Sharpening Stone",
            type: "Loot",
            tier: "Bronze",
            cost: 1,
            size: 1,
            isNonCombat: true,
            image: "./assets/images/SharpeningStone.webp",
        },
        null
    ]
};

export { 
    bazaar, 
    coconutCrabBuild,
    rogueScrapper,
    boarrior
};
