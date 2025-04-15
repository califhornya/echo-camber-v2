import { baseItem } from './baseItem.js';

const testDatabase = {
    items: [
        {
            ...baseItem,
            name: "Wooden Sword",
            type: "Weapon",
            tier: "Bronze",
            cost: 1,
            cooldown: 2,
            size: 1,
            damage: 3
        },
        {
            ...baseItem,
            name: "Battle Axe",
            type: "Weapon",
            tier: "Silver",
            cost: 3,
            cooldown: 3,
            size: 2,
            damage: 7
        },
        {
            ...baseItem,
            name: "Dragon Lance",
            type: "Weapon",
            tier: "Gold",
            cost: 5,
            cooldown: 4,
            size: 3,
            damage: 12
        },
        {
            ...baseItem,
            name: "Health Potion",
            type: "Consumable",
            tier: "Bronze",
            cost: 2,
            cooldown: 3,
            size: 1,
            heal: true
        },
        {
            ...baseItem,
            name: "Frost Staff",
            type: "Weapon",
            tier: "Silver",
            cost: 4,
            cooldown: 3,
            size: 2,
            damage: 4,
            freeze: true,
            freezeDuration: 2,
            freezeTargets: 1
        },
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
            critDamageMultiplier: 2,
            image: "./assets/images/Cutlass.webp",
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
                    effect: { slowTargets: 1, slowDuration: 6 }
                },
                icy: {
                    name: "Icy",
                    effect: { freezeTargets: 1, freezeDuration: 3, freezeSize: "small" }
                },
                turbo: {
                    name: "Turbo",
                    effect: { hasteTargets: 1, hasteDuration: 6 }
                },
                shielded: {
                    name: "Shielded",
                    effect: { shield: true, shieldAmount: 50 }
                },
                restorative: {
                    name: "Restorative",
                    effect: { heal: true, healAmount: 50 }
                },
                toxic: {
                    name: "Toxic",
                    effect: { poison: 5 }
                },
                fiery: {
                    name: "Fiery",
                    effect: { burn: 5 }
                },
                shiny: {
                    name: "Shiny",
                    effect: { multicast: 1 }
                },
                deadly: {
                    name: "Deadly",
                    effect: { critDamage: 4 }
                },
                radiant: {
                    name: "Radiant",
                    effect: { immuneToFreeze: true, immuneToSlow: true, immuneToDestroy: true }
                },
                obsidian: {
                    name: "Obsidian",
                    effect: { damageMultiplier: 2 }
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
        {
            ...baseItem,
            name: "Coconut",
            type: "Food",
            tier: "Bronze",
            cost: 2,
            cooldown: 0,  // Passive item
            size: 1,
            image: "./assets/images/Coconut.webp",
        },
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
        null,
        null,
        null
    ]
};

export { testDatabase, coconutCrabBuild as monsterBuild };
