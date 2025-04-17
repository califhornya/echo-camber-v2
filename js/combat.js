export class CombatSimulator {
    constructor(playerBoard, monsterBoard) {
        this.playerBoard = playerBoard;
        this.monsterBoard = monsterBoard;
        this.time = 0;
        this.isRunning = false;

        this.playerState = {
            hp: 250,
            maxHp: 250,
            shield: 0,
            poison: { value: 0 },
            burn: { value: 0 }
        };

        this.monsterState = {
            hp: monsterBoard.health || 200,
            maxHp: monsterBoard.health || 200,
            shield: 0,
            poison: { value: 0 },
            burn: { value: 0 }
        };

        this.logs = [];
        this.currentTimeLogs = [];
        this.groupedLogs = [];
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
        this.isRunning = true;

        this.initializeItems();

        while (this.isRunning) {
            this.processTurn();
            this.time++;

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
        if (this.time >= 30 && !this.sandstormStarted) {
            this.sandstormStarted = true;
            this.sandstormDamage = 1;
            this.log("The Sandstorm has started!", "state");
        }

        if (this.sandstormStarted) {
            this.applySandstormDamage();
        }

        this.applyBurnDamage(this.playerState, 'Player');
        this.applyBurnDamage(this.monsterState, 'Monster');

        this.applyPoisonDamage(this.playerState, 'Player');
        this.applyPoisonDamage(this.monsterState, 'Monster');

        this.processTriggers();
        this.applyDotEffects();
        this.processSpecialEffects();

        this.log(`End of turn: Player - HP: ${this.playerState.hp}, Shield: ${this.playerState.shield}, Burn: ${this.playerState.burn.value}, Poison: ${this.playerState.poison.value}`, "state");
        this.log(`End of turn: Monster - HP: ${this.monsterState.hp}, Shield: ${this.monsterState.shield}, Burn: ${this.monsterState.burn.value}, Poison: ${this.monsterState.poison.value}`, "state");

        this.flushTimeLogs();
    }

    initializeItems() {
        [...this.playerBoard, ...this.monsterBoard.slots]
            .filter(item => item)
            .forEach((item, index) => {
                item.nextTrigger = item.cooldown;
                item.nextUnfreeze = null;

                if (item.maxAmmo > 0) {
                    item.ammo = item.maxAmmo;
                }

                item.instanceId = `${item.name}_${index}_${Date.now()}`;
            });
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
        this.playerBoard
            .filter(item => item && !item.isNonCombat && !this.isItemFrozen(item))
            .forEach(item => {
                if (this.time >= item.nextTrigger) {
                    this.triggerItem(item, this.playerState, this.monsterState);
                }
            });

        this.monsterBoard.slots
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
        const sourceBoard = sourceState === this.playerState ? this.playerBoard : this.monsterBoard.slots;

        if (item.maxAmmo > 0) {
            if (item.ammo <= 0) {
                this.log(`${sourceName}'s ${item.name} cannot trigger (out of ammo).`, 'state');
                return;
            }

            item.ammo--;
            this.log(`${sourceName}'s ${item.name} consumes 1 ammo. Remaining ammo: ${item.ammo}`, 'state');
        }

        this.log(`${sourceName}'s ${item.name} is triggering...`, 'trigger');

        if (item.name === "Crusher Claw") {
            const shieldBonus = this.getHighestShieldValue(sourceState === this.playerState ? this.playerBoard : this.monsterBoard.slots);
            const damage = shieldBonus;
            this.applyDamage(targetState, damage, targetName, item.name);
            return;
        }

        const multicastCount = item.multicast || 1;
        for (let i = 0; i < multicastCount; i++) {
            if (item.damage) {
                let damage = item.damage;
                if (item.damageMultiplier) {
                    damage *= item.damageMultiplier;
                }
                
                // Apply damage with shield mitigation
                this.applyDamage(targetState, damage, targetName, item.name);
            }

            if (item.burn) {
                const burnValue = item.burn;
                const critMultiplier = item.crit && Math.random() < item.crit ? item.critMultiplier || 2 : 1;
                const totalBurn = burnValue * critMultiplier;

                targetState.burn.value += totalBurn;
                this.log(`${targetName} is burned for ${totalBurn} damage over time.`, 'burn');
            }

            if (item.shield) {
                let shieldAmount = item.shieldAmount;

                if (item.enchantment && item.scalingType && item.scaler) {
                    if (item.scalingType === "percentage") {
                        shieldAmount = Math.floor(item[item.scaler] * item.scalingValue);
                    } else if (item.scalingType === "multiplier") {
                        shieldAmount = item[item.scaler] * item.scalingValue;
                    } else if (item.scalingType === "equal") {
                        shieldAmount = item[item.scaler];
                    }
                }

                sourceState.shield += shieldAmount;
                this.log(`${sourceName} gains ${shieldAmount} shield from ${item.name}.`, 'shield');
                
                // Trigger Barbed Wire effect when shield is applied
                this.applyBarbedWireEffect(sourceBoard);
            }

            if (item.poison) {
                let poisonAmount = item.poison;

                if (item.enchantment && item.scalingType && item.scaler) {
                    if (item.scalingType === "percentage") {
                        poisonAmount = Math.floor(item[item.scaler] * item.scalingValue);
                    } else if (item.scalingType === "equal") {
                        poisonAmount = item[item.scaler];
                    }
                }

                targetState.poison.value += poisonAmount;
                this.log(`${targetName} is poisoned for ${poisonAmount} damage over time.`, 'poison');
            }

            if (item.heal) {
                let healAmount = item.healAmount;

                if (item.enchantment && item.scalingType && item.scaler) {
                    if (item.scalingType === "percentage") {
                        healAmount = Math.floor(item[item.scaler] * item.scalingValue);
                    } else if (item.scalingType === "multiplier") {
                        healAmount = item[item.scaler] * item.scalingValue;
                    }
                }

                // Calculate actual healing (capped by maxHp)
                const missingHp = sourceState.maxHp - sourceState.hp;
                const actualHeal = Math.min(healAmount, missingHp);
                sourceState.hp += actualHeal;
                
                if (actualHeal > 0) {
                    this.log(`${sourceName} heals for ${actualHeal} HP.`, 'heal');
                    if (actualHeal < healAmount) {
                        this.log(`${healAmount - actualHeal} overheal.`, 'heal');
                    }
                } else if (healAmount > 0) {
                    this.log(`${sourceName} is already at full health.`, 'heal');
                }
            }
        }

        item.nextTrigger = this.time + item.cooldown;
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
        
        if (shieldValues.length > 0) {
            this.log(`Shield values found: ${shieldValues.join(', ')}`, 'trigger');
        }
        
        return shieldValues.length > 0 ? Math.max(...shieldValues) : 0;
    }

    applyFreeze(targetState, item) {
        const targetItems = targetState === this.playerState ? this.playerBoard : this.monsterBoard.slots;
        const eligibleItems = targetItems.filter(i => i && (!i.nextUnfreeze || this.time >= i.nextUnfreeze));
        
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
            burn: { value: 0 }
        };

        this.monsterState = {
            hp: this.monsterBoard.health || 200,
            maxHp: this.monsterBoard.health || 200,
            shield: 0,
            poison: { value: 0 },
            burn: { value: 0 }
        };

        [...this.playerBoard, ...this.monsterBoard.slots]
            .filter(item => item)
            .forEach(item => {
                item.nextTrigger = 0;
                item.nextUnfreeze = null;

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
            const crusherClaws = board.filter(item => item && item.name === "Crusher Claw");
            
            if (crusherClaws.length > 0) {
                board.forEach(item => {
                    if (item && item.shield) {
                        const newBonus = crusherClaws.reduce((sum, claw) => sum + (claw.shieldBonus || 0), 0);
                        item.bonusShield = (item.bonusShield || 0) + newBonus;
                        this.log(`${item.name} gets additional +${newBonus} shield (total bonus: ${item.bonusShield})`, 'shield');
                    }
                });
            }
        }
    }

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

    // Add a new method to handle Barbed Wire's special ability
    applyBarbedWireEffect(board) {
        const barbedWires = board.filter(item => item && item.name === "Barbed Wire");
        
        if (barbedWires.length > 0) {
            barbedWires.forEach(barbedWire => {
                barbedWire.damage += 10;
                this.log(`Barbed Wire's damage increased by 10. New damage: ${barbedWire.damage}`, 'trigger');
            });
        }
    }

    // New method to apply damage with shield mitigation
    applyDamage(targetState, damage, targetName, itemName) {
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
}

export function applyEnchantment(item, enchantmentName) {
    if (!item.enchantmentEffects || !item.enchantmentEffects[enchantmentName]) {
        return false;
    }

    if (item.enchantment) {
        removeEnchantment(item);
    }

    const enchantment = item.enchantmentEffects[enchantmentName];
    const effect = { ...enchantment.effect };

    if (effect.scalingType && effect.scaler) {
        const scalerValue = item[effect.scaler] || 0;

        switch (effect.scalingType) {
            case "percentage":
                Object.keys(effect).forEach(key => {
                    if (key !== "scalingType" && key !== "scaler" && key !== "scalingValue") {
                        effect[key] = Math.floor(scalerValue * (effect.scalingValue || 0));
                    }
                });
                break;
            case "equal":
                Object.keys(effect).forEach(key => {
                    if (key !== "scalingType" && key !== "scaler" && key !== "scalingValue") {
                        effect[key] = scalerValue;
                    }
                });
                break;
            case "multiplier":
                Object.keys(effect).forEach(key => {
                    if (key !== "scalingType" && key !== "scaler" && key !== "scalingValue") {
                        effect[key] = scalerValue * (effect.scalingValue || 1);
                    }
                });
                break;
            default:
                console.warn(`Unknown scalingType: ${effect.scalingType}`);
        }

        delete effect.scalingType;
        delete effect.scaler;
        delete effect.scalingValue;
    }

    for (const [key, value] of Object.entries(effect)) {
        item[key] = value;
    }

    item.enchantment = enchantmentName;

    console.log('Applied enchantment:', enchantmentName, 'to item:', item.name);
    console.log('Final item state:', item);

    return true;
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

