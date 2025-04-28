import { baseItem } from '../../../js/baseItem.js';

const Grenade = {
    ...baseItem,
    name: "Grenade",
    type: "Weapon",
    size: 1,
    currentTier: "Bronze", // Default tier
    image: "./assets/images/Grenade.webp",
    maxAmmo: 1,
    ammo: 1,
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 5.0,
            damage: 50,
            crit: 0.25
        },
        Silver: {
            value: 2,
            cooldown: 5.0,
            damage: 100,
            crit: 0.25
        },
        Gold: {
            value: 4,
            cooldown: 5.0,
            damage: 150,
            crit: 0.25
        },
        Diamond: {
            value: 8,
            cooldown: 5.0,
            damage: 200,
            crit: 0.25
        }
    },
    
    // Helper method to get current tier values
    getTierValue(attribute) {
        return this.tiers[this.currentTier][attribute];
    },
    
    // Method to upgrade tier
    upgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex < tierOrder.length - 1) {
            this.currentTier = tierOrder[currentIndex + 1];
            return true;
        }
        return false; // Already at max tier
    },
    
    // Method to downgrade tier
    downgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex > 0) {
            this.currentTier = tierOrder[currentIndex - 1];
            return true;
        }
        return false; // Already at lowest tier
    },
    
    // Generate a description based on the current tier
    getDescription() {
        const tier = this.tiers[this.currentTier];
        return `Deal ${tier.damage} Damage. ${Math.round(tier.crit * 100)}% chance to Crit.`;
    },
    
    passive: function() {
        return this.getDescription();
    },
    
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
};

export default Grenade; 