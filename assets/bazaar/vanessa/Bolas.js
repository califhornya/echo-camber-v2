import { baseItem } from '../../../js/baseItem.js';

const Bolas = {
    ...baseItem,
    name: "Bolas",
    type: "Weapon",
    size: 1,
    currentTier: "Bronze",
    image: "./assets/images/Bolas.webp",
    maxAmmo: 2,
    ammo: 2,
    
    tiers: {
        Bronze: {
            value: 1,
            cooldown: 5.0,
            damage: 40,
            slowDuration: 2
        },
        Silver: {
            value: 2,
            cooldown: 5.0,
            damage: 60,
            slowDuration: 3
        },
        Gold: {
            value: 4,
            cooldown: 5.0,
            damage: 80,
            slowDuration: 4
        },
        Diamond: {
            value: 8,
            cooldown: 5.0,
            damage: 100,
            slowDuration: 5
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
        return `Deal ${tier.damage} Damage.\nSlow 1 item for ${tier.slowDuration} second(s).\nMax Ammo: ${this.maxAmmo}`;
    },

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowDurationMultiplier: 2
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

export default Bolas; 