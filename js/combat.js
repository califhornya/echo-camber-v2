const TICK_RATE = 0.1; // Each tick is 0.1 seconds

function secondsToTicks(seconds) {
    return Math.round(seconds / TICK_RATE);
}

function ticksToSeconds(ticks) {
    return (ticks * TICK_RATE).toFixed(1);
}

class TickProcessor {
    constructor() {
        this.currentTick = 0;
        this.pendingEffects = new Map(); // tick -> effects[]
    }

    scheduleEffect(ticksFromNow, effect) {
        const targetTick = this.currentTick + ticksFromNow;
        if (!this.pendingEffects.has(targetTick)) {
            this.pendingEffects.set(targetTick, []);
        }
        this.pendingEffects.get(targetTick).push(effect);
    }

    processTick() {
        const effects = this.pendingEffects.get(this.currentTick) || [];
        
        // Group effects by type
        const damages = [];
        const heals = [];
        const shields = [];
        const statusEffects = [];

        // Sort effects into groups
        effects.forEach(effect => {
            switch(effect.type) {
                case 'damage': damages.push(effect); break;
                case 'heal': heals.push(effect); break;
                case 'shield': shields.push(effect); break;
                case 'status': statusEffects.push(effect); break;
            }
        });

        // Calculate net effects
        const netDamage = damages.reduce((sum, d) => sum + d.value, 0);
        const netHeal = heals.reduce((sum, h) => sum + h.value, 0);
        const netShield = shields.reduce((sum, s) => sum + s.value, 0);

        // Store the results for the combat simulator to apply
        return {
            damage: netDamage,
            heal: netHeal,
            shield: netShield,
            statusEffects
        };
    }

    getCurrentTimeInSeconds() {
        return ticksToSeconds(this.currentTick);
    }

    advance() {
        this.currentTick++;
    }

    reset() {
        this.currentTick = 0;
        this.pendingEffects.clear();
    }
}

export { TickProcessor, secondsToTicks, ticksToSeconds };

