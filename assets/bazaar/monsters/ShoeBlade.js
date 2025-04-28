import { baseItem } from '../../../js/baseItem.js';

const ShoeBlade = {
    ...baseItem,
    name: "Shoe Blade",
    type: "Weapon",
    secondaryType: "Apparel",
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/ShoeBlade.webp",
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 7.0,
            damage: 20,
            critChance: 0.15
        },
        Silver: {
            value: 2,
            cooldown: 7.0,
    damage: 40,
            critChance: 0.30
        },
        Gold: {
            value: 4,
            cooldown: 7.0,
            damage: 60,
            critChance: 0.50
        },
        Diamond: {
            value: 8,
            cooldown: 7.0,
            damage: 80,
            critChance: 1.00
        }
    },
    
    getTierValue(attribute) {
        return this.tiers[this.currentTier][attribute];
    },
    
    upgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex < tierOrder.length - 1) {
            this.currentTier = tierOrder[currentIndex + 1];
            return true;
        }
        return false;
    },
    
    downgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex > 0) {
            this.currentTier = tierOrder[currentIndex - 1];
            return true;
        }
        return false;
    },
    
    getDescription() {
        const tier = this.tiers[this.currentTier];
        return `Deal ${tier.damage} Damage.\nCrit Chance: ${Math.round(tier.critChance * 100)}%`;
    },

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
                crit: 2.0
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

export default ShoeBlade; 