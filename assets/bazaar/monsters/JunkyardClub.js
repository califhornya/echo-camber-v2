import { baseItem } from '../../../js/baseItem.js';

const JunkyardClub = {
    ...baseItem,
    name: "Junkyard Club",
    type: "Weapon",
    size: 2,
    currentTier: "Bronze",
    image: "./assets/images/JunkyardClub.webp",
    
    tiers: {
        Bronze: {
            value: 2,
            cooldown: 11.0,
            damage: 30,
            passiveGain: 4
        },
        Silver: {
            value: 4,
            cooldown: 11.0,
            damage: 60,
            passiveGain: 6
        },
        Gold: {
            value: 8,
            cooldown: 11.0,
            damage: 120,
            passiveGain: 8
        },
        Diamond: {
            value: 16,
            cooldown: 11.0,
            damage: 240,
            passiveGain: 10
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
    
    // Generate a description based on the current tier
    getDescription() {
        const tier = this.tiers[this.currentTier];
        return `Deal ${tier.damage} Damage. When you sell this, your Weapons gain ${tier.passiveGain} Damage.`;
    },
    
    passive() {
        return this.getDescription();
    },

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 3
            }
        },
        icy: {
            name: "Icy",
            effect: {
                freezeTargets: 1,
                freezeDuration: 3,
                freezeSize: "medium"
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                hasteTargets: 2,
                hasteDuration: 3
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                shield: true,
                shieldAmount: 0,
                scalingType: "equal",
                scaler: "damage"
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "equal",
                scaler: "damage"
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "damage",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "damage",
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
                damageMultiplier: 2
            }
        }
    }
};

export default JunkyardClub; 