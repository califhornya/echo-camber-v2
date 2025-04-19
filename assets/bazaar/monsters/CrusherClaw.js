import { baseItem } from '../../../js/baseItem.js';

const CrusherClaw = {
    ...baseItem,
    name: "Crusher Claw",
    type: "Weapon",
    secondaryType: "Aquatic",
    size: 2,
    currentTier: "Bronze", // Default tier
    image: "assets/images/CrusherClaw.webp",
    
    // Implement tier structure
    tiers: {
        Bronze: {
            cost: 4,
            value: 2,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 2
        },
        Silver: {
            cost: 8,
            value: 4,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 4
        },
        Gold: {
            cost: 16,
            value: 8,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 6
        },
        Diamond: {
            cost: 32,
            value: 16,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 8
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
        return `Shield items gain +${tier.shieldBonus} shield. Deal damage equal to your highest shield value.`;
    },
    
    passive: function() {
        return this.getDescription();
    },
    
    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 2,
                cooldown: 11
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                cooldown: 7
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
        shielded: {
            name: "Shielded",
            effect: {
                shieldMultiplier: 2 // Double shield bonus
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
                scaler: "damage",
                scalingValue: 0.1  // 10% of the damage as poison
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "damage",
                scalingValue: 0.1  // 10% of the damage as burn
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
                crit: 0.5 // +50% crit chance
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
                damageMultiplier: 2 // Double damage
            }
        }
    }
};

export default CrusherClaw;
