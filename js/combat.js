export class CombatSimulator {
    constructor(playerBoard, monsterData) {
        this.time = 0;
        this.currentTime = 0;
        
        // Initialize log collections
        this.logs = [];
        this.currentTimeLogs = [];
        this.groupedLogs = [];
        
        this.playerState = {
            hp: 100,
            maxHp: 100,
            shield: 0,
            regen: { value: 0 },
            burn: { value: 0 },
            poison: { value: 0 },
            slots: playerBoard.filter(Boolean),
            processedSlots: new Set()
        };
        
        // Add a direct reference to playerBoard for compatibility
        this.playerBoard = playerBoard.filter(Boolean);
        
        this.monsterState = {
            hp: monsterData.health,
            maxHp: monsterData.health,
            shield: 0,
            regen: { value: 0 },
            burn: { value: 0 },
            poison: { value: 0 },
            slots: monsterData.slots.filter(Boolean),
            processedSlots: new Set()
        };
        
        // Add reference to monsterBoard for compatibility
        this.monsterBoard = monsterData;
        
        this.timeMarkers = new Set();
        this.sandstormStarted = false;
        this.sandstormDamage = 0;
        this.isRunning = false;
    }

    log(message, type = 'default') {
        this.currentTimeLogs.push({ message, type });
    }

    flushTimeLogs() {
        if (this.currentTimeLogs.length > 0) {
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
            this.currentTimeLogs = [];
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
        this.logs = [];
        this.log('Combat Started!');
        this.time = 0;
        this.currentTime = 0;
        this.isRunning = true;

        this.initializeItems();

        while (this.isRunning) {
            this.processTurn();
            this.time++;
            this.currentTime++;

            if (this.playerState.hp <= 0 && this.monsterState.hp <= 0) {
                this.log("Both players have been defeated!", "state");
                return 'draw';
            }
            if (this.playerState.hp <= 0) {
                this.log("Player has been defeated!", "state");
                return 'monster';
            }
            if (this.monsterState.hp <= 0) {
                this.log("Monster has been defeated!", "state");
                return 'player';
            }
        }
    }

    processTurn() {
        // Apply any pending damage increases to Barbed Wire
        [...this.playerState.slots, ...this.monsterState.slots]
            .filter(item => item && item.name === "Barbed Wire" && item._pendingDamageIncrease)
            .forEach(item => {
                item.damage += item._pendingDamageIncrease;
                this.log(`Barbed Wire's damage increased by ${item._pendingDamageIncrease}. New damage: ${item.damage}`, 'trigger');
                item._pendingDamageIncrease = 0;
            });

        if (this.currentTime >= 30 && !this.sandstormStarted) {
            this.sandstormStarted = true;
            this.sandstormDamage = 1;
            this.log("The Sandstorm has started!", "state");
        }

        if (this.sandstormStarted) {
            this.applySandstormDamage();
        }
               
    
        this.applyBurnDamage(this.playerState, 'Player');
        this.applyBurnDamage(this.monsterState, 'Monster');

        this.applyRegeneration(this.playerState, 'Player');
        this.applyRegeneration(this.monsterState, 'Monster');

        this.applyPoisonDamage(this.playerState, 'Player');
        this.applyPoisonDamage(this.monsterState, 'Monster');

        this.processTriggers();
        this.applyDotEffects();
        this.processSpecialEffects();

        this.log(`End of turn: Player - HP: ${this.playerState.hp}, Shield: ${this.playerState.shield}, Burn: ${this.playerState.burn.value}, Poison: ${this.playerState.poison.value}, Regen: ${this.playerState.regen.value}`, "state");
        this.log(`End of turn: Monster - HP: ${this.monsterState.hp}, Shield: ${this.monsterState.shield}, Burn: ${this.monsterState.burn.value}, Poison: ${this.monsterState.poison.value}, Regen: ${this.monsterState.regen.value}`, "state");

        this.flushTimeLogs();
    }

    initializeItems() {
        const player = this.playerState;
        const monster = this.monsterState;
        
        // Clear processed slots to ensure ALL items get initialized
        player.processedSlots.clear();
        monster.processedSlots.clear();
        
        // Process all player items directly
        player.slots.forEach((item, index) => {
            if (item && !player.processedSlots.has(index)) {
                // Save enchantment state before applying tier properties
                const hasEnchantment = item.enchantment;
                const enchantmentName = item.enchantment;
                
                // For tiered items, ensure properties are copied from the tier
                if (item.tiers && item.currentTier) {
                    Object.assign(item, item.tiers[item.currentTier]);
                }
                
                // Re-apply enchantment if it was present
                if (hasEnchantment) {
                    applyEnchantment(item, enchantmentName);
                }
                
                // Set initial trigger time based on cooldown
                item.nextTrigger = item.cooldown;
                
                // Mark all slots this item occupies as processed
                for (let j = 0; j < item.size; j++) {
                    player.processedSlots.add(index + j);
                }
            }
        });
        
        // Similar process for monster items
        monster.slots.forEach((item, index) => {
            if (item && !monster.processedSlots.has(index)) {
                // Save enchantment state before applying tier properties
                const hasEnchantment = item.enchantment;
                const enchantmentName = item.enchantment;
                
                // For tiered items, ensure properties are copied from the tier
                if (item.tiers && item.currentTier) {
                    Object.assign(item, item.tiers[item.currentTier]);
                }
                
                // Re-apply enchantment if it was present
                if (hasEnchantment) {
                    applyEnchantment(item, enchantmentName);
                }
                
                // Set initial trigger time based on cooldown
                item.nextTrigger = item.cooldown;
                
                // Mark all slots this item occupies as processed
                for (let j = 0; j < item.size; j++) {
                    monster.processedSlots.add(index + j);
                }
            }
        });
        
        this.log("Combat begins! Boards initialized:", 'state');
        this.logBoardState(player, "Player");
        this.logBoardState(monster, "Monster");
    }

    applySandstormDamage() {
        const startDamage = this.sandstormDamage;
        const endDamage = this.sandstormDamage + 4;
        const totalDamage = (startDamage + endDamage) * 5 / 2;
        
        this.log(`Sandstorm deals ${startDamage}+${startDamage + 1}+${startDamage + 2}+${startDamage + 3}+${startDamage + 4} = ${totalDamage} damage!`, "damage");
        
        // Apply sandstorm damage to player
        this.applyDamage(this.playerState, totalDamage, "Player", "Sandstorm");
        
        // Apply sandstorm damage to monster
        this.applyDamage(this.monsterState, totalDamage, "Monster", "Sandstorm");
        
        this.sandstormDamage += 5;
    }

    processTriggers() {
        // Skip all triggers at time 0 (first turn)
        if (this.time === 0) {
            this.log("Combat initializing - no triggers on first turn", 'state');
            return;
        }

        // First, scan for any items that don't have a proper nextTrigger set
        this.playerState.slots.concat(this.monsterState.slots)
            .filter(item => item && item.nextTrigger === 0)
            .forEach(item => {
                // For Sea Shell, set a specific cooldown
                if (item.name === "Sea Shell") {
                    item.cooldown = 6;
                    item.nextTrigger = 6;
                } else {
                    // For other items, default to a cooldown of at least 1
                    item.cooldown = item.cooldown || 1;
                    item.nextTrigger = item.cooldown;
                }
            });

        // Process player triggers
        this.playerState.slots
            .filter(item => item && !item.isNonCombat && !this.isItemFrozen(item))
            .forEach(item => {
                if (this.time >= item.nextTrigger) {
                    this.triggerItem(item, this.playerState, this.monsterState);
                }
            });

        // Process monster triggers
        this.monsterState.slots
            .filter(item => item && !item.isNonCombat && !this.isItemFrozen(item))
            .forEach(item => {
                if (this.time >= item.nextTrigger) {
                    this.triggerItem(item, this.monsterState, this.playerState);
                }
            });
    }

    triggerItem(item, sourceState, targetState) {
        if (item.isNonCombat) {
            return;
        }

        const sourceName = sourceState === this.playerState ? 'Player' : 'Monster';
        const targetName = targetState === this.playerState ? 'Player' : 'Monster';
        const sourceBoard = sourceState === this.playerState ? this.playerState.slots : this.monsterState.slots;

        // Handle ammo
        if (item.maxAmmo > 0) {
            if (item.ammo <= 0) {
                this.log(`${sourceName}'s ${item.name} cannot trigger (out of ammo).`, 'state');
                return;
            }

            item.ammo--;
            this.log(`${sourceName}'s ${item.name} consumes 1 ammo. Remaining ammo: ${item.ammo}`, 'state');
        }

        // Include enchantment in the log message
        const enchantmentPrefix = item.enchantment ? 
            `${item.enchantmentEffects[item.enchantment].name} ` : '';
        this.log(`${sourceName}'s ${enchantmentPrefix}${item.name} is triggering...`, 'trigger');
        
        // Fix for Shiny enchantment - ensure multicast is applied correctly (no log output)
        if (item.enchantment === "shiny") {
            // Check if item already had multicast property from its base stats
            const baseMulticast = item.baseMulticast || 1;
            
            // For items that already have multicast, add 1
            // For normal items, set to 2
            if (baseMulticast > 1) {
                item.multicast = baseMulticast + 1;
            } else {
                item.multicast = 2;
            }
        }
        
        // Get multicast from the current tier if available
        const multicastCount = item.multicast || 
                              (item.tiers && item.currentTier ? item.tiers[item.currentTier].multicast : 1) || 
                              1;
        
        // Special case for Crusher Claw
        if (item.name === "Crusher Claw") {
            // Get highest shield *ITEM* value first (not total shield)
            const highestShield = this.getHighestShieldValue(sourceBoard);
            
            // Debugging message to verify the correct value
            this.log(`Crusher Claw found highest shield item value: ${highestShield}`, 'trigger');
            
            // Deal damage based on that value
            this.applyDamage(targetState, highestShield, targetName, item.name);
            
            // After dealing damage, apply shield bonus
            const shieldBonus = item.shieldBonus || 
                               (item.tiers && item.currentTier ? 
                                item.tiers[item.currentTier].shieldBonus : 2);
            
            // Apply the bonus to shield items
            sourceBoard.forEach(boardItem => {
                if (boardItem && (boardItem.shield === true || boardItem.name === "Sea Shell")) {
                    if (boardItem.name === "Sea Shell") {
                        const currentPerAquatic = boardItem.shieldPerAquatic || 
                                                 (boardItem.tiers && boardItem.currentTier ? 
                                                  boardItem.tiers[boardItem.currentTier].shieldPerAquatic : 5);
                        boardItem.shieldPerAquatic = currentPerAquatic + shieldBonus;
                        this.log(`${sourceName}'s Sea Shell now provides ${boardItem.shieldPerAquatic} shield per aquatic item`, 'shield');
                    } else {
                        boardItem.shieldAmount = (boardItem.shieldAmount || 0) + shieldBonus;
                        this.log(`${sourceName}'s ${boardItem.name} gains +${shieldBonus} shield from Crusher Claw`, 'shield');
                    }
                }
            });
            
            const cooldown = item.cooldown || 9;
            item.nextTrigger = this.currentTime + cooldown;
            return;
        }
        
        // Special case for Sea Shell
        if (item.name === "Sea Shell") {
            const sourceItems = sourceState === this.playerState ? this.playerState.slots : this.monsterState.slots;
            
            const aquaticCount = this.countAquaticItems(sourceItems);
            
            // Use the potentially buffed shieldPerAquatic value
            const shieldPerAquatic = item.shieldPerAquatic || 
                                    (item.tiers && item.currentTier ? 
                                     item.tiers[item.currentTier].shieldPerAquatic : 5);
            
            const totalShield = aquaticCount * shieldPerAquatic;
            
            sourceState.shield += totalShield;
            this.log(`${sourceName}'s Sea Shell provides ${totalShield} shield (${aquaticCount} aquatic items × ${shieldPerAquatic} shield)`, 'shield');
            
            // Update nextTrigger before returning
            const cooldown = item.cooldown || 6;
            item.nextTrigger = this.currentTime + cooldown;
            return;
        }

        // For each multicast, apply the effects separately but with less verbosity
        for (let i = 0; i < multicastCount; i++) {
            // Removed verbose multicast logging here
            
            // Get damage from the current tier if available
            if (item.damage || (item.tiers && item.currentTier && item.tiers[item.currentTier].damage)) {
                let damage = item.damage || item.tiers[item.currentTier].damage;
                if (item.damageMultiplier) {
                    damage *= item.damageMultiplier;
                }
                
                // Apply damage with shield mitigation
                this.applyDamage(targetState, damage, targetName, item.name);
            }

            // Get burn from the current tier if available
            if (item.burn || (item.tiers && item.currentTier && item.tiers[item.currentTier].burn)) {
                const burnValue = item.burn || item.tiers[item.currentTier].burn;
                const critMultiplier = item.crit && Math.random() < item.crit ? item.critMultiplier || 2 : 1;
                const totalBurn = burnValue * critMultiplier;

                targetState.burn.value += totalBurn;
                this.log(`${targetName} is burned for ${totalBurn} damage over time (cast #${i+1}).`, 'burn');
            }

            // Handle shield effects
            if (item.shield || (item.tiers && item.currentTier && item.tiers[item.currentTier].shield)) {
                let shieldAmount = item.shieldAmount || 
                                  (item.tiers && item.currentTier ? item.tiers[item.currentTier].shieldAmount : 0);

                if (item.enchantment && item.scalingType && item.scaler) {
                    const scalerValue = item[item.scaler] || 
                                       (item.tiers && item.currentTier ? item.tiers[item.currentTier][item.scaler] : 0);
                                        
                    if (item.scalingType === "percentage") {
                        shieldAmount = Math.floor(scalerValue * item.scalingValue);
                    } else if (item.scalingType === "multiplier") {
                        shieldAmount = scalerValue * item.scalingValue;
                    } else if (item.scalingType === "equal") {
                        shieldAmount = scalerValue;
                    }
                }

                sourceState.shield += shieldAmount;
                this.log(`${sourceName} gains ${shieldAmount} shield from ${item.name}.`, 'shield');
                
                // Trigger Barbed Wire effect when shield is applied
                this.applyBarbedWireEffect(sourceState === this.playerState ? this.playerState.slots : this.monsterState.slots);
            }

            // Handle other effects similarly...
            
            // And now handle slow and regen which are in our Incense example
            if (item.slow || (item.tiers && item.currentTier && item.tiers[item.currentTier].slow)) {
                const slowTargets = item.slowTargets || 
                                   (item.tiers && item.currentTier ? item.tiers[item.currentTier].slowTargets : 1);
                const slowDuration = item.slowDuration || 
                                    (item.tiers && item.currentTier ? item.tiers[item.currentTier].slowDuration : 1);
                
                // Apply slow effect logic here
                this.log(`${targetName} is slowed for ${slowDuration} seconds.`, 'effect');
            }
            
            if (item.regen || (item.tiers && item.currentTier && item.tiers[item.currentTier].regen)) {
                const regenAmount = item.regenAmount || 
                                  (item.tiers && item.currentTier ? item.tiers[item.currentTier].regenAmount : 0);
                
                if (regenAmount > 0) {
                    sourceState.regen.value += regenAmount;
                    this.log(`${sourceName} gains ${regenAmount} regeneration per turn.`, 'heal');
                }
            }

            // Handle poison effects
            if (item.poison || (item.tiers && item.currentTier && item.tiers[item.currentTier].poison)) {
                const poisonValue = item.poison || 
                                  (item.tiers && item.currentTier ? item.tiers[item.currentTier].poison : 0);
                
                // Apply crit multiplier if applicable
                const critMultiplier = item.crit && Math.random() < item.crit ? item.critMultiplier || 2 : 1;
                const totalPoison = poisonValue * critMultiplier;
                
                if (totalPoison > 0) {
                    targetState.poison.value += totalPoison;
                    this.log(`${targetName} is poisoned for ${totalPoison} damage per turn.`, 'poison');
                }
            }

            // Handle repair/healing effects
            if (item.name === "Junkyard Repairbot" || item.repair || item.heal || 
                (item.tiers && item.currentTier && (item.tiers[item.currentTier].repair || item.tiers[item.currentTier].heal))) {
                
                const healAmount = item.healAmount || item.repairAmount || 
                                  (item.tiers && item.currentTier ? 
                                   (item.tiers[item.currentTier].healAmount || item.tiers[item.currentTier].repairAmount) : 10);
                
                // Apply healing to source (the robot's owner)
                const prevHP = sourceState.hp;
                sourceState.hp = Math.min(sourceState.maxHp, sourceState.hp + healAmount);
                const actualHeal = sourceState.hp - prevHP;
                
                if (actualHeal === 0) {
                    this.log(`${item.name} heals for ${healAmount}, but ${sourceName} already at full HP.`, 'heal');
                } else if (actualHeal < healAmount) {
                    this.log(`${item.name} heals ${sourceName} for ${actualHeal} (capped at max HP).`, 'heal');
                } else {
                    this.log(`${item.name} heals ${sourceName} for ${actualHeal} HP.`, 'heal');
                }
            }
        }

        // Update the cooldown based on the current tier
        const cooldown = item.cooldown || 
                        (item.tiers && item.currentTier ? item.tiers[item.currentTier].cooldown : 0);
        item.nextTrigger = this.currentTime + cooldown;
    }

    calculateDamage(item, sourceState, targetState) {
        if (!item.damage && item.name !== "Crusher Claw") return 0;

        let damage = item.damage;

        if (item.damageMultiplier) {
            damage *= item.damageMultiplier;
        }

        if (item.crit && Math.random() < item.crit) {
            const baseCritMultiplier = 2;
            const critMultiplier = item.critMultiplier || baseCritMultiplier;
            
            if (item.critMultiplier) {
                damage = damage + (damage * baseCritMultiplier);
            } else {
                damage *= baseCritMultiplier;
            }
            
            this.log(`Critical hit! Damage calculated as ${damage}`, 'trigger');
        }

        if (item.multicast && item.multicast > 1) {
            const hits = item.multicast;
            damage *= hits;
            this.log(`Multicast! Damage dealt ${hits} times for total of ${damage}`, 'trigger');
        }

        return damage;
    }

    isItemFrozen(item) {
        return item.nextUnfreeze && this.time < item.nextUnfreeze;
    }

    countAquaticItems(items) {
        return items.filter(item => {
            if (!item) return false;
            
            // Check both type and secondaryType fields
            const isMainTypeAquatic = item.type && item.type.toLowerCase() === "aquatic";
            const isSecondaryTypeAquatic = item.secondaryType && item.secondaryType.toLowerCase() === "aquatic";
            
            // For debugging, log information about aquatic items
            if (isMainTypeAquatic || isSecondaryTypeAquatic) {
                console.log(`Found aquatic item: ${item.name} (type: ${item.type}, secondaryType: ${item.secondaryType})`);
            }
            
            return isMainTypeAquatic || isSecondaryTypeAquatic;
        }).length;
    }

    getHighestShieldValue(items) {
        // Look only at shield items' base values
        const shieldValues = items
            .filter(item => item && item.shield === true)
            .map(item => item.shieldAmount || 0);
        
        // Special case for Sea Shell - add it separately since it's not a standard shield item
        const seaShell = items.find(item => item && item.name === "Sea Shell");
        if (seaShell) {
            // For Sea Shell, use the current tier's base shieldPerAquatic value
            const baseValue = seaShell.shieldPerAquatic || 
                             (seaShell.tiers && seaShell.currentTier ? 
                              seaShell.tiers[seaShell.currentTier].shieldPerAquatic : 5);
            shieldValues.push(baseValue);
        }
        
        if (shieldValues.length > 0) {
            this.log(`Shield base values found: ${shieldValues.join(', ')}`, 'trigger');
        }
        
        return shieldValues.length > 0 ? Math.max(...shieldValues) : 0;
    }

    applyFreeze(targetState, item) {
        const targetItems = targetState === this.playerState ? this.playerState.slots : this.monsterState.slots;
        const eligibleItems = targetItems.filter(i => i && (!i.nextUnfreeze || this.time < i.nextUnfreeze));
        
        if (eligibleItems.length === 0) return;

        for (let i = 0; i < Math.min(item.freezeTargets || 1, eligibleItems.length); i++) {
            const randomIndex = Math.floor(Math.random() * eligibleItems.length);
            const targetItem = eligibleItems[randomIndex];
            targetItem.nextUnfreeze = this.time + (item.freezeDuration || 2);
            eligibleItems.splice(randomIndex, 1);
        }
    }

    applyBurnDamage(state, stateName) {
        if (state.burn.value > 0) {
            for (let i = 0; i < 2; i++) {
                const burnDamage = state.burn.value;
                const shieldAbsorbed = Math.min(burnDamage, state.shield);
                state.shield -= shieldAbsorbed;
                const remainingBurnDamage = burnDamage - shieldAbsorbed;
                state.hp -= remainingBurnDamage;
                const totalDamage = shieldAbsorbed + remainingBurnDamage;
                this.log(`${stateName} takes ${totalDamage} burn damage.`, 'burn');
                
                state.burn.value = Math.max(0, state.burn.value - 1);
                if (state.burn.value === 0) {
                    this.log(`Burn on ${stateName} has ended.`, 'effect');
                    state.burn = { value: 0 };
                    break;
                }
            }
        }
    }

    applyPoisonDamage(state, stateName) {
        if (state.poison.value > 0) {
            const poisonDamage = state.poison.value;
            state.hp -= poisonDamage;
            this.log(`${stateName} takes ${poisonDamage} poison damage`, 'poison');
        }
    }

    applyDotEffects() {}
    processSpecialEffects() {}
    resetState() {
        this.playerState = {
            hp: 250,
            maxHp: 250,
            shield: 0,
            poison: { value: 0 },
            burn: { value: 0 },
            regen: { value: 0 },
            slots: this.playerState.slots,
            processedSlots: this.playerState.processedSlots
        };

        this.monsterState = {
            hp: this.monsterState.maxHp,
            maxHp: this.monsterState.maxHp,
            shield: 0,
            poison: { value: 0 },
            burn: { value: 0 },
            regen: { value: 0 },
            slots: this.monsterState.slots,
            processedSlots: this.monsterState.processedSlots
        };

        // Fully reset all items to their original state
        [...this.playerState.slots, ...this.monsterState.slots]
            .filter(item => item)
            .forEach(item => {
                // Reset basic trigger properties
                item.nextTrigger = 0;
                item.nextUnfreeze = null;
                
                // Reset ammo
                if (item.maxAmmo !== undefined) {
                    item.ammo = item.maxAmmo;
                }
                
                // Special case for Sea Shell - reset shieldPerAquatic
                if (item.name === "Sea Shell") {
                    if (item.tiers && item.currentTier) {
                        item.shieldPerAquatic = item.tiers[item.currentTier].shieldPerAquatic;
                    } else {
                        item.shieldPerAquatic = 5; // Default value if no tier info
                    }
                }
                
                // Special case for Barbed Wire - reset damage
                if (item.name === "Barbed Wire") {
                    if (item.tiers && item.currentTier) {
                        item.damage = item.tiers[item.currentTier].damage;
                    }
                }
                
                // For all items, re-apply tier properties to ensure clean state
                if (item.tiers && item.currentTier) {
                    Object.assign(item, item.tiers[item.currentTier]);
                }
            });

        this.time = 0;
        this.currentTime = 0;
        this.isRunning = true;
    }

    applyShieldBonuses() {
        const allBoards = [
            { name: "Player", board: this.playerState.slots, state: this.playerState },
            { name: "Monster", board: this.monsterState.slots, state: this.monsterState }
        ];

        for (let { name, board } of allBoards) {
            const crusherClaws = board.filter(item => item && item.name === "Crusher Claw");
            
            if (crusherClaws.length > 0) {
                // Process each crusher claw
                crusherClaws.forEach(crusherClaw => {
                    const shieldBonus = crusherClaw.shieldBonus || 
                                        (crusherClaw.tiers && crusherClaw.currentTier ? 
                                         crusherClaw.tiers[crusherClaw.currentTier].shieldBonus : 2);
                    
                    // Apply bonus to all shield items on the same board
                    board.forEach(item => {
                        if (item && item.shield) {
                            item.bonusShield = (item.bonusShield || 0) + shieldBonus;
                            this.log(`${name}'s ${item.name} gets additional +${shieldBonus} shield from Crusher Claw`, 'shield');
                        }
                    });
                });
            }
        }
    }

    applyHaste(sourceState, item) {
        const sourceItems = sourceState === this.playerState ? this.playerState.slots : this.monsterState.slots;
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

    // Add a new method to handle Barbed Wire's special ability
    applyBarbedWireEffect(board) {
        const barbedWires = board.filter(item => item && item.name === "Barbed Wire");
        
        if (barbedWires.length > 0) {
            barbedWires.forEach(barbedWire => {
                // Instead of immediately increasing damage, schedule the increase for next turn
                barbedWire._pendingDamageIncrease = (barbedWire._pendingDamageIncrease || 0) + 10;
                this.log(`Barbed Wire's damage will increase by 10 next turn. Current damage: ${barbedWire.damage}`, 'trigger');
            });
        }
    }

    // New method to apply damage with shield mitigation
    applyDamage(targetState, damage, targetName, itemName) {
        // Log the total damage first
        this.log(`${itemName} deals ${damage} damage to ${targetName}.`, 'damage');
        
        // Check how much damage can be absorbed by the shield
        const shieldAbsorbed = Math.min(damage, targetState.shield);
        
        // Reduce shield by the amount of damage it absorbed
        targetState.shield -= shieldAbsorbed;
        
        // Calculate the remaining damage that will affect HP
        const remainingDamage = damage - shieldAbsorbed;
        
        // Apply the remaining damage to HP
        targetState.hp -= remainingDamage;
        
        // Log the shield absorption and damage
        if (shieldAbsorbed > 0) {
            this.log(`${targetName}'s shield absorbs ${shieldAbsorbed} damage from ${itemName}.`, 'shield');
        }
        
        if (remainingDamage > 0) {
            this.log(`${targetName} takes ${remainingDamage} damage from ${itemName}.`, 'damage');
        } else {
            this.log(`${targetName}'s shield completely blocks the damage!`, 'shield');
        }
    }

    applyRegeneration(state, stateName) {
        if (state.regen.value > 0) {
            // Calculate healing amount within maxHp cap
            const missingHp = state.maxHp - state.hp;
            const healAmount = Math.min(state.regen.value, missingHp);
            
            if (healAmount > 0) {
                state.hp += healAmount;
                this.log(`${stateName} regenerates ${healAmount} HP.`, 'heal');
            } else if (state.regen.value > 0) {
                this.log(`${stateName} is already at full health (regeneration wasted).`, 'heal');
            }
        }
    }

    logBoardState(state, stateName) {
        const itemNames = state.slots
            .filter(Boolean)
            .map(item => `${item.name}${item.enchantment ? ` (${item.enchantmentEffects[item.enchantment].name})` : ''}`);
        
        if (itemNames.length > 0) {
            this.log(`${stateName} Board: ${itemNames.join(', ')}`, 'state');
        } else {
            this.log(`${stateName} Board: Empty`, 'state');
        }
    }
}

export function applyEnchantment(item, enchantmentName) {
    // If item already has an enchantment, remove it first
    if (item.enchantment) {
        removeEnchantment(item);
    }
    
    // Save the new enchantment name
    item.enchantment = enchantmentName;
    
    // If this item has tiered properties, make sure root-level properties exist
    if (item.tiers && item.currentTier) {
        // Copy tier properties to root level before applying enchantment effects
        Object.assign(item, item.tiers[item.currentTier]);
    }
    
    // If the item doesn't have enchantment effects or the requested one, return
    if (!item.enchantmentEffects || !item.enchantmentEffects[enchantmentName]) {
        return;
    }
    
    // Save the original multicast value if it exists
    if (item.multicast !== undefined && item.baseMulticast === undefined) {
        item.baseMulticast = item.multicast;
    } else if (item.baseMulticast === undefined) {
        item.baseMulticast = 1; // Default value if none exists
    }
    
    // Apply enchantment effects to the item
    const effects = item.enchantmentEffects[enchantmentName].effect;
    
    // Apply each effect to the item
    for (const [key, value] of Object.entries(effects)) {
        // Skip 'scaling' and 'scaler' which are metadata, not actual effects
        if (key === 'scalingType' || key === 'scaler' || key === 'scalingValue') continue;
        
        // Apply the effect value to the item
        if (key === 'damageMultiplier' && item.damage) {
            // Don't replace damage, multiply it
            // We don't modify the original value to avoid compounding multipliers
        } else if (key === 'multicast') {
            // Special handling for multicast to ensure it's applied correctly
            item.multicast = value;
            console.log(`Applied multicast ${value} to ${item.name} (Shiny enchantment)`);
        } else if (value !== undefined) {
            item[key] = value;
        }
    }
    
    // Log the resulting item state for debugging
    console.log(`After applying ${enchantmentName} enchantment:`, 
                {name: item.name, multicast: item.multicast, baseMulticast: item.baseMulticast});

    // Handle scaling effects if present
    if (effects.scalingType && effects.scaler) {
        // Get the base value for scaling
        let baseValue = 0;
        
        // First check if the scaling value exists on the item's tier
        if (item.tiers && item.currentTier && item.tiers[item.currentTier][effects.scaler] !== undefined) {
            baseValue = item.tiers[item.currentTier][effects.scaler];
        } 
        // Then check if it exists directly on the item
        else if (item[effects.scaler] !== undefined) {
            baseValue = item[effects.scaler];
        }
        
        // Calculate scaled value based on scaling type
        let scaledValue = 0;
        
        if (effects.scalingType === 'equal') {
            scaledValue = baseValue;
        } else if (effects.scalingType === 'percentage' && effects.scalingValue) {
            scaledValue = baseValue * effects.scalingValue;
        } else if (effects.scalingType === 'multiplier' && effects.scalingValue) {
            scaledValue = baseValue * effects.scalingValue;
        }
        
        // Apply scaled value to the target property
        // First identify what property we're scaling to
        for (const [key, value] of Object.entries(effects)) {
            if (value === 0 && key !== 'scalingType' && key !== 'scaler' && key !== 'scalingValue') {
                item[key] = scaledValue;
                break;
            }
        }
    }
}

export function removeEnchantment(item) {
    if (!item.enchantment) return false;
    
    const removedEnchantment = item.enchantment;
    
    if (item.enchantmentEffects && item.enchantmentEffects[removedEnchantment]) {
        const effects = item.enchantmentEffects[removedEnchantment].effect;
        
        for (const key in effects) {
            delete item[key];
        }
        
        const derivedProperties = [
            'poison',
            'burn',
            'shieldAmount',
            'healAmount',
            'shield',
            'heal',
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

        if (effects.multicast !== undefined) {
            item.multicast = item.baseMulticast || 0;
        }
    }
    
    delete item.enchantment;
    
    console.log('Removed enchantment:', removedEnchantment, 'from item:', item.name);
    console.log('Final item state:', item);
    
    return true;
}

