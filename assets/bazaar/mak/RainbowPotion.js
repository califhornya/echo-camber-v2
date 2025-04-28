import { baseItem } from '../../../js/baseItem.js';

const RainbowPotion = {
    ...baseItem,
    name: "Rainbow Potion",
    type: "Potion",
    size: 1,
    currentTier: "Silver", // Starting tier is Silver
    image: "./assets/images/RainbowPotion.webp",
    maxAmmo: 1,
    ammo: 1,
    burn: true,
    poison: true,
    freeze: true,
    slow: true,
    
    tiers: {
        Silver: {
            value: 2,
            cooldown: 7.0,
            burn: 3,
            poison: 3,
            freezeTargets: 1,
            freezeDuration: 1,
            slowTargets: 1,
            slowDuration: 2
        },
        Gold: {
            value: 4,
            cooldown: 7.0,
            burn: 6,
            poison: 6,
            freezeTargets: 1,
            freezeDuration: 2,
            slowTargets: 1,
            slowDuration: 3
        },
        Diamond: {
            value: 8,
            cooldown: 7.0,
            burn: 9,
            poison: 9,
            freezeTargets: 1,
            freezeDuration: 3,
            slowTargets: 1,
            slowDuration: 4
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
        return false;
    },
    
    // Method to downgrade tier
    downgradeTier() {
        const tierOrder = ["Silver", "Gold", "Diamond"];
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
        return `Burn ${tier.burn}. Poison ${tier.poison}.\nFreeze 1 small item for ${tier.freezeDuration} second(s).\nSlow 1 item for ${tier.slowDuration} second(s).`;
    },
    
    passive: function() {
        return this.getDescription();
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
                freezeDuration: 2 // Double freeze duration
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                hasteTargets: 1,
                hasteDuration: 4
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
                poisonMultiplier: 2 // Double poison
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burnMultiplier: 2 // Double burn
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
                damage: 0,
                scalingType: "multiplier",
                scaler: "burn",
                scalingValue: 10
            }
        }
    }
};

export default RainbowPotion; 