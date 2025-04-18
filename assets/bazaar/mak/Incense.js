import { baseItem } from '../../../js/baseItem.js';

const Incense = {
    ...baseItem,
    name: "Incense",
    type: "Reagent",
    size: 1,
    currentTier: "Bronze", // Default tier
    image: "./assets/images/Incense.webp",
    slow: true,
    regen: true,
    
    tiers: {
        Bronze: {
            cost: 2,
            value: 1, // sell value
            cooldown: 6.0,
            slowTargets: 1,
            slowDuration: 1,
            regenAmount: 1
        },
        Silver: {
            cost: 4,
            value: 2,
            cooldown: 6.0,
            slowTargets: 2,
            slowDuration: 1,
            regenAmount: 3
        },
        Gold: {
            cost: 8,
            value: 4,
            cooldown: 6.0,
            slowTargets: 3,
            slowDuration: 1,
            regenAmount: 5
        },
        Diamond: {
            cost: 16,
            value: 8,
            cooldown: 6.0,
            slowTargets: 4,
            slowDuration: 1,
            regenAmount: 7
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
        return `Slow ${tier.slowTargets} item(s) for ${tier.slowDuration} second(s). Gain ${tier.regenAmount} Regeneration for the fight.`;
    },
    
    passive: function() {
        return this.getDescription();
    },
    
    // Proxy handler to dynamically access tier properties
    get(target, prop) {
        if (prop in target) {
            return target[prop];
        }
        
        // Check if the property exists in the current tier
        if (target.tiers[target.currentTier] && prop in target.tiers[target.currentTier]) {
            return target.tiers[target.currentTier][prop];
        }
        
        return undefined;
    },
    
    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowDuration: 2 // Double slow duration
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
                scalingType: "multiplier",
                scaler: "regenAmount",
                scalingValue: 10 // 10x regenAmount
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "multiplier",
                scaler: "regenAmount",
                scalingValue: 10 // 10x regenAmount
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "equal",
                scaler: "regenAmount"
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "equal",
                scaler: "regenAmount"
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
                damage: 0,
                scalingType: "multiplier",
                scaler: "regenAmount",
                scalingValue: 10 // 10x regenAmount
            }
        }
    }
};

// Create a proxy to intercept property access
const IncenseProxy = new Proxy(Incense, {
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

export default IncenseProxy; 