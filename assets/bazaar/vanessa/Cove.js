import { baseItem } from '../../../js/baseItem.js';

const Cove = {
    ...baseItem,
    name: "Cove",
    type: "Aquatic",
    size: 3,
    currentTier: "Bronze",
    image: "./assets/images/Cove.webp",
    shield: true,
    
    tiers: {
        Bronze: {
            value: 3,
            cooldown: 4.0,
            baseShieldAmount: 3,
            tierMultiplier: 1
        },
        Silver: {
            value: 6,
            cooldown: 4.0,
            baseShieldAmount: 6,
            tierMultiplier: 2
        },
        Gold: {
            value: 12,
            cooldown: 4.0,
            baseShieldAmount: 12,
            tierMultiplier: 3
        },
        Diamond: {
            value: 24,
            cooldown: 4.0,
            baseShieldAmount: 24,
            tierMultiplier: 4
        }
    },
    
    get shieldAmount() {
        const tier = this.tiers[this.currentTier];
        // Use the item's current value (which might be edited by player) 
        // multiplied by the tier multiplier
        return this.value * tier.tierMultiplier;
    },
    
    // Method to upgrade tier
    upgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex < tierOrder.length - 1) {
            this.currentTier = tierOrder[currentIndex + 1];
            return true;
        }
        return false;
    },
    
    // Method to downgrade tier
    downgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex > 0) {
            this.currentTier = tierOrder[currentIndex - 1];
            return true;
        }
        return false;
    },
    
    // Generate a description based on the current tier
    getDescription() {
        const tier = this.tiers[this.currentTier];
        return `Shield equal to ${tier.tierMultiplier}x this item's value.`;
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

export default Cove;
