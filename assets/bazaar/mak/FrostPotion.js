import { baseItem } from '../../../js/baseItem.js';

const FrostPotion = {
    ...baseItem,
    name: "Frost Potion",
    type: "Potion",
    size: 1,
    currentTier: "Silver", // Starting tier is Silver
    image: "./assets/images/FrostPotion.webp",
    maxAmmo: 1,
    ammo: 1,
    freeze: true,
    
    tiers: {
        Silver: {
            value: 2,
            cooldown: 6.0,
            freezeTargets: 1,
            freezeDuration: 1
        },
        Gold: {
            value: 4,
            cooldown: 6.0,
            freezeTargets: 2,
            freezeDuration: 1
        },
        Diamond: {
            value: 8,
            cooldown: 6.0,
            freezeTargets: 3,
            freezeDuration: 1
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
        return `Freeze ${tier.freezeTargets} item(s) for ${tier.freezeDuration} second(s).`;
    },
    
    passive: function() {
        return this.getDescription();
    },
    
    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 1,
                slowDuration: 3
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
                hasteDuration: 3
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                shield: true,
                shieldAmount: 50
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 75
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 4
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 6
            }
        },
        shiny: {
            name: "Shiny",
            effect: {
                multicast: 1
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
                damage: 50
            }
        }
    }
};

export default FrostPotion; 