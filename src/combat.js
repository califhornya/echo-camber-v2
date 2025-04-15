export class CombatSimulator {
    constructor(playerBoard, monsterBoard) {
        this.playerBoard = playerBoard;
        this.monsterBoard = monsterBoard;
        this.time = 0;
        this.isRunning = false;
        
        // Combat state
        this.playerState = {
            hp: 100,  // We can make this configurable later
            shield: 0,
            poison: 0,
            burn: 0
        };
        
        this.monsterState = {
            hp: monsterBoard.health || 200,
            shield: 0,
            poison: 0,
            burn: 0
        };

        this.logs = [];
    }

    log(message, type = 'default') {
        this.logs.push({ message, type });
    }

    displayLogs() {
        const logContainer = document.getElementById('combat-log');
        logContainer.innerHTML = this.logs
            .map(log => `<div class="log-entry log-${log.type}">${log.message}</div>`)
            .join('');
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
            this.processTurn();
            
            // Check win conditions
            if (this.playerState.hp <= 0) return 'monster';
            if (this.monsterState.hp <= 0) return 'player';
            
            this.time++;
        }
    }

    initializeItems() {
        // Set initial trigger times for all items
        [...this.playerBoard, ...this.monsterBoard.slots]
            .filter(item => item)
            .forEach(item => {
                item.nextTrigger = item.cooldown;
                item.nextUnfreeze = null;
            });
    }

    processTurn() {
        // Process triggers for this time step
        this.processTriggers();
        
        // Apply DOT effects
        this.applyDotEffects();
        
        // Process special effects (like Hard Shell for Coconut Crab)
        this.processSpecialEffects();
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
        
        // Check ammo
        if (item.maxAmmo > 0) {
            if (item.ammo <= 0) {
                this.log(`${sourceName}'s ${item.name} is out of ammo!`, 'trigger');
                return;
            }
            item.ammo--;
            this.log(`${sourceName}'s ${item.name} uses 1 ammo (${item.ammo} remaining)`, 'trigger');
        }

        this.log(`${sourceName}'s ${item.name} is triggering...`, 'trigger');

        // Calculate damage with crit
        let damage = this.calculateDamage(item, sourceState, targetState);
        
        // Apply Crusher Claw's shield bonus after it triggers
        if (item.name === "Crusher Claw") {
            this.applyShieldBonuses();
        }
        
        // Apply shield first
        if (targetState.shield > 0) {
            if (damage <= targetState.shield) {
                this.log(`${targetName}'s shield absorbs ${damage} damage`, 'shield');
                targetState.shield -= damage;
                damage = 0;
            } else {
                this.log(`${targetName}'s shield absorbs ${targetState.shield} damage`, 'shield');
                damage -= targetState.shield;
                targetState.shield = 0;
            }
        }

        // Apply remaining damage to HP
        if (damage > 0) {
            targetState.hp -= damage;
            this.log(`${targetName} takes ${damage} damage`, 'damage');
        }

        // Apply shield if item provides it
        if (item.shield) {
            if (item.name === "Sea Shell") {
                const aquaticItems = this.countAquaticItems(sourceState === this.playerState ? this.playerBoard : this.monsterBoard.slots);
                const baseShield = item.shieldAmount * aquaticItems;
                const bonusShield = item.bonusShield || 0;
                const totalShield = baseShield + bonusShield;
                sourceState.shield += totalShield;
                this.log(`${sourceName} gains ${totalShield} shield (${baseShield} base + ${bonusShield} bonus)`, 'shield');
            } else {
                const totalShield = (item.shieldAmount || 0) + (item.bonusShield || 0);
                sourceState.shield += totalShield;
                this.log(`${sourceName} gains ${totalShield} shield`, 'shield');
            }
        }

        // Apply heal
        if (item.heal) {
            sourceState.hp += item.healAmount || 0;
            this.log(`${sourceName} heals for ${item.healAmount}`, 'heal');
        }

        // Log state after effects
        this.log(`${sourceName} - HP: ${sourceState.hp}, Shield: ${sourceState.shield}`, 'state');
        this.log(`${targetName} - HP: ${targetState.hp}, Shield: ${targetState.shield}`, 'state');

        // Apply status effects
        if (item.poison) targetState.poison += item.poison;
        if (item.burn) targetState.burn += item.burn;
        if (item.freeze) this.applyFreeze(targetState, item);

        // Handle enchantment effects
        if (item.enchantment) {
            // Handle status effects from enchantments
            if (item.slowTargets && item.slowDuration) {
                this.applySlow(targetState, item);
            }
            if (item.freezeTargets && item.freezeDuration) {
                this.applyFreeze(targetState, item);
            }
            if (item.hasteTargets && item.hasteDuration) {
                this.applyHaste(sourceState, item);
            }
        }

        // Update next trigger time
        item.nextTrigger = this.time + item.cooldown;
    }

    calculateDamage(item, sourceState, targetState) {
        if (!item.damage && item.name !== "Crusher Claw") return 0;

        let damage = item.damage;

        // Apply enchantment damage multiplier
        if (item.damageMultiplier) {
            damage *= item.damageMultiplier;
        }

        // Special case for Crusher Claw
        if (item.name === "Crusher Claw") {
            damage = this.getHighestShieldValue(sourceState === this.playerState ? this.playerBoard : this.monsterBoard.slots);
        }

        // Apply crit chance
        if (item.crit && Math.random() < item.crit) {
            const critMultiplier = item.critDamage || 2;
            damage *= critMultiplier;
            this.log(`Critical hit! Damage multiplied by ${critMultiplier}x to ${damage}`, 'trigger');
        }

        // Handle multicast
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

    applyDotEffects() {}
    processSpecialEffects() {}
    resetState() {
        // Reset combat state
        this.playerState = {
            hp: 100,
            shield: 0,
            poison: 0,
            burn: 0
        };
        
        this.monsterState = {
            hp: this.monsterBoard.health || 200,
            shield: 0,
            poison: 0,
            burn: 0
        };

        // Reset all item states
        [...this.playerBoard, ...this.monsterBoard.slots]
            .filter(item => item)
            .forEach(item => {
                item.nextTrigger = 0;
                item.nextUnfreeze = null;
                item.bonusShield = 0;  // Reset bonus shield
            });

        // Reset ammo for all items
        [...this.playerBoard, ...this.monsterBoard.slots]
            .filter(item => item)
            .forEach(item => {
                if (item.maxAmmo > 0) {
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

    const enchantment = item.enchantmentEffects[enchantmentName];
    Object.assign(item, enchantment.effect);
    item.enchantment = enchantmentName;
    return true;
}

export function removeEnchantment(item) {
    if (!item.enchantment) return false;
    
    // Remove all enchantment effects
    if (item.enchantmentEffects && item.enchantmentEffects[item.enchantment]) {
        const effects = item.enchantmentEffects[item.enchantment].effect;
        for (const key in effects) {
            delete item[key];
        }
    }
    delete item.enchantment;
    return true;
}

