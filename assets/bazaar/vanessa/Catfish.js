import { baseItem } from '../../../js/baseItem.js';

const Catfish = {
    ...baseItem,
    name: "Catfish",
    type: ["Aquatic", "Friend"],
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/Catfish.webp",
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 5.0,
            poison: 3
        },
        Silver: {
            value: 2,
            cooldown: 5.0,
            poison: 4
        },
        Gold: {
            value: 4,
            cooldown: 5.0,
            poison: 6
        },
        Diamond: {
            value: 8,
            cooldown: 5.0,
            poison: 8
        }
    },

    passive: "When this gains Haste, this gains +2 » +4 » +6 » +8 Poison for the fight.",
    
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
                shield: true,
                shieldAmount: 0,
                scalingType: "equal",
                scaler: "poison",
                scalingValue: 10
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "equal",
                scaler: "poison",
                scalingValue: 10
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                damageMultiplier: 2,
                scalingType: "multiplier",
                scaler: "poison"
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "equal",
                scaler: "poison"
            }
        },
        shiny: {
            name: "Shiny",
            effect: {
                multicast: 2
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
                scaler: "poison",
                scalingValue: 10
            }
        }
    }
};

export default Catfish; 