import { baseItem } from '../../../js/baseItem.js';

const JunkyardRepairbot = {
    ...baseItem,
    name: "Junkyard Repairbot",
    type: "Friend",
    secondaryType: "Tech",
    size: 2,
    currentTier: "Bronze",
    image: "./assets/images/JunkyardRepairbot.webp",
    heal: true,
    
    tiers: {
        Bronze: {
            value: 2,
            cooldown: 8.0,
            healAmount: 30,
            passiveGain: 5
        },
        Silver: {
            value: 4,
            cooldown: 8.0,
            healAmount: 60,
            passiveGain: 15
        },
        Gold: {
            value: 8,
            cooldown: 8.0,
            healAmount: 120,
            passiveGain: 30
        },
        Diamond: {
            value: 16,
            cooldown: 8.0,
            healAmount: 240,
            passiveGain: 50
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
        return `Heal ${tier.healAmount}. When you sell this, your leftmost Heal item gains +${tier.passiveGain} Heal.`;
    },
    
    passive() {
        return this.getDescription();
    },

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 2
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
        turbo: {
            name: "Turbo",
            effect: {
                hasteTargets: 2,
                hasteDuration: 2
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                shield: true,
                shieldAmount: 0,
                scalingType: "equal",
                scaler: "healAmount"
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
                scaler: "healAmount",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "healAmount",
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
                scaler: "healAmount"
            }
        }
    }
};

export default JunkyardRepairbot; 