import { baseItem } from '../../../js/baseItem.js';

const Seashell = {
    ...baseItem,
    name: "Sea Shell",
    type: "Aquatic",
    size: 1,
    currentTier: "Bronze", // Default tier
    image: "./assets/images/SeaShell.webp",
    trigger: "Cooldown",
    target: "self",
    shield: true,
    
    tiers: {
        Bronze: {
            cost: 2,
            value: 1, // sell value
            cooldown: 6.0,
            shieldAmount: 0, // Base shield, will be calculated dynamically
            shieldPerAquatic: 10
        },
        Silver: {
            cost: 4,
            value: 2,
            cooldown: 6.0,
            shieldAmount: 0,
            shieldPerAquatic: 15
        },
        Gold: {
            cost: 8,
            value: 4,
            cooldown: 6.0,
            shieldAmount: 0,
            shieldPerAquatic: 20
        },
        Diamond: {
            cost: 16,
            value: 8,
            cooldown: 6.0,
            shieldAmount: 0,
            shieldPerAquatic: 25
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
    passive: function() {
        const tier = this.tiers[this.currentTier];
        return `Gains ${tier.shieldPerAquatic} shield for each Aquatic item on your board.`;
    },
    
    // Calculate shield amount based on aquatic count
    calculateShield: function(aquaticCount) {
        const tier = this.tiers[this.currentTier];
        return aquaticCount * tier.shieldPerAquatic;
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
                scalingType: "percentage",
                scaler: "shieldAmount",
                scalingValue: 2, // Double shield
                shield: true
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
                scalingValue: 0.1 // 10% of shield as poison
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "shieldAmount",
                scalingValue: 0.1 // 10% of shield as burn
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
                scalingType: "equal",
                scaler: "shieldAmount"
            }
        }
    }
};

// Create a proxy to intercept property access
const SeashellProxy = new Proxy(Seashell, {
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

export default SeashellProxy;