export class CombatSimulator {
    constructor(playerBoard, monsterData, playerStats) {
        this.tickProcessor = new TickProcessor();
        
        this.playerBoard = playerBoard;
        this.monsterData = monsterData;
        this.playerStats = playerStats || { health: 100, regen: 0, shield: 0 };
        
        // Initialize logging system
        this.currentTimeLogs = [];
        this.groupedLogs = [];
        
        this.playerState = {
            health: this.playerStats.health,
            maxHealth: this.playerStats.health,
            regen: this.playerStats.regen,
            shield: this.playerStats.shield, // Initialize with starting shield
            items: [],
            effects: [],
            slots: this.playerBoard,
            processedSlots: new Set()
        };
        
        this.monsterState = {
            health: monsterData.health,
            maxHealth: monsterData.health,
            regen: 0,
            shield: 0,
            items: [],
            effects: [],
            slots: monsterData.slots,
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
                !log.message.includes('End of tick')
            );
            const statusLogs = this.currentTimeLogs.filter(log => 
                log.message.includes('End of tick')
            );

            this.groupedLogs.push({
                timestamp: this.tickProcessor.getCurrentTimeInSeconds(),
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
                    <div class="log-timestamp">Time: ${timeGroup.timestamp}s</div>
                    ${timeGroup.actions.map(log => 
                        `<div class="log-entry log-${log.type}">${log.message}</div>`
                    ).join('')}
                    ${timeGroup.status.map(log => 
                        `<div class="log-status">${log.message}</div>`
                    ).join('')}
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
        this.tickProcessor.reset();
        this.isRunning = true;

        this.initializeItems();

        while (this.isRunning) {
            this.processTick();
            
            if (this.playerState.health <= 0 && this.monsterState.health <= 0) {
                this.log("Both players have been defeated!", "state");
                return 'draw';
            }
            if (this.playerState.health <= 0) {
                this.log("Player has been defeated!", "state");
                return 'monster';
            }
            if (this.monsterState.health <= 0) {
                this.log("Monster has been defeated!", "state");
                return 'player';
            }
        }
    }

    processTick() {
        const currentTime = this.tickProcessor.getCurrentTimeInSeconds();
        
        // Apply burn and poison damage first
        this.applyBurnDamage(this.playerState, 'Player');
        this.applyBurnDamage(this.monsterState, 'Monster');
        this.applyPoisonDamage(this.playerState, 'Player');
        this.applyPoisonDamage(this.monsterState, 'Monster');

        // Sandstorm check (every 0.2s = 2 ticks)
        if (currentTime >= 30 && !this.sandstormStarted) {
            this.sandstormStarted = true;
            this.sandstormDamage = 1;
            this.log("The Sandstorm has started!", "state");
        }
        
        // Apply sandstorm damage every 2 ticks (0.2 seconds)
        if (this.sandstormStarted && this.tickProcessor.currentTick % 2 === 0) {
            this.applySandstormDamage();
        }

        const tickEffects = this.tickProcessor.processTick();
        
        if (tickEffects.damage > 0) {
            this.applyDamage(this.playerState, tickEffects.damage, "Player", "Combined Effects");
            this.applyDamage(this.monsterState, tickEffects.damage, "Monster", "Combined Effects");
        }
        if (tickEffects.heal > 0) {
            this.applyHealing(this.playerState, tickEffects.heal, "Player");
            this.applyHealing(this.monsterState, tickEffects.heal, "Monster");
        }
        if (tickEffects.shield > 0) {
            this.playerState.shield += tickEffects.shield;
            this.monsterState.shield += tickEffects.shield;
        }
        
        tickEffects.statusEffects.forEach(effect => {
            switch(effect.name) {
                case 'burn':
                    this.applyBurnDamage(this.playerState, 'Player');
                    break;
                case 'poison':
                    this.applyPoisonDamage(this.playerState, 'Player');
                    break;
            }
        });

        if (this.playerState.regen > 0) {
            this.tickProcessor.scheduleEffect(secondsToTicks(1), {
                type: 'heal',
                value: this.playerState.regen,
                target: this.playerState,
                targetName: 'Player'
            });
        }
        if (this.monsterState.regen > 0) {
            this.tickProcessor.scheduleEffect(secondsToTicks(1), {
                type: 'heal',
                value: this.monsterState.regen,
                target: this.monsterState,
                targetName: 'Monster'
            });
        }

        this.processItemTriggers();

        this.log(`End of tick ${currentTime}s: Player - HP: ${this.playerState.health}, Shield: ${this.playerState.shield}, Burn: ${this.playerState.burn.value}, Poison: ${this.playerState.poison.value}, Regen: ${this.playerState.regen}`, "state");
        this.log(`End of tick ${currentTime}s: Monster - HP: ${this.monsterState.health}, Shield: ${this.monsterState.shield}, Burn: ${this.monsterState.burn.value}, Poison: ${this.monsterState.poison.value}, Regen: ${this.monsterState.regen}`, "state");

        this.flushTimeLogs();
        
        this.tickProcessor.advance();
    }

    initializeItemTiming(item) {
        // Convert cooldown to ticks for internal tracking
        const cooldown = item.cooldown || 
                        (item.tiers && item.currentTier ? item.tiers[item.currentTier].cooldown : 0);
        
        // Store both the original cooldown and tick-based cooldown
        item._originalCooldown = cooldown;
        item._cooldownTicks = secondsToTicks(cooldown);
        
        // Initialize next trigger time in ticks
        item._nextTriggerTick = item._cooldownTicks;
    }

    initializeItems() {
        const player = this.playerState;
        const monster = this.monsterState;
        
        player.processedSlots.clear();
        monster.processedSlots.clear();
        
        // Helper function to process a single item
        const processItem = (item, index, state) => {
            if (!item || state.processedSlots.has(index)) return;
            
            // Save enchantment state
            const hasEnchantment = item.enchantment;
            const enchantmentName = item.enchantment;
            
            // Apply tier properties
            if (item.tiers && item.currentTier) {
                Object.assign(item, item.tiers[item.currentTier]);
            }
            
            // Re-apply enchantment
            if (hasEnchantment) {
                applyEnchantment(item, enchantmentName);
            }
            
            // Initialize timing system
            this.initializeItemTiming(item);
            
            // Mark slots as processed
            for (let j = 0; j < item.size; j++) {
                state.processedSlots.add(index + j);
            }
        };
        
        // Process both boards
        player.slots.forEach((item, index) => processItem(item, index, player));
        monster.slots.forEach((item, index) => processItem(item, index, monster));
        
        this.log("Combat begins! Boards initialized:", 'state');
        this.logBoardState(player, "Player");
        this.logBoardState(monster, "Monster");
    }

    applySandstormDamage() {
        // Apply a single hit of sandstorm damage
        const damage = this.sandstormDamage;
        
        this.log(`Sandstorm deals ${damage} damage!`, "damage");
        
        this.applyDamage(this.playerState, damage, "Player", "Sandstorm");
        this.applyDamage(this.monsterState, damage, "Monster", "Sandstorm");
        
        // Increment damage for next hit
        this.sandstormDamage++;
    }

    processItemTriggers() {
        const currentTick = this.tickProcessor.currentTick;
        
        [...this.playerState.slots, ...this.monsterState.slots]
            .filter(item => item && !item.isNonCombat && !this.isItemFrozen(item))
            .forEach(item => {
                if (currentTick >= item._nextTriggerTick) {
                    const sourceState = this.playerState.slots.includes(item) ? this.playerState : this.monsterState;
                    const targetState = sourceState === this.playerState ? this.monsterState : this.playerState;
                    this.triggerItem(item, sourceState, targetState);
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

        if (item.maxAmmo > 0) {
            if (item.ammo <= 0) {
                this.log(`${sourceName}'s ${item.name} cannot trigger (out of ammo).`, 'state');
                return;
            }

            item.ammo--;
            this.log(`${sourceName}'s ${item.name} consumes 1 ammo. Remaining ammo: ${item.ammo}/${item.maxAmmo}`, 'state');
        }

        const enchantmentPrefix = item.enchantment ? 
            `${item.enchantmentEffects[item.enchantment].name} ` : '';
        this.log(`${sourceName}'s ${enchantmentPrefix}${item.name} is triggering...`, 'trigger');
        
        if (item.enchantment === "shiny") {
            const baseMulticast = item.baseMulticast || 1;
            if (baseMulticast > 1) {
                item.multicast = baseMulticast + 1;
            } else {
                item.multicast = 2;
            }
        }
        
        const multicastCount = item.multicast || 
                               (item.tiers && item.currentTier ? item.tiers[item.currentTier].multicast : 1) || 
                               1;
        
        if (item.name === "Infinite Potion") {
            const regenAmount = item.regenAmount || 
                                (item.tiers && item.currentTier ? item.tiers[item.currentTier].regenAmount : 1);
            sourceState.regen += regenAmount;
            this.log(`${sourceName} gains ${regenAmount} regeneration per turn.`, 'heal');
            
            item.ammo = 1;
            this.log(`${item.name} reloaded 1 ammo. New ammo: ${item.ammo}/${item.maxAmmo}`, 'state');
        } else {
            if (item.name === "Crusher Claw") {
                const highestShield = this.getHighestShieldValue(sourceBoard);
                
                this.log(`Crusher Claw found highest shield item value: ${highestShield}`, 'trigger');
                
                this.applyDamage(targetState, highestShield, targetName, item.name);
                
                const shieldBonus = item.shieldBonus || 
                                   (item.tiers && item.currentTier ? 
                                    item.tiers[item.currentTier].shieldBonus : 2);
                
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
            } else if (item.name === "Sea Shell") {
                const sourceItems = sourceState === this.playerState ? this.playerState.slots : this.monsterState.slots;
                
                const aquaticCount = this.countAquaticItems(sourceItems);
                
                const shieldPerAquatic = item.shieldPerAquatic || 
                                        (item.tiers && item.currentTier ? 
                                         item.tiers[item.currentTier].shieldPerAquatic : 5);
                
                const totalShield = aquaticCount * shieldPerAquatic;
                
                sourceState.shield += totalShield;
                this.log(`${sourceName}'s Sea Shell provides ${totalShield} shield (${aquaticCount} aquatic items × ${shieldPerAquatic} shield)`, 'shield');
            } else {
                for (let i = 0; i < multicastCount; i++) {
                    if (item.damage || (item.tiers && item.currentTier && item.tiers[item.currentTier].damage)) {
                        let damage = item.damage || item.tiers[item.currentTier].damage;
                        if (item.damageMultiplier) {
                            damage *= item.damageMultiplier;
                        }
                        
                        this.applyDamage(targetState, damage, targetName, item.name);
                    }

                    if (item.burn || (item.tiers && item.currentTier && item.tiers[item.currentTier].burn)) {
                        const burnValue = item.burn || item.tiers[item.currentTier].burn;
                        const critMultiplier = item.crit && Math.random() < item.crit ? item.critMultiplier || 2 : 1;
                        const totalBurn = burnValue * critMultiplier;

                        targetState.burn.value += totalBurn;
                        this.log(`${targetName} is burned for ${totalBurn} damage over time.`, 'burn');
                    }

                    if (item.shield || (item.tiers && item.currentTier && item.tiers[item.currentTier].shield)) {
                        let shieldAmount = item.shieldAmount || 
                                          (item.tiers && item.currentTier ? item.tiers[item.currentTier].shieldAmount : 0);

                        sourceState.shield += shieldAmount;
                        this.log(`${sourceName} gains ${shieldAmount} shield from ${item.name}.`, 'shield');
                        
                        this.applyBarbedWireEffect(sourceState === this.playerState ? this.playerState.slots : this.monsterState.slots);
                    }

                    if (item.slow || (item.tiers && item.currentTier && item.tiers[item.currentTier].slow)) {
                        const slowTargets = item.slowTargets || 1;
                        const slowDuration = item.slowDuration || 1;
                        this.log(`${targetName} is slowed for ${slowDuration} seconds.`, 'effect');
                    }
                    
                    if (item.regen || (item.tiers && item.currentTier && item.tiers[item.currentTier].regen)) {
                        const regenAmount = item.regenAmount || 
                                          (item.tiers && item.currentTier ? item.tiers[item.currentTier].regenAmount : 0);
                        
                        if (regenAmount > 0) {
                            sourceState.regen += regenAmount;
                            this.log(`${sourceName} gains ${regenAmount} regeneration per turn.`, 'heal');
                        }
                    }

                    if (item.poison || (item.tiers && item.currentTier && item.tiers[item.currentTier].poison)) {
                        const poisonValue = item.poison || 
                                          (item.tiers && item.currentTier ? item.tiers[item.currentTier].poison : 0);
                        
                        const critMultiplier = item.crit && Math.random() < item.crit ? item.critMultiplier || 2 : 1;
                        const totalPoison = poisonValue * critMultiplier;
                        
                        if (totalPoison > 0) {
                            targetState.poison.value += totalPoison;
                            this.log(`${targetName} is poisoned for ${totalPoison} damage per turn.`, 'poison');
                        }
                    }

                    if (item.name === "Junkyard Repairbot" || item.repair || item.heal || 
                        (item.tiers && item.currentTier && (item.tiers[item.currentTier].repair || item.tiers[item.currentTier].heal))) {
                        
                        const healAmount = item.healAmount || item.repairAmount || 
                                          (item.tiers && item.currentTier ? 
                                           (item.tiers[item.currentTier].healAmount || item.tiers[item.currentTier].repairAmount) : 10);
                        
                        const prevHP = sourceState.health;
                        sourceState.health = Math.min(sourceState.maxHealth, sourceState.health + healAmount);
                        const actualHeal = sourceState.health - prevHP;
                        
                        if (actualHeal === 0) {
                            this.log(`${item.name} heals for ${healAmount}, but ${sourceName} already at full HP.`, 'heal');
                        } else if (actualHeal < healAmount) {
                            this.log(`${item.name} heals ${sourceName} for ${actualHeal} (capped at max HP).`, 'heal');
                        } else {
                            this.log(`${item.name} heals ${sourceName} for ${actualHeal} HP.`, 'heal');
                        }
                    }
                }
            }
            
            if (item.passive && typeof item.passive === 'string' && item.passive.includes("Reload this") && item.name !== "Infinite Potion") {
                if (item.maxAmmo > 0) {
                    item.ammo = Math.min(item.maxAmmo, item.ammo + 1);
                    this.log(`${item.name} reloaded 1 ammo. New ammo: ${item.ammo}/${item.maxAmmo}`, 'state');
                }
            }
        }

        // At the end of the method, update the next trigger time using ticks
        const cooldown = item._originalCooldown || 
                        (item.tiers && item.currentTier ? item.tiers[item.currentTier].cooldown : 0);
        
        // Convert cooldown to ticks and add to current tick
        item._cooldownTicks = secondsToTicks(cooldown);
        item._nextTriggerTick = this.tickProcessor.currentTick + item._cooldownTicks;
        
        // Store the actual time for display purposes
        item.nextTrigger = ticksToSeconds(item._nextTriggerTick);
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
        return item._nextUnfreezeTick && this.tickProcessor.currentTick < item._nextUnfreezeTick;
    }

    countAquaticItems(items) {
        return items.filter(item => {
            if (!item) return false;
            
            const isMainTypeAquatic = item.type && item.type.toLowerCase() === "aquatic";
            const isSecondaryTypeAquatic = item.secondaryType && item.secondaryType.toLowerCase() === "aquatic";
            
            if (isMainTypeAquatic || isSecondaryTypeAquatic) {
                console.log(`Found aquatic item: ${item.name} (type: ${item.type}, secondaryType: ${item.secondaryType})`);
            }
            
            return isMainTypeAquatic || isSecondaryTypeAquatic;
        }).length;
    }

    getHighestShieldValue(items) {
        const shieldValues = items
            .filter(item => item && item.shield === true)
            .map(item => item.shieldAmount || 0);
        
        const seaShell = items.find(item => item && item.name === "Sea Shell");
        if (seaShell) {
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
        const eligibleItems = targetItems.filter(i => i && (!i._nextUnfreezeTick || this.tickProcessor.currentTick < i._nextUnfreezeTick));
        
        if (eligibleItems.length === 0) return;

        for (let i = 0; i < Math.min(item.freezeTargets || 1, eligibleItems.length); i++) {
            const randomIndex = Math.floor(Math.random() * eligibleItems.length);
            const targetItem = eligibleItems[randomIndex];
            const freezeDuration = item.freezeDuration || 2;
            targetItem._nextUnfreezeTick = this.tickProcessor.currentTick + secondsToTicks(freezeDuration);
            eligibleItems.splice(randomIndex, 1);
        }
    }

    applyBurnDamage(state, stateName) {
        if (state.burn.value <= 0) return;

        // Burn ticks every 5 ticks (0.5 seconds)
        if (this.tickProcessor.currentTick % 5 === 0) {
            const burnDamage = state.burn.value;
            const shieldAbsorbed = Math.min(burnDamage, state.shield);
            state.shield -= shieldAbsorbed;
            const remainingBurnDamage = burnDamage - shieldAbsorbed;
            state.health -= remainingBurnDamage;
            const totalDamage = shieldAbsorbed + remainingBurnDamage;
            
            const currentTime = this.tickProcessor.getCurrentTimeInSeconds();
            this.log(`${stateName} takes ${totalDamage} burn damage at ${currentTime}s.`, 'burn');
            
            // Only reduce burn value after applying damage
            state.burn.value = Math.max(0, state.burn.value - 1);
            if (state.burn.value === 0) {
                this.log(`Burn on ${stateName} has ended.`, 'effect');
            }
        }
    }

    applyPoisonDamage(state, stateName) {
        if (state.poison.value <= 0) return;

        // Poison ticks every 10 ticks (1.0 seconds)
        if (this.tickProcessor.currentTick % 10 === 0) {
            const poisonDamage = state.poison.value;
            state.health -= poisonDamage;
            this.log(`${stateName} takes ${poisonDamage} poison damage at ${this.tickProcessor.getCurrentTimeInSeconds()}s.`, 'poison');
        }
    }

    applyDotEffects() {}
    processSpecialEffects() {}
    resetState() {
        this.playerState = {
            health: this.playerStats.health,
            maxHealth: this.playerStats.health,
            regen: this.playerStats.regen,
            shield: this.playerStats.shield,
            items: [],
            effects: [],
            slots: this.playerBoard,
            processedSlots: new Set()
        };
        this.initializeStatusEffects(this.playerState);

        this.monsterState = {
            health: this.monsterData.health,
            maxHealth: this.monsterData.health,
            regen: 0,
            shield: 0,
            items: [],
            effects: [],
            slots: this.monsterData.slots,
            processedSlots: new Set()
        };
        this.initializeStatusEffects(this.monsterState);

        [...this.playerState.slots, ...this.monsterState.slots]
            .filter(item => item)
            .forEach(item => {
                item.nextTrigger = 0;
                item._nextUnfreezeTick = null;
                
                if (item.maxAmmo !== undefined) {
                    item.ammo = item.maxAmmo;
                }
                
                if (item.name === "Sea Shell") {
                    if (item.tiers && item.currentTier) {
                        item.shieldPerAquatic = item.tiers[item.currentTier].shieldPerAquatic;
                    } else {
                        item.shieldPerAquatic = 5;
                    }
                }
                
                if (item.name === "Barbed Wire") {
                    if (item.tiers && item.currentTier) {
                        item.damage = item.tiers[item.currentTier].damage;
                    }
                }
                
                if (item.tiers && item.currentTier) {
                    Object.assign(item, item.tiers[item.currentTier]);
                }
            });

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
                crusherClaws.forEach(crusherClaw => {
                    const shieldBonus = crusherClaw.shieldBonus || 
                                        (crusherClaw.tiers && crusherClaw.currentTier ? 
                                         crusherClaw.tiers[crusherClaw.currentTier].shieldBonus : 2);
                    
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

    applyBarbedWireEffect(board) {
        const barbedWires = board.filter(item => item && item.name === "Barbed Wire");
        
        if (barbedWires.length > 0) {
            barbedWires.forEach(barbedWire => {
                barbedWire._pendingDamageIncrease = (barbedWire._pendingDamageIncrease || 0) + 10;
                this.log(`Barbed Wire's damage will increase by 10 next turn. Current damage: ${barbedWire.damage}`, 'trigger');
            });
        }
    }

    applyDamage(targetState, damage, targetName, itemName) {
        this.log(`${itemName} deals ${damage} damage to ${targetName}.`, 'damage');
        
        const shieldAbsorbed = Math.min(damage, targetState.shield);
        
        targetState.shield -= shieldAbsorbed;
        
        const remainingDamage = damage - shieldAbsorbed;
        
        targetState.health -= remainingDamage;
        
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
        const regenAmount = stateName === 'Player' ? this.playerStats.regen : state.regen;
        if (regenAmount > 0 && state.health < state.maxHealth) {
            const actualRegen = Math.min(regenAmount, state.maxHealth - state.health);
            state.health += actualRegen;
            this.log(`${stateName} regenerated ${actualRegen} HP`, 'heal');
        } else if (regenAmount > 0) {
            this.log(`${stateName} regen had no effect (HP already full)`, 'heal');
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

    initializeStatusEffects(state) {
        state.burn = { 
            value: 0
        };
        state.poison = { 
            value: 0
        };
    }
}

export function applyEnchantment(item, enchantmentName) {
    if (item.enchantment) {
        removeEnchantment(item);
    }
    
    item.enchantment = enchantmentName;
    
    if (item.tiers && item.currentTier) {
        Object.assign(item, item.tiers[item.currentTier]);
    }
    
    if (!item.enchantmentEffects || !item.enchantmentEffects[enchantmentName]) {
        return;
    }
    
    if (item.multicast !== undefined && item.baseMulticast === undefined) {
        item.baseMulticast = item.multicast;
    } else if (item.baseMulticast === undefined) {
        item.baseMulticast = 1;
    }
    
    const effects = item.enchantmentEffects[enchantmentName].effect;
    
    for (const [key, value] of Object.entries(effects)) {
        if (key === 'scalingType' || key === 'scaler' || key === 'scalingValue') continue;
        
        if (key === 'damageMultiplier' && item.damage) {
        } else if (key === 'multicast') {
            item.multicast = value;
            console.log(`Applied multicast ${value} to ${item.name} (Shiny enchantment)`);
        } else if (value !== undefined) {
            item[key] = value;
        }
    }
    
    console.log(`After applying ${enchantmentName} enchantment:`, 
                {name: item.name, multicast: item.multicast, baseMulticast: item.baseMulticast});

    if (effects.scalingType && effects.scaler) {
        let baseValue = 0;
        
        if (item.tiers && item.currentTier && item.tiers[item.currentTier][effects.scaler] !== undefined) {
            baseValue = item.tiers[item.currentTier][effects.scaler];
        } 
        else if (item[effects.scaler] !== undefined) {
            baseValue = item[effects.scaler];
        }
        
        let scaledValue = 0;
        
        if (effects.scalingType === 'equal') {
            scaledValue = baseValue;
        } else if (effects.scalingType === 'percentage' && effects.scalingValue) {
            scaledValue = baseValue * effects.scalingValue;
        } else if (effects.scalingType === 'multiplier' && effects.scalingValue) {
            scaledValue = baseValue * effects.scalingValue;
        }
        
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

