import { baseItem } from '../../../js/baseItem.js';

const BeachBall = {
    ...baseItem,
    name: "Beach Ball",
    type: ["Aquatic", "Toy"],
    size: 2,
    currentTier: "Bronze",
    image: "./assets/images/BeachBall.webp",
    haste: true,
    
    tiers: {
        Bronze: {
            value: 2,
            cooldown: 5.0,
            hasteTargets: 2,
            hasteDuration: 2
        },
        Silver: {
            value: 4,
            cooldown: 5.0,
            hasteTargets: 3,
            hasteDuration: 2
        },
        Gold: {
            value: 8,
            cooldown: 5.0,
            hasteTargets: 4,
            hasteDuration: 2
        },
        Diamond: {
            value: 16,
            cooldown: 5.0,
            hasteTargets: 5,
            hasteDuration: 2
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
        return `Haste ${tier.hasteTargets} Aquatic or Toy item(s) for ${tier.hasteDuration} second(s).`;
    },

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 1
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
                hasteDurationMultiplier: 2
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                shield: true,
                shieldAmount: 10,
                perType: ["Aquatic", "Toy"]
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 15,
                perType: ["Aquatic", "Toy"]
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 1,
                perType: ["Aquatic", "Toy"]
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 1,
                perType: ["Aquatic", "Toy"]
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
                critBonus: 0.1,
                perType: ["Aquatic", "Toy"]
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
                damage: 10,
                perType: ["Aquatic", "Toy"]
            }
        }
    }
};

export default BeachBall; 