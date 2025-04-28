import { baseItem } from '../../../js/baseItem.js';

const TuskedHelm = {
    ...baseItem,
    name: "Tusked Helm",
    type: "Weapon",
    secondaryType: "Apparel",
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/TuskedHelm.webp",
    shield: true,
    multicast: 2,
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 10.0,
            damage: 10,
            shieldAmount: 10
        },
        Silver: {
            value: 2,
            cooldown: 10.0,
            damage: 15,
            shieldAmount: 15
        },
        Gold: {
            value: 4,
            cooldown: 10.0,
            damage: 20,
            shieldAmount: 20
        },
        Diamond: {
            value: 8,
            cooldown: 10.0,
            damage: 25,
            shieldAmount: 25
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
        return `Deal ${tier.damage} Damage.\nShield ${tier.shieldAmount}.\nMulticast: ${this.multicast}`;
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
                freezeTargets: 1,
                freezeDuration: 1,
                freezeSize: "small"
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
                shieldMultiplier: 2
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

export default TuskedHelm; 