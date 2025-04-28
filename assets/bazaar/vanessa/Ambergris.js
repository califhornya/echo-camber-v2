import { baseItem } from '../../../js/baseItem.js';

const Ambergris = {
    ...baseItem,
    name: "Ambergris",
    type: "Aquatic",
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/Ambergris.webp",
    heal: true,
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 7.0,
            healMultiplier: 1
        },
        Silver: {
            value: 2,
            cooldown: 7.0,
            healMultiplier: 2
        },
        Gold: {
            value: 4,
            cooldown: 7.0,
            healMultiplier: 3
        },
        Diamond: {
            value: 8,
            cooldown: 7.0,
            healMultiplier: 4
        }
    },
    
    getTierValue(attribute) {
        return this.tiers[this.currentTier][attribute];
    },
    
    upgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex < tierOrder.length - 1) {
            this.currentTier = tierOrder[currentIndex + 1];
            return true;
        }
        return false;
    },
    
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
        return `Heal equal to ${tier.healMultiplier}x this item's value.\nWhen you buy another Aquatic item, this gains 1 » 2 » 3 » 4 Value.`;
    },

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 1,
                slowDuration: 1
            }
        },
        golden: {
            name: "Golden",
            effect: {
                valueMultiplier: 2
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
                scalingType: "equal",
                scaler: "heal"
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                healMultiplier: 2
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "heal",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "heal",
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
                scaler: "heal"
            }
        }
    }
};

export default Ambergris; 