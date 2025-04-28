import { baseItem } from '../../../js/baseItem.js';

const GearnolaBar = {
    ...baseItem,
    name: "Gearnola Bar",
    type: "Food",
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/GearnolaBar.webp",
    shield: true,
    ammo: 2,
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 5.0,
            shieldAmount: 30
        },
        Silver: {
            value: 2,
            cooldown: 5.0,
            shieldAmount: 60
        },
        Gold: {
            value: 4,
            cooldown: 5.0,
            shieldAmount: 90
        },
        Diamond: {
            value: 8,
            cooldown: 5.0,
            shieldAmount: 120
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
    
    getDescription() {
        const tier = this.tiers[this.currentTier];
        return `Shield ${tier.shieldAmount}. Max Ammo: ${this.maxAmmo}.`;
    },
    
    passive() {
        return "When you sell a Tool, this gains +1 Max Ammo.";
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
                damageMultiplier: 2
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

export default GearnolaBar; 