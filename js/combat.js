import { cloneDeep, countAquaticItems, getHighestShieldValue } from './utils.js';

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
        // Skip logging "out of ammo" messages
        if (message.includes('cannot trigger (out of ammo)')) {
            return;
        }
        
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
        
        // Filter out timestamps with no actions
        const significantLogs = this.groupedLogs.filter(timeGroup => 
            timeGroup.actions.length > 0
        );
        
        logContainer.innerHTML = significantLogs
            .map(timeGroup => {
                // Get the status logs that show HP/Shield/etc.
                const statsLogs = timeGroup.status.filter(log => 
                    log.message.includes('HP:') || 
                    log.message.includes('Shield:')
                );
                
                return `
                    <div class="log-group">
                        <div class="log-timestamp">Time: ${timeGroup.timestamp}s</div>
                        ${timeGroup.actions.map(log => 
                            `<div class="log-entry log-${log.type}">${log.message}</div>`
                        ).join('')}
                        ${statsLogs.map(log => 
                            `<div class="log-status">${log.message}</div>`
                        ).join('')}
                    </div>
                `;
            }).join('');
        
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
            .filter(item => item && !item.isNonCombat)
            .forEach(item => {
                if (currentTick >= item._nextTriggerTick && !this.isItemFrozen(item)) {
                    // Check if the item is in player's slots by checking each slot
                    const isPlayerItem = this.playerState.slots.some(slot => slot === item);
                    const sourceState = isPlayerItem ? this.playerState : this.monsterState;
                    const targetState = isPlayerItem ? this.monsterState : this.playerState;
                    this.triggerItem(item, sourceState, targetState);
                }
            });
    }

    triggerItem(item, sourceState, targetState) {
        if (item.isNonCombat) return;

        const sourceName = sourceState === this.playerState ? 'Player' : 'Monster';
        const targetName = targetState === this.playerState ? 'Player' : 'Monster';
        const sourceBoard = sourceState === this.playerState ? this.playerState.slots : this.monsterState.slots;

        // Handle ammo consumption first
        if (item.maxAmmo > 0) {
            if (item.ammo <= 0) {
                this.log(`${sourceName}'s ${item.name} cannot trigger (out of ammo).`, 'state');
                return;
            }
            item.ammo--;
            this.log(`${sourceName}'s ${item.name} consumes 1 ammo. Remaining ammo: ${item.ammo}/${item.maxAmmo}`, 'state');
        }

        // Debug check
        if (item.name === "Sea Shell") {
            console.log("Sea Shell trigger check:", {
                hasPreTrigger: typeof item.onPreTrigger === 'function',
                hasTrigger: typeof item.onTrigger === 'function',
                itemContext: item,
                methods: Object.getOwnPropertyNames(item)
            });
        }

        // Pre-trigger phase
        if (item.onPreTrigger) {
            item.onPreTrigger(this, sourceState, targetState);
        }

        // Main trigger phase
        const enchantmentPrefix = item.enchantment ? 
            `${item.enchantmentEffects[item.enchantment].name} ` : '';
        this.log(`${sourceName}'s ${enchantmentPrefix}${item.name} is triggering...`, 'trigger');

        if (item.onTrigger) {
            item.onTrigger(this, sourceState, targetState);
        } else {
            // Handle default item behaviors (damage, healing, etc.)
            this.handleDefaultItemEffects(item, sourceState, targetState);
        }

        // Post-trigger phase
        if (item.onPostTrigger) {
            item.onPostTrigger(this, sourceState, targetState);
        }

        // Handle cooldown update
        const cooldown = item._originalCooldown || 
                        (item.tiers && item.currentTier ? item.tiers[item.currentTier].cooldown : 0);
        
        item._cooldownTicks = secondsToTicks(cooldown);
        item._nextTriggerTick = this.tickProcessor.currentTick + item._cooldownTicks;
        item.nextTrigger = ticksToSeconds(item._nextTriggerTick);
    }

    // New helper method to handle default item effects
    handleDefaultItemEffects(item, sourceState, targetState) {
        const sourceName = sourceState === this.playerState ? 'Player' : 'Monster';
        const targetName = targetState === this.playerState ? 'Player' : 'Monster';
        const multicastCount = item.multicast || 
            (item.tiers && item.currentTier ? item.tiers[item.currentTier].multicast : 1) || 
            1;

        for (let i = 0; i < multicastCount; i++) {
            // Handle basic damage
            if (item.damage || (item.tiers && item.currentTier && item.tiers[item.currentTier].damage)) {
                let damage = item.damage || item.tiers[item.currentTier].damage;
                if (item.damageMultiplier) damage *= item.damageMultiplier;
                this.applyDamage(targetState, damage, targetName, item.name);
            }

            // Handle freeze effect
            if (item.freeze) {
                this.applyFreeze({
                    freezeTargets: item.freezeTargets || 1,
                    freezeDuration: item.freezeDuration || 1,
                    freezeSize: item.freezeSize || 'small'
                }, targetState.slots);
            }

            // Handle slow effect
            if (item.slow) {
                // Apply slow effect to target items
                const targetItems = targetState.slots.filter(i => i);
                for (let j = 0; j < (item.slowTargets || 1); j++) {
                    if (j < targetItems.length) {
                        const targetItem = targetItems[j];
                        targetItem._cooldownTicks *= 1.5; // Slow effect increases cooldown by 50%
                        this.log(`${targetItem.name} is slowed!`, 'trigger');
                    }
                }
            }

            // Handle haste effect
            if (item.haste) {
                this.applyHaste(sourceState, item);
            }

            // Handle shield effect
            if (item.shield) {
                const shieldAmount = item.shieldAmount || 
                    (item.tiers && item.currentTier ? item.tiers[item.currentTier].shieldAmount : 0);
                if (shieldAmount > 0) {
                    sourceState.shield += shieldAmount;
                    this.log(`${sourceName} gains ${shieldAmount} shield from ${item.name}`, 'shield');
                }
            }

            // Handle heal effect
            if (item.heal) {
                const healAmount = item.healAmount || 
                    (item.tiers && item.currentTier ? item.tiers[item.currentTier].healAmount : 0);
                if (healAmount > 0) {
                    sourceState.health = Math.min(sourceState.health + healAmount, sourceState.maxHealth);
                    this.log(`${sourceName} heals for ${healAmount} HP from ${item.name}`, 'heal');
                }
            }

            // Handle poison effect
            if (item.poison > 0) {
                targetState.poison.value += item.poison;
                this.log(`${targetName} is poisoned for ${item.poison} damage`, 'poison');
            }

            // Handle burn effect
            if (item.burn > 0) {
                targetState.burn.value += item.burn;
                this.log(`${targetName} is burned for ${item.burn} damage`, 'burn');
            }

            // Handle potion effects
            if (item.type === "Potion") {
                // Handle Infinite Potion
                if (item.name === "Infinite Potion") {
                    // Restore ammo
                    const itemsWithAmmo = sourceState.slots.filter(i => 
                        i && i.maxAmmo > 0 && i.ammo < i.maxAmmo
                    );
                    
                    // Refill ammo for each item
                    itemsWithAmmo.forEach(targetItem => {
                        const ammoRestored = Math.min(
                            targetItem.maxAmmo - targetItem.ammo,
                            1  // Restore 1 ammo per trigger
                        );
                        targetItem.ammo += ammoRestored;
                        this.log(`${sourceName}'s ${targetItem.name} restored ${ammoRestored} ammo (${targetItem.ammo}/${targetItem.maxAmmo})`, 'trigger');
                    });

                    // Apply regen effect
                    const regenAmount = item.regenAmount || 
                        (item.tiers && item.currentTier ? item.tiers[item.currentTier].regenAmount : 0);
                    if (regenAmount > 0) {
                        sourceState.regen += regenAmount;
                        this.log(`${sourceName} gains ${regenAmount} regeneration from ${item.name}`, 'heal');
                    }
                }
                
                // Handle Frost Potion
                if (item.name === "Frost Potion" && item.freeze) {
                    this.applyFreeze({
                        freezeTargets: item.freezeTargets || 1,
                        freezeDuration: item.freezeDuration || 1,
                        freezeSize: item.freezeSize || 'small'
                    }, targetState.slots);
                }
            }
        }
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
        if (!item || !item._nextUnfreezeTick) return false;
        
        const isFrozen = this.tickProcessor.currentTick < item._nextUnfreezeTick;
        
        // Debug logging to track freeze state
        if (isFrozen) {
            console.log(`[DEBUG] ${item.name} is frozen until tick ${item._nextUnfreezeTick} (current tick: ${this.tickProcessor.currentTick})`);
        }
        
        return isFrozen;
    }

    applyFreeze(freezeData, targetSlots) {
        const { freezeTargets, freezeDuration, freezeSize } = freezeData;
        
        const validTargets = this.getRandomTargets(targetSlots, freezeSize);
        if (validTargets.length === 0) return;

        // Apply freeze for the specified number of targets
        for (let i = 0; i < freezeTargets; i++) {
            const targetIndex = Math.floor(Math.random() * validTargets.length);
            const target = validTargets[targetIndex];
            
            // Convert duration to ticks and store both current cooldown and freeze duration
            const freezeDurationTicks = secondsToTicks(freezeDuration);
            const currentCooldownTicks = target._nextTriggerTick - this.tickProcessor.currentTick;
            
            // Set next trigger time to after freeze expires
            target._nextTriggerTick = this.tickProcessor.currentTick + freezeDurationTicks + currentCooldownTicks;
            
            // Store freeze expiration tick separately
            target._nextUnfreezeTick = this.tickProcessor.currentTick + freezeDurationTicks;
            
            this.log(`${target.name} becomes frozen for ${freezeDuration} second(s)`, 'freeze');
            
            // Remove the target from valid targets to prevent freezing the same item twice
            validTargets.splice(targetIndex, 1);
            if (validTargets.length === 0) break;
        }
    }

    processFreeze() {
        const currentTime = this.getCurrentTimeInSeconds();
        
        for (const state of [this.playerState, this.monsterState]) {
            for (const item of state) {
                if (!item || !item.freezeDuration) continue;

                // Check if freeze should expire
                if (currentTime >= item.nextUnfreeze) {
                    item.freezeDuration = 0;
                    item.nextUnfreeze = null;
                    this.log(`${item.name} is no longer frozen`, 'freeze');
                }
            }
        }
    }

    // Update isItemReady to handle frozen items
    isItemReady(item) {
        if (!item) return false;
        if (item.freezeDuration > 0) return false;
        return this.getCurrentTimeInSeconds() >= item.nextTrigger;
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
                // Store ALL important state
                const currentEnchantment = item.enchantment;
                const currentDamageMultiplier = item.damageMultiplier;
                const currentTier = item.currentTier || item.tier; // Store the correct tier

                // Reset basic properties
                item.nextTrigger = 0;
                item._nextUnfreezeTick = null;
                
                if (item.maxAmmo !== undefined) {
                    item.ammo = item.maxAmmo;
                }
                
                // Special item handling
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
                
                // Apply tier properties
                if (item.tiers && currentTier) {
                    Object.assign(item, item.tiers[currentTier]);
                    item.currentTier = currentTier; // Ensure tier is preserved
                    item.tier = currentTier; // Sync both tier properties
                }

                // Restore enchantment state
                if (currentEnchantment) {
                    item.enchantment = currentEnchantment;
                    item.damageMultiplier = currentDamageMultiplier;
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

    // Add helper method for random target selection
    getRandomTargets(targetState, freezeSize) {
        // Filter out null slots, radiant items, and non-combat items
        let validTargets = targetState.filter(item => {
            if (!item) return false;
            
            // Exclude non-combat items
            if (item.isNonCombat || item.trigger === "NonCombat") return false;
            
            // Exclude radiant items from freeze effects
            if (item.enchantment === 'radiant') {
                this.log(`Radiant ${item.name} can't be frozen`, 'freeze');
                return false;
            }
            
            // Handle size restrictions for freeze effects
            if (freezeSize) {
                if (freezeSize === 'small' && item.size !== 1) return false;
                if (freezeSize === 'medium' && item.size !== 2) return false;
                if (freezeSize === 'large' && item.size !== 3) return false;
            }
            
            return true;
        });

        return validTargets;
    }

    applyHealing(state, healAmount, stateName) {
        if (healAmount <= 0) return;
        
        const maxHeal = state.maxHealth - state.health;
        const actualHeal = Math.min(healAmount, maxHeal);
        
        if (actualHeal > 0) {
            state.health += actualHeal;
            this.log(`${stateName} heals for ${actualHeal} HP`, 'heal');
        } else if (maxHeal <= 0) {
            this.log(`${stateName} is already at full health`, 'heal');
        }
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
            // Store the multiplier instead of applying it directly
            item.damageMultiplier = value;
            console.log(`Stored damage multiplier ${value} for ${item.name}`);
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

function handleFullAnalysis() {
    console.log("Running full analysis...");
    const simulator = new CombatSimulator(state.slots, state.selectedMonster, state.playerStats);
    
    let wins = 0;
    const itemStats = {};
    
    // Initialize item stats tracking
    [...state.slots, ...state.selectedMonster.slots]
        .filter(item => item)
        .forEach(item => {
            itemStats[item.name] = { triggers: 0 };
        });

    // Run 10 individual simulations
    for (let i = 0; i < 10; i++) {
        const result = simulator.simulateFight(1);
        if (result.wins > 0) wins++;
    }

    displayFullAnalysisResults({
        wins,
        totalFights: 10,
        itemStats
    });
}

