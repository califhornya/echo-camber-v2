import { baseItem } from '../../../js/baseItem.js';

const Lighter = {
    ...baseItem,
    name: "Lighter",
    type: "Tool",
    size: 1,
    currentTier: "Bronze", // Default tier
    image: "./assets/images/Lighter.webp",
    
    tiers: {
        Bronze: {
            cost: 2,
            value: 1,
            cooldown: 3.0,
            burn: 2
        },
        Silver: {
            cost: 4,
            value: 2,
            cooldown: 3.0,
            burn: 4
        },
        Gold: {
            cost: 8,
            value: 4,
            cooldown: 3.0,
            burn: 6
        },
        Diamond: {
            cost: 16,
            value: 8,
            cooldown: 3.0,
            burn: 8
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
        return `Apply ${tier.burn} Burn.`;
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
                scaler: "burn",
                scalingValue: 10
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "multiplier",
                scaler: "burn",
                scalingValue: 10
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
                burn: 0,
                scalingType: "multiplier",
                scaler: "burn",
                scalingValue: 2
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
                scalingType: "multiplier",
                scaler: "burn",
                scalingValue: 10
            }
        }
    }
};

export default Lighter; 