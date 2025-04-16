export class CombatSimulator {
    constructor(playerBoard, monsterBoard) {
        this.playerBoard = playerBoard;
        this.monsterBoard = monsterBoard;
        this.time = 0;
        this.isRunning = false;

        // Combat state
        this.playerState = {
            hp: 250,
            shield: 0,
            poison: 0,
            burn: { value: 0 } // Burn state
        };

        this.monsterState = {
            hp: monsterBoard.health || 200,
            shield: 0,
            poison: 0,
            burn: { value: 0 } // Burn state
        };

        this.logs = [];
        this.currentTimeLogs = [];
        this.groupedLogs = [];
    }

    log(message, type = 'default') {
        this.currentTimeLogs.push({ message, type });
    }

    // New method to flush current time logs and create a grouped entry
    flushTimeLogs() {
        if (this.currentTimeLogs.length > 0) {
            // Separate action logs from status logs
            const actionLogs = this.currentTimeLogs.filter(log => 
                !log.message.includes('HP:') && !log.message.includes('Shield:')
            );
            const statusLogs = this.currentTimeLogs.filter(log => 
                log.message.includes('HP:') || log.message.includes('Shield:')
            );

            this.groupedLogs.push({
                timestamp: this.time,
                actions: actionLogs,
                status: statusLogs
            });
            this.currentTimeLogs = [];  // Clear the buffer
        }
    }

    displayLogs() {
        const logContainer = document.getElementById('combat-log');
        logContainer.innerHTML = this.groupedLogs
            .map(timeGroup => `
                <div class="log-group">
                    <div class="log-timestamp">t=${timeGroup.timestamp}s</div>
                    ${timeGroup.actions.map(log => 
                        `<div class="log-entry log-${log.type}">${log.message}</div>`
                    ).join('')}
                    ${timeGroup.status.length > 0 ? '<div class="log-status">' + 
                        timeGroup.status.map(log => 
                            `<div class="log-entry log-${log.type}">${log.message}</div>`
                        ).join('') + '</div>' : ''}
                </div>
            `).join('');
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    simulateFight(numSimulations = 5) {
        let wins = 0;
        
        for (let i = 0; i < numSimulations; i++) {
            this.resetState();
            const result = this.runSingleFight();
            if (result === 'player') wins++;
        }

        return {
            wins,
            losses: numSimulations - wins,
            winRate: (wins / numSimulations) * 100
        };
    }

    runSingleFight() {
        this.logs = []; // Clear previous logs
        this.log('Combat Started!');
        this.time = 0;
        this.isRunning = true;

        // Initialize item triggers
        this.initializeItems();

        while (this.isRunning) {
            this.processTurn(); // Process the turn directly
            this.time++;

            // Final combat state check after each turn
            if (this.playerState.hp <= 0 && this.monsterState.hp <= 0) {
                this.log("Both players have been defeated!", "state");
                console.log("Combat ended: Both players have 0 HP");
                return 'draw'; // Declare a draw if both players are defeated
            }
            if (this.playerState.hp <= 0) {
                this.log("Player has been defeated!", "state");
                console.log("Combat ended: Player HP is 0");
                return 'monster';
            }
            if (this.monsterState.hp <= 0) {
                this.log("Monster has been defeated!", "state");
                console.log("Combat ended: Monster HP is 0");
                return 'player';
            }
        }
    }

    processTurn() {
        // Start Sandstorm if time >= 30 seconds
        if (this.time >= 30 && !this.sandstormStarted) {
            this.sandstormStarted = true;
            this.sandstormDamage = 1;
            this.log("The Sandstorm has started!", "state");
        }

        // Apply Sandstorm damage once per turn
        if (this.sandstormStarted) {
            this.applySandstormDamage();
        }

        // Apply burn damage
        this.applyBurnDamage(this.playerState, 'Player');
        this.applyBurnDamage(this.monsterState, 'Monster');

        // Debugging: Log burn state
        this.log(`Player Burn State: ${JSON.stringify(this.playerState.burn)}`, 'state');
        this.log(`Monster Burn State: ${JSON.stringify(this.monsterState.burn)}`, 'state');

        // Process other turn-based mechanics
        this.processTriggers();
        this.applyDotEffects();
        this.processSpecialEffects();

        // Log final state after all effects
        this.log(`End of turn: Player - HP: ${this.playerState.hp}, Shield: ${this.playerState.shield}`, "state");
        this.log(`End of turn: Monster - HP: ${this.monsterState.hp}, Shield: ${this.monsterState.shield}`, "state");

        this.flushTimeLogs();
    }

    initializeItems() {
        [...this.playerBoard, ...this.monsterBoard.slots]
            .filter(item => item)
            .forEach((item, index) => {
                // Set first trigger time to the item's cooldown
                item.nextTrigger = item.cooldown;
                item.nextUnfreeze = null;

                // Initialize ammo only if maxAmmo is greater than 0
                if (item.maxAmmo > 0) {
                    item.ammo = item.maxAmmo;
                }

                // Add a unique instance ID combining board position and timestamp
                item.instanceId = `${item.name}_${index}_${Date.now()}`;
            });
    }

    applySandstormDamage() {
        // Calculate the total Sandstorm damage for the current second
        const startDamage = this.sandstormDamage;
        const endDamage = this.sandstormDamage + 4; // 5 triggers in 1 second
        const totalDamage = (startDamage + endDamage) * 5 / 2; // Sum of arithmetic series

        // Apply damage to the player
        const playerShieldedDamage = Math.max(0, totalDamage - this.playerState.shield);
        this.playerState.shield = Math.max(0, this.playerState.shield - totalDamage);
        this.playerState.hp -= playerShieldedDamage;

        // Apply damage to the monster
        const monsterShieldedDamage = Math.max(0, totalDamage - this.monsterState.shield);
        this.monsterState.shield = Math.max(0, this.monsterState.shield - totalDamage);
        this.monsterState.hp -= monsterShieldedDamage;

        // Log the Sandstorm damage
        this.log(`Sandstorm deals ${startDamage}+${startDamage + 1}+${startDamage + 2}+${startDamage + 3}+${startDamage + 4} = ${totalDamage} damage to both players!`, "damage");

        // Increment Sandstorm damage for the next second
        this.sandstormDamage += 5;
    }

    processTriggers() {
        // Process player items
        this.playerBoard
            .filter(item => item && !this.isItemFrozen(item))
            .forEach(item => {
                if (this.time >= item.nextTrigger) {
                    this.triggerItem(item, this.playerState, this.monsterState);
                }
            });

        // Process monster items
        this.monsterBoard.slots
            .filter(item => item && !this.isItemFrozen(item))
            .forEach(item => {
                if (this.time >= item.nextTrigger) {
                    this.triggerItem(item, this.monsterState, this.playerState);
                }
            });
    }

    triggerItem(item, sourceState, targetState) {
        const sourceName = sourceState === this.playerState ? 'Player' : 'Monster';
        const targetName = targetState === this.playerState ? 'Player' : 'Monster';

        // Check if the item has ammo and if it can trigger
        if (item.maxAmmo > 0) {
            if (item.ammo <= 0) {
                this.log(`${sourceName}'s ${item.name} cannot trigger (out of ammo).`, 'state');
                return; // Skip triggering if out of ammo
            }

            // Consume 1 ammo
            item.ammo--;
            this.log(`${sourceName}'s ${item.name} consumes 1 ammo. Remaining ammo: ${item.ammo}`, 'state');
        }

        this.log(`${sourceName}'s ${item.name} is triggering...`, 'trigger');

        // Special case: Crusher Claw
        if (item.name === "Crusher Claw") {
            const shieldBonus = this.getHighestShieldValue(sourceState === this.playerState ? this.playerBoard : this.monsterBoard.slots);
            const damage = shieldBonus * (item.shieldBonus || 1);
            targetState.hp -= damage;
            this.log(`${targetName} takes ${damage} damage from ${item.name} (based on shield bonus).`, 'damage');
            return; // Exit after handling special case
        }

        // Handle multicast
        const multicastCount = item.multicast || 1;
        for (let i = 0; i < multicastCount; i++) {
            // Apply damage
            if (item.damage) {
                let damage = item.damage;
                if (item.damageMultiplier) {
                    damage *= item.damageMultiplier;
                }
                targetState.hp -= damage;
                this.log(`${targetName} takes ${damage} damage`, 'damage');
            }

            // Apply burn
            if (item.burn) {
                const burnValue = item.burn;
                const critMultiplier = item.crit && Math.random() < item.crit ? item.critMultiplier || 2 : 1;
                const totalBurn = burnValue * critMultiplier;

                targetState.burn.value += totalBurn; // Stack burn values

                this.log(`${targetName} is burned for ${totalBurn} damage over time.`, 'effect');
            }

            // Apply shield (e.g., Sea Shell)
            if (item.shield && item.shieldAmount) {
                sourceState.shield += item.shieldAmount;
                this.log(`${sourceName} gains ${item.shieldAmount} shield from ${item.name}.`, 'shield');
            }
        }

        // Update next trigger time
        item.nextTrigger = this.time + item.cooldown;
    }

    calculateDamage(item, sourceState, targetState) {
        if (!item.damage && item.name !== "Crusher Claw") return 0;

        let damage = item.damage;

        // Apply enchantment damage multiplier first
        if (item.damageMultiplier) {
            damage *= item.damageMultiplier;
        }

        // Apply crit chance
        if (item.crit && Math.random() < item.crit) {
            // Normal items: damage * 2
            // Cutlass: damage + (damage * 2)
            const baseCritMultiplier = 2;
            const critMultiplier = item.critMultiplier || baseCritMultiplier;
            
            if (item.critMultiplier) {
                // For Cutlass: add base damage + (base damage * 2)
                damage = damage + (damage * baseCritMultiplier);
            } else {
                // For normal items: just multiply by 2
                damage *= baseCritMultiplier;
            }
            
            this.log(`Critical hit! Damage calculated as ${damage}`, 'trigger');
        }

        // Handle multicast last
        if (item.multicast && item.multicast > 1) {
            const hits = item.multicast;
            damage *= hits;
            this.log(`Multicast! Damage dealt ${hits} times for total of ${damage}`, 'trigger');
        }

        return damage;
    }

    // Helper methods
    isItemFrozen(item) {
        return item.nextUnfreeze && this.time < item.nextUnfreeze;
    }

    countAquaticItems(items) {
        return items.filter(item => item && item.type === "Aquatic").length;
    }

    getHighestShieldValue(items) {
        const shieldValues = items
            .filter(item => item && item.shield)
            .map(item => {
                const baseShield = item.shieldAmount || 0;
                const bonusShield = item.bonusShield || 0;
                return baseShield + bonusShield;
            });
        
        // Add extra logging to debug shield values
        if (shieldValues.length > 0) {
            this.log(`Shield values found: ${shieldValues.join(', ')}`, 'trigger');
        }
        
        return shieldValues.length > 0 ? Math.max(...shieldValues) : 0;
    }

    applyFreeze(targetState, item) {
        const targetItems = targetState === this.playerState ? this.playerBoard : this.monsterBoard.slots;
        const eligibleItems = targetItems.filter(i => i && (!i.nextUnfreeze || this.time >= i.nextUnfreeze));
        
        if (eligibleItems.length === 0) return;

        // Randomly select targets up to freezeTargets
        for (let i = 0; i < Math.min(item.freezeTargets || 1, eligibleItems.length); i++) {
            const randomIndex = Math.floor(Math.random() * eligibleItems.length);
            const targetItem = eligibleItems[randomIndex];
            targetItem.nextUnfreeze = this.time + (item.freezeDuration || 2);
            // Remove selected item from eligible items
            eligibleItems.splice(randomIndex, 1);
        }
    }

    applyBurnDamage(state, stateName) {
        if (state.burn.value > 0) {
            for (let i = 0; i < 2; i++) { // Burn triggers twice per t
                // Burn damage is equal to the current burn count
                const burnDamage = state.burn.value;

                // Reduce shield by burn damage
                const shieldAbsorbed = Math.min(burnDamage, state.shield);
                state.shield -= shieldAbsorbed;

                // Apply remaining burn damage to HP
                const remainingBurnDamage = burnDamage - shieldAbsorbed;
                state.hp -= remainingBurnDamage;

                // Log burn damage (include shield-absorbed damage)
                const totalDamage = shieldAbsorbed + remainingBurnDamage;
                this.log(`${stateName} takes ${totalDamage} burn damage.`, 'damage');

                // Decay burn count
                state.burn.value = Math.max(0, state.burn.value - 1);

                // Check if burn has expired
                if (state.burn.value === 0) {
                    this.log(`Burn on ${stateName} has ended.`, 'effect');
                    state.burn = { value: 0 }; // Reset burn state
                    break; // Exit early if burn has expired
                }
            }
        }
    }

    applyDotEffects() {}
    processSpecialEffects() {}
    resetState() {
        this.playerState = {
            hp: 250,
            shield: 0,
            poison: 0,
            burn: { value: 0 } // Burn state
        };

        this.monsterState = {
            hp: this.monsterBoard.health || 200,
            shield: 0,
            poison: 0,
            burn: { value: 0 } // Burn state
        };

        [...this.playerBoard, ...this.monsterBoard.slots]
            .filter(item => item)
            .forEach(item => {
                item.nextTrigger = 0;
                item.nextUnfreeze = null;

                // Reset ammo for items with maxAmmo
                if (item.maxAmmo !== undefined) {
                    item.ammo = item.maxAmmo;
                }
            });

        this.time = 0;
        this.isRunning = true;
    }

    applyShieldBonuses() {
        const allBoards = [
            { board: this.playerBoard, state: this.playerState },
            { board: this.monsterBoard.slots, state: this.monsterState }
        ];

        for (let { board } of allBoards) {
            // Find Crusher Claws
            const crusherClaws = board.filter(item => item && item.name === "Crusher Claw");
            
            if (crusherClaws.length > 0) {
                // Apply shield bonus to all shield items
                board.forEach(item => {
                    if (item && item.shield) {
                        // Add shield bonus from each Crusher Claw (cumulative)
                        const newBonus = crusherClaws.reduce((sum, claw) => sum + (claw.shieldBonus || 0), 0);
                        item.bonusShield = (item.bonusShield || 0) + newBonus;  // Add to existing bonus
                        this.log(`${item.name} gets additional +${newBonus} shield (total bonus: ${item.bonusShield})`, 'shield');
                    }
                });
            }
        }
    }

    // Add new helper method for haste
    applyHaste(sourceState, item) {
        const sourceItems = sourceState === this.playerState ? this.playerBoard : this.monsterBoard.slots;
        const eligibleItems = sourceItems.filter(i => i && i.cooldown > 0);
        
        if (eligibleItems.length === 0) return;

        for (let i = 0; i < Math.min(item.hasteTargets, eligibleItems.length); i++) {
            const randomIndex = Math.floor(Math.random() * eligibleItems.length);
            const targetItem = eligibleItems[randomIndex];
            const hasteAmount = item.hasteDuration || 1;
            
            targetItem.nextTrigger = Math.max(0, targetItem.nextTrigger - hasteAmount);
            this.log(`${targetItem.name} is hastened for ${hasteAmount} seconds!`, 'trigger');
            
            eligibleItems.splice(randomIndex, 1);
        }
    }
}

export function applyEnchantment(item, enchantmentName) {
    if (!item.enchantmentEffects || !item.enchantmentEffects[enchantmentName]) {
        return false;
    }

    // Remove the current enchantment if one exists
    if (item.enchantment) {
        removeEnchantment(item);
    }

    const enchantment = item.enchantmentEffects[enchantmentName];
    const effect = { ...enchantment.effect }; // Create a copy to modify

    // Handle percentage-based effects
    if (effect.burnPercent !== undefined) {
        const burnValue = Math.floor(item.damage * effect.burnPercent); // Correctly calculate burn value
        effect.burn = burnValue; // Assign the calculated burn value
        delete effect.burnPercent;
    }

    // Apply all remaining effects to the item
    for (const [key, value] of Object.entries(effect)) {
        item[key] = value;
    }

    item.enchantment = enchantmentName;

    // Log the applied effects for debugging
    console.log('Applied enchantment:', enchantmentName, 'to item:', item.name);
    console.log('Final item state:', item);

    return true;
}

export function removeEnchantment(item) {
    if (!item.enchantment) return false;
    
    // Store the original enchantment name for logging
    const removedEnchantment = item.enchantment;
    
    // Remove all enchantment effects
    if (item.enchantmentEffects && item.enchantmentEffects[removedEnchantment]) {
        const effects = item.enchantmentEffects[removedEnchantment].effect;
        
        // Remove original effect properties
        for (const key in effects) {
            delete item[key];
        }
        
        // Remove all possible derived properties
        const derivedProperties = [
            'poison',         // from poisonPercent
            'burn',           // from burnPercent
            'shieldAmount',   // from shield: true
            'healAmount',     // from heal: true
            'shield',         // from shield: true
            'heal',           // from heal: true
            'damageMultiplier',
            'slowTargets',
            'slowDuration',
            'freezeTargets',
            'freezeDuration',
            'hasteTargets',
            'hasteDuration',
            'crit',
            'critDamage',
            'immuneToFreeze',
            'immuneToSlow',
            'immuneToDestroy'
        ];
        
        derivedProperties.forEach(prop => {
            delete item[prop];
        });

        // Handle multicast restoration
        if (effects.multicast !== undefined) {
            item.multicast = item.baseMulticast || 0; // Restore the original multicast value
        }
    }
    
    // Remove the enchantment name last
    delete item.enchantment;
    
    // Log for debugging
    console.log('Removed enchantment:', removedEnchantment, 'from item:', item.name);
    console.log('Final item state:', item);
    
    return true;
}

