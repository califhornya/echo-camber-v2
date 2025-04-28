import { baseItem } from '../../../js/baseItem.js';

const Barrel = {
    ...baseItem,
    name: "Barrel",
    type: "Item",
    size: 2,
    currentTier: "Bronze",
    image: "./assets/images/Barrel.webp",
    shield: true,
    
    tiers: {
        Bronze: {
            value: 2,
            cooldown: 5.0,
            shieldAmount: 20,
            passiveGain: 10
        },
        Silver: {
            value: 4,
            cooldown: 5.0,
            shieldAmount: 20,
            passiveGain: 15
        },
        Gold: {
            value: 8,
            cooldown: 5.0,
            shieldAmount: 20,
            passiveGain: 20
        },
        Diamond: {
            value: 16,
            cooldown: 5.0,
            shieldAmount: 20,
            passiveGain: 25
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
        return `Shield ${tier.shieldAmount}.\nWhen you use an adjacent non-Weapon item, this gains ${tier.passiveGain} Shield for the fight.`;
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
                freezeDuration: 1,
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
                shieldMultiplier: 2
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "equal",
                scaler: "shield"
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "shield",
                scalingValue: 0.1
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "shield",
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
                scaler: "shield"
            }
        }
    }
};

export default Barrel; 