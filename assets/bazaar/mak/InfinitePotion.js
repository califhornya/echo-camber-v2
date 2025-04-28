import { baseItem } from '../../../js/baseItem.js';

const InfinitePotion = {
    ...baseItem,
    name: "Infinite Potion",
    type: "Potion",
    size: 1,
    currentTier: "Silver", // Default tier
    image: "./assets/images/InfinitePotion.webp",
    regen: true,
    maxAmmo: 1,
    ammo: 1,
    passive: "Reload this.",
    
    tiers: {
        Silver: {
            value: 2, // sell value
            cooldown: 4.0,
            regenAmount: 1
        },
        Gold: {
            value: 4,
            cooldown: 4.0,
            regenAmount: 2
        },
        Diamond: {
            value: 8,
            cooldown: 4.0,
            regenAmount: 3
        }
    },
    
    // Helper method to get current tier values
    getTierValue(attribute) {
        return this.tiers[this.currentTier][attribute];
    },
    
    // Method to upgrade tier
    upgradeTier() {
        const tierOrder = ["Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex < tierOrder.length - 1) {
            this.currentTier = tierOrder[currentIndex + 1];
            return true;
        }
        return false; // Already at max tier
    },
    
    // Method to downgrade tier
    downgradeTier() {
        const tierOrder = ["Silver", "Gold", "Diamond"];
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
        return `Gain ${tier.regenAmount} Regeneration for the fight. Reload this.`;
    },
    
    passive: function() {
        return this.getDescription();
    },
    
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
const InfinitePotionProxy = new Proxy(InfinitePotion, {
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

export default InfinitePotionProxy; 