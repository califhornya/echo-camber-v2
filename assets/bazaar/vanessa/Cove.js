import { baseItem } from '../../../js/baseItem.js';

const Cove = {
    ...baseItem,
    name: "Cove",
    type: "Aquatic",
    size: 3,
    currentTier: "Bronze", // Default tier
    image: "./assets/images/Cove.webp",
    shield: true,
    
    tiers: {
        Bronze: {
            cost: 6,
            value: 3, // sell value
            cooldown: 4.0,
            shieldAmount: 3, // Base shield value
            passiveValueGain: 1 // When you sell an item, gains +1 value
        },
        Silver: {
            cost: 12,
            value: 6,
            cooldown: 4.0,
            shieldAmount: 6,
            passiveValueGain: 1
        },
        Gold: {
            cost: 24,
            value: 12,
            cooldown: 4.0,
            shieldAmount: 12,
            passiveValueGain: 1
        },
        Diamond: {
            cost: 48,
            value: 24,
            cooldown: 4.0,
            shieldAmount: 24,
            passiveValueGain: 2
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
        return `Shield equal to ${tier.shieldAmount} x this item's value. When you sell an item, this gains ${tier.passiveValueGain} value.`;
    },
    
    passive: function() {
        return this.getDescription();
    },
    
    enchantmentEffects: {
        golden: {
            name: "Golden",
            effect: {
                valueMultiplier: 2 // Double value
            }
        },
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 3,
                slowDuration: 1
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
                hasteTargets: 3,
                hasteDuration: 1
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                shieldMultiplier: 2 // Double shield
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

// Create a proxy to intercept property access
const CoveProxy = new Proxy(Cove, {
    get(target, prop) {
        // If the property exists on the object, return it
        if (prop in target) {
            const value = target[prop];
            // If it's a method, bind it to the target
            if (typeof value === 'function') {
                return value.bind(target);
            }
            return value;
        }
        
        // Check if the property exists in the current tier
        if (target.tiers[target.currentTier] && prop in target.tiers[target.currentTier]) {
            return target.tiers[target.currentTier][prop];
        }
        
        return undefined;
    }
});

export default CoveProxy;
