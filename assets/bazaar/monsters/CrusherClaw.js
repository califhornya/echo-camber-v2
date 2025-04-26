import { baseItem } from '../../../js/baseItem.js';
import { getHighestShieldValue } from '../../../js/utils.js';

const CrusherClaw = {
    ...baseItem,
    name: "Crusher Claw",
    type: "Aquatic",
    size: 2,
    currentTier: "Bronze", // Default tier
    image: "assets/images/CrusherClaw.webp",
    
    // Implement tier structure
    tiers: {
        Bronze: {
            cost: 4,
            value: 2,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 2
        },
        Silver: {
            cost: 8,
            value: 4,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 4
        },
        Gold: {
            cost: 16,
            value: 8,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 6
        },
        Diamond: {
            cost: 32,
            value: 16,
            cooldown: 9.0,
            shieldAmount: 15,
            shieldBonus: 8
        }
    },
    
    // Add lifecycle methods
    onPreTrigger(simulator, sourceState, targetState) {
        // Calculate damage based on highest shield value
        const sourceBoard = sourceState === simulator.playerState ? simulator.playerState.slots : simulator.monsterState.slots;
        const highestShield = getHighestShieldValue(sourceBoard);
        
        // Store the calculated damage for use in onTrigger
        this._calculatedDamage = highestShield;
        simulator.log(`Crusher Claw found highest shield value: ${highestShield}`, 'trigger');
    },

    onTrigger(simulator, sourceState, targetState) {
        // Apply the pre-calculated damage
        if (this._calculatedDamage) {
            simulator.applyDamage(targetState, this._calculatedDamage, 
                targetState === simulator.playerState ? 'Player' : 'Monster', 
                this.name);
        }
    },

    onPostTrigger(simulator, sourceState, targetState) {
        const sourceBoard = sourceState === simulator.playerState ? simulator.playerState.slots : simulator.monsterState.slots;
        const sourceName = sourceState === simulator.playerState ? 'Player' : 'Monster';
        const shieldBonus = this.tiers[this.currentTier].shieldBonus;
    
        sourceBoard.forEach(item => {
            if (item && (item.shield === true || item.name === "Sea Shell")) {
                if (item.name === "Sea Shell") {
                    const currentPerAquatic = item.shieldPerAquatic || 
                        (item.tiers && item.currentTier ? 
                            item.tiers[item.currentTier].shieldPerAquatic : 5);
                    // Update both the direct property and the tier property
                    const newShieldPerAquatic = currentPerAquatic + shieldBonus;
                    item.shieldPerAquatic = newShieldPerAquatic;
                    if (item.tiers && item.currentTier) {
                        item.tiers[item.currentTier].shieldPerAquatic = newShieldPerAquatic;
                    }
                    simulator.log(`${sourceName}'s Sea Shell now provides ${newShieldPerAquatic} shield per aquatic item`, 'shield');
                } else {
                    item.shieldAmount = (item.shieldAmount || 0) + shieldBonus;
                    simulator.log(`${sourceName}'s ${item.name} gains +${shieldBonus} shield from Crusher Claw`, 'shield');
                }
            }
        });

        // Clean up the stored damage value
        delete this._calculatedDamage;
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
        return false; // Already at max tier
    },
    
    // Method to downgrade tier
    downgradeTier() {
        const tierOrder = ["Bronze", "Silver", "Gold", "Diamond"];
        const currentIndex = tierOrder.indexOf(this.currentTier);
        if (currentIndex > 0) {
            this.currentTier = tierOrder[currentIndex - 1];
            return true;
        }
        return false; // Already at lowest tier
    },
    
    // Generate a description based on the current tier
    getDescription() {
        const tier = this.tiers[this.currentTier];
        return `Shield items gain +${tier.shieldBonus} shield. Deal damage equal to your highest shield value.`;
    },
    
    passive: function() {
        return this.getDescription();
    },
    
    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                slowTargets: 2,
                slowDuration: 2,
                cooldown: 11
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                cooldown: 7
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
        shielded: {
            name: "Shielded",
            effect: {
                shieldMultiplier: 2 // Double shield bonus
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                heal: true,
                healAmount: 0,
                scalingType: "equal",
                scaler: "shieldAmount"
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                poison: 0,
                scalingType: "percentage",
                scaler: "damage",
                scalingValue: 0.1  // 10% of the damage as poison
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                burn: 0,
                scalingType: "percentage",
                scaler: "damage",
                scalingValue: 0.1  // 10% of the damage as burn
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
                damageMultiplier: 2 // Double damage
            }
        }
    }
};

export default CrusherClaw;
