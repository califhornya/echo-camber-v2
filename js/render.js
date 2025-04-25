import { bazaar, coconutCrabBuild, rogueScrapper } from './database.js';
import { applyEnchantment, removeEnchantment } from './combat.js';
import { updatePlayerStats } from './main.js';

const ENCHANTMENT_TYPES = ['heavy', 'icy', 'turbo', 'shielded', 'restorative', 
    'toxic', 'fiery', 'shiny', 'deadly', 'radiant', 'obsidian'];

export function renderBoard(boardClass, isMonster = false, monsterData = null) {
    const board = document.querySelector(`.${boardClass}`);
    board.innerHTML = '';
    
    // Create slots
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = i;
        board.appendChild(slot);
    }

    // Add monster name if this is a monster board and we have monster data
    if (isMonster && monsterData) {
        // Remove any existing monster name
        const container = board.closest('.monster-container') || board.parentElement;
        const existingMonsterName = container.querySelector('.monster-name');
        if (existingMonsterName) {
            existingMonsterName.remove();
        }
        
        // Create and add new monster name
        const monsterNameEl = document.createElement('div');
        monsterNameEl.className = 'monster-name';
        monsterNameEl.textContent = monsterData.name;
        container.insertBefore(monsterNameEl, board);
        
        // Render monster items accounting for size
        const renderedSlots = new Set();
        
        monsterData.slots.forEach((item, index) => {
            if (item && !renderedSlots.has(index)) {
                renderItem(item, index, boardClass);
                
                // Mark all slots this item occupies as rendered
                for (let i = 0; i < item.size; i++) {
                    renderedSlots.add(index + i);
                }
            }
        });
    }
}

export function renderItem(item, slotIndex, boardClass = 'player-board') {
    const slot = document.querySelector(`.${boardClass} .slot[data-index="${slotIndex}"]`);
    if (!slot) return;
    
    // Clear existing content
    for (let i = 0; i < item.size; i++) {
        const slotToCheck = document.querySelector(`.${boardClass} .slot[data-index="${slotIndex + i}"]`);
        if (slotToCheck) {
            slotToCheck.innerHTML = '';
            slotToCheck.className = 'slot';
            if (i > 0) {
                slotToCheck.classList.add('continuation');
            }
        }
    }
    
    // Create the item element
    const itemElement = document.createElement('div');
    itemElement.className = `item size-${item.size}`;
    
    // Set size explicitly via style to ensure it's respected
    if (item.size > 1) {
        itemElement.style.width = `calc(var(--slot-width) * ${item.size})`;
    }
    
    // Add tier class for styling
    const tierClass = item.currentTier || item.tier || "Bronze";
    itemElement.classList.add(`tier-${tierClass.toLowerCase()}`);
    
    if (item.enchantment) {
        itemElement.classList.add('enchanted');
        itemElement.classList.add(`enchanted-${item.enchantment}`);
    }
    
    if (item.image) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'item-image-container';
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = item.name;
        image.className = 'item-image';
        imageContainer.appendChild(image);
        itemElement.appendChild(imageContainer);
    }
    
    addItemName(itemElement, item);
    
    // Create container for control buttons at the bottom
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'item-controls-container';
    
    // Left side controls (remove and settings)
    const leftControls = document.createElement('div');
    leftControls.className = 'item-left-controls';
    
    if (boardClass === 'player-board') {
        // Add remove and options buttons to the left controls
        addRemoveButton(leftControls, slot, item);
        addOptionsButton(leftControls, item, slot, boardClass);
    }
    
    controlsContainer.appendChild(leftControls);
    
    // Right side controls (info button)
    const rightControls = document.createElement('div');
    rightControls.className = 'item-right-controls';
    
    // Add info button to the right controls
    addInfoButton(rightControls, item);
    
    controlsContainer.appendChild(rightControls);
    itemElement.appendChild(controlsContainer);
    
    slot.appendChild(itemElement);
    markOccupiedSlots(boardClass, slotIndex, item.size);
}

function addRemoveButton(container, slot, item) {
    const removeButton = document.createElement('button');
    removeButton.className = 'item-button remove-button';
    removeButton.innerHTML = '<span class="button-icon">×</span>';
    removeButton.title = 'Remove item';
    
    removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotIndex = parseInt(slot.dataset.index);
        
        for (let j = 0; j < item.size; j++) {
            window.playerBoard[slotIndex + j] = null;
        }
        
        // Clear slot content directly
        for (let j = 0; j < item.size; j++) {
            const occupiedSlot = document.querySelector(`.player-board .slot[data-index="${slotIndex + j}"]`);
            if (occupiedSlot) {
                occupiedSlot.innerHTML = '';
                occupiedSlot.classList.remove('occupied', 'continuation');
            }
        }
    });
    
    container.appendChild(removeButton);
}

function addOptionsButton(container, item, slot, boardClass) {
    const optionsButton = document.createElement('button');
    optionsButton.className = 'item-button options-button';
    optionsButton.innerHTML = '<span class="button-icon">⚙️</span>';
    optionsButton.title = 'Item options';
    
    optionsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showItemOptionsModal(item, slot, boardClass);
    });
    
    container.appendChild(optionsButton);
}

function showItemOptionsModal(item, slot, boardClass) {
    // Remove any existing modal
    const existingModal = document.getElementById('item-options-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'item-options-modal';
    modal.className = 'modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Add header with item name and close button
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const itemName = document.createElement('h2');
    itemName.textContent = item.name;
    modalHeader.appendChild(itemName);
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => modal.remove());
    modalHeader.appendChild(closeButton);
    
    modalContent.appendChild(modalHeader);
    
    // Create tabs for different option categories
    const tabContainer = document.createElement('div');
    tabContainer.className = 'tab-container';
    
    const tabButtons = document.createElement('div');
    tabButtons.className = 'tab-buttons';
    
    const tabContents = document.createElement('div');
    tabContents.className = 'tab-contents';
    
    // Define tabs
    const tabs = [
        {
            id: 'tier',
            label: 'Tier',
            content: createTierOptions(item, slot, boardClass)
        },
        {
            id: 'enchantment',
            label: 'Enchantment',
            content: createEnchantmentOptions(item, slot, boardClass)
        },
        {
            id: 'attributes',
            label: 'Attributes',
            content: createAttributeOptions(item, slot, boardClass)
        }
    ];
    
    // Create tab buttons and content
    tabs.forEach((tab, index) => {
        const button = document.createElement('button');
        button.className = 'tab-button' + (index === 0 ? ' active' : '');
        button.textContent = tab.label;
        button.dataset.tabId = tab.id;
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`tab-${tab.id}`).classList.add('active');
        });
        
        tabButtons.appendChild(button);
        
        const content = document.createElement('div');
        content.id = `tab-${tab.id}`;
        content.className = 'tab-content' + (index === 0 ? ' active' : '');
        content.appendChild(tab.content);
        
        tabContents.appendChild(content);
    });
    
    tabContainer.appendChild(tabButtons);
    tabContainer.appendChild(tabContents);
    
    modalContent.appendChild(tabContainer);
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.textContent = 'Apply Changes';
    saveButton.addEventListener('click', () => {
        // Apply pending tier change if any
        if (item._pendingTier) {
            console.log(`[DEBUG] Applying tier change from ${item.currentTier || item.tier} to ${item._pendingTier}`);
            
            // Directly set the tier
            if (item.tiers) {
                item.currentTier = item._pendingTier;
            } else {
                item.tier = item._pendingTier;
            }
            
            // Copy tier-specific properties to the item's root level for compatibility
            if (item.tiers && item.tiers[item.currentTier]) {
                Object.assign(item, item.tiers[item.currentTier]);
                console.log(`[DEBUG] Applied tier properties:`, item.tiers[item.currentTier]);
            }
            
            // Clear the pending tier
            delete item._pendingTier;
        }
        
        // Re-render the item to reflect changes
                renderItem(item, parseInt(slot.dataset.index), boardClass);
        modal.remove();
    });
    
    modalContent.appendChild(saveButton);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside of it
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function createTierOptions(item, slot, boardClass) {
    const container = document.createElement('div');
    container.className = 'tier-options-container';
    
    const tierTitle = document.createElement('h3');
    tierTitle.textContent = 'Item Tier';
    container.appendChild(tierTitle);
    
    // Create tier selection
    const tierSelector = document.createElement('div');
    tierSelector.className = 'tier-selector';
    
    // Show current tier info
    const currentTierDisplay = document.createElement('div');
    currentTierDisplay.className = 'current-tier-display';
    currentTierDisplay.textContent = `Current Tier: ${item.currentTier || item.tier || "Bronze"}`;
    container.appendChild(currentTierDisplay);
    
    console.log(`[DEBUG] Starting tier selection UI for ${item.name}, current tier: ${item.currentTier || item.tier}`);
    
    const tierOptions = ["Bronze", "Silver", "Gold", "Diamond"];
    const currentTier = item.currentTier || item.tier || "Bronze";
    
    tierOptions.forEach(tierOption => {
        const tierButton = document.createElement('button');
        tierButton.className = 'tier-option' + (tierOption === currentTier ? ' selected' : '');
        tierButton.dataset.tier = tierOption;
        tierButton.textContent = tierOption;
        
        tierButton.addEventListener('click', () => {
            console.log(`[DEBUG] Tier button clicked: ${tierOption}`);
            
            // Update visual selection
            document.querySelectorAll('.tier-option').forEach(btn => btn.classList.remove('selected'));
            tierButton.classList.add('selected');
            
            // Store the target tier for when Apply Changes is clicked
            item._pendingTier = tierOption;
            currentTierDisplay.textContent = `Current Tier: ${item.currentTier || item.tier} (Will change to: ${tierOption})`;
        });
        
        tierSelector.appendChild(tierButton);
    });
    
    container.appendChild(tierSelector);
    
    return container;
}

function createEnchantmentOptions(item, slot, boardClass) {
    const container = document.createElement('div');
    container.className = 'enchantment-options-container';
    
    const enchantTitle = document.createElement('h3');
    enchantTitle.textContent = 'Enchantments';
    container.appendChild(enchantTitle);
    
    // Add "No Enchantment" option
    const noEnchantOption = document.createElement('div');
    noEnchantOption.className = 'enchantment-option' + (!item.enchantment ? ' selected' : '');
    noEnchantOption.dataset.enchantment = '';
    
    const noEnchantLabel = document.createElement('span');
    noEnchantLabel.textContent = 'No Enchantment';
    noEnchantOption.appendChild(noEnchantLabel);
    
    noEnchantOption.addEventListener('click', () => {
        document.querySelectorAll('.enchantment-option').forEach(opt => opt.classList.remove('selected'));
        noEnchantOption.classList.add('selected');
        removeEnchantment(item);
    });
    
    container.appendChild(noEnchantOption);
    
    // If there are no enchantment effects, return early
    if (!item.enchantmentEffects) {
        const noEffectsMsg = document.createElement('p');
        noEffectsMsg.textContent = 'This item cannot be enchanted.';
        container.appendChild(noEffectsMsg);
        return container;
    }
    
    // Add enchantment options
    Object.entries(item.enchantmentEffects).forEach(([key, enchant]) => {
        const enchantOption = document.createElement('div');
        enchantOption.className = 'enchantment-option' + (item.enchantment === key ? ' selected' : '');
        enchantOption.dataset.enchantment = key;
        
        const enchantLabel = document.createElement('span');
        enchantLabel.textContent = enchant.name;
        enchantOption.appendChild(enchantLabel);
        
        // Add effect description
        const effectDescription = document.createElement('p');
        effectDescription.className = 'enchantment-description';
        
        // Generate effect description based on enchantment type
        let description = '';
        const effect = enchant.effect;
        
        if (effect.damage) description += `+${effect.damage} Damage. `;
        if (effect.damageMultiplier) description += `${effect.damageMultiplier}x Damage. `;
        if (effect.shield) description += `+${effect.shieldAmount || 'Scaled'} Shield. `;
        if (effect.heal) description += `+${effect.healAmount || 'Scaled'} Heal. `;
        if (effect.burn) description += `+${effect.burn} Burn. `;
        if (effect.poison) description += `+${effect.poison || 'Scaled'} Poison. `;
        if (effect.slowTargets) description += `Slow ${effect.slowTargets} targets for ${effect.slowDuration}s. `;
        if (effect.freezeTargets) description += `Freeze ${effect.freezeTargets} targets for ${effect.freezeDuration}s. `;
        if (effect.hasteTargets) description += `Haste ${effect.hasteTargets} targets for ${effect.hasteDuration}s. `;
        if (effect.cooldown) description += `Cooldown: ${effect.cooldown}s. `;
        if (effect.crit) description += `+${effect.crit * 100}% Crit Chance. `;
        if (effect.critMultiplier) description += `${effect.critMultiplier}x Crit Damage. `;
        if (effect.multicast) {
            // For Shiny enchantment, it actually adds 1 multicast (turns 1 into 2)
            if (item.enchantment === "shiny") {
                description += `+1 multicast`;
        } else {
                // For other enchantments with explicit multicast values
                description += `${effect.multicast}x multicast`;
            }
        }
        
        if (effect.scalingType && effect.scaler) {
            description += `Scales with ${effect.scaler}.`;
        }
        
        effectDescription.textContent = description || 'No effects.';
        enchantOption.appendChild(effectDescription);
        
        enchantOption.addEventListener('click', () => {
            document.querySelectorAll('.enchantment-option').forEach(opt => opt.classList.remove('selected'));
            enchantOption.classList.add('selected');
            applyEnchantment(item, key);
        });
        
        container.appendChild(enchantOption);
    });
    
    return container;
}

function createAttributeOptions(item, slot, boardClass) {
    const container = document.createElement('div');
    container.className = 'attribute-options-container';
    
    const attributesTitle = document.createElement('h3');
    attributesTitle.textContent = 'Item Attributes';
    container.appendChild(attributesTitle);
    
    // Create scrollable attributes list
    const attributesList = document.createElement('div');
    attributesList.className = 'attributes-list';
    
    // Get base attributes that can be edited
    const editableAttributes = [
        { key: 'damage', label: 'Damage', type: 'number' },
        { key: 'cost', label: 'Cost', type: 'number' },
        { key: 'cooldown', label: 'Cooldown', type: 'number', step: 0.5 },
        { key: 'crit', label: 'Crit Chance', type: 'number', step: 0.05, max: 1, formatter: value => (value * 100).toFixed(0) + '%', parser: value => parseFloat(value) / 100 },
        { key: 'critMultiplier', label: 'Crit Multiplier', type: 'number', step: 0.5 },
        { key: 'shieldAmount', label: 'Shield Amount', type: 'number' },
        { key: 'healAmount', label: 'Heal Amount', type: 'number' },
        { key: 'burn', label: 'Burn', type: 'number' },
        { key: 'poison', label: 'Poison', type: 'number' },
        { key: 'multicast', label: 'Multicast', type: 'number' },
        { key: 'size', label: 'Size', type: 'number', min: 1, max: 3 }
    ];
    
    // Create form fields for each editable attribute that exists on the item
    editableAttributes.forEach(attr => {
        let value;
        
        // For tiered items, get values from the current tier
        if (item.tiers && item.currentTier && item.tiers[item.currentTier] && item.tiers[item.currentTier][attr.key] !== undefined) {
            value = item.tiers[item.currentTier][attr.key];
        } else if (item[attr.key] !== undefined) {
            value = item[attr.key];
        } else {
            return; // Skip attributes that don't exist on this item
        }
        
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = attr.label;
        formGroup.appendChild(label);
        
        const input = document.createElement('input');
        input.type = attr.type;
        input.value = attr.formatter ? attr.formatter(value) : value;
        input.min = attr.min !== undefined ? attr.min : 0;
        if (attr.max !== undefined) input.max = attr.max;
        if (attr.step !== undefined) input.step = attr.step;
        
        input.addEventListener('change', () => {
            let newValue = attr.parser ? attr.parser(input.value) : parseFloat(input.value);
            
            // For tiered items, update the value in the current tier
            if (item.tiers && item.currentTier) {
                item.tiers[item.currentTier][attr.key] = newValue;
            } else {
                item[attr.key] = newValue;
            }
        });
        
        formGroup.appendChild(input);
        attributesList.appendChild(formGroup);
    });
    
    container.appendChild(attributesList);
    
    return container;
}

function addItemName(itemElement, item) {
    const existingName = itemElement.querySelector('.item-name');
    if (existingName) existingName.remove();

    const nameDiv = document.createElement('div');
    nameDiv.className = 'item-name';
    if (item.enchantment) {
        nameDiv.textContent = `${item.enchantmentEffects[item.enchantment].name} ${item.name}`;
    } else {
        nameDiv.textContent = item.name;
    }
    itemElement.appendChild(nameDiv);
}

function addInfoButton(container, item) {
    const infoButton = document.createElement('button');
    infoButton.className = 'item-button info-button';
    infoButton.innerHTML = '<span class="button-icon">ℹ️</span>';
    infoButton.title = 'Show item stats';
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'item-stats-tooltip';
    tooltip.id = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate stats content
    const statsContent = generateItemStatsContent(item);
    tooltip.innerHTML = statsContent;
    
    // Add tooltip to document body instead of as a child of the button
    document.body.appendChild(tooltip);
    
    // Add event listeners for hover
    infoButton.addEventListener('mouseenter', (e) => {
        const tooltipId = tooltip.id;
        const tooltipElement = document.getElementById(tooltipId);
        if (!tooltipElement) return;
        
        tooltipElement.style.display = 'block';
        
        // Position the tooltip near the button but not as a child
        const buttonRect = infoButton.getBoundingClientRect();
        tooltipElement.style.left = `${buttonRect.left}px`;
        tooltipElement.style.top = `${buttonRect.top - tooltipElement.offsetHeight - 10}px`;
        
        // Check if tooltip is going off screen and adjust if needed
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (tooltipRect.right > viewportWidth) {
            tooltipElement.style.left = `${buttonRect.right - tooltipElement.offsetWidth}px`;
        }
        
        if (tooltipRect.top < 0) {
            tooltipElement.style.top = `${buttonRect.bottom + 10}px`;
            tooltipElement.classList.add('tooltip-below');
        }
    });
    
    infoButton.addEventListener('mouseleave', () => {
        const tooltipId = tooltip.id;
        const tooltipElement = document.getElementById(tooltipId);
        if (tooltipElement) {
            tooltipElement.style.display = 'none';
            tooltipElement.classList.remove('tooltip-below');
        }
    });
    
    // Clean up tooltip when button is removed from DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!document.body.contains(infoButton)) {
                const tooltipId = tooltip.id;
                const tooltipElement = document.getElementById(tooltipId);
                if (tooltipElement) {
                    tooltipElement.remove();
                }
                observer.disconnect();
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    container.appendChild(infoButton);
}

function generateItemStatsContent(item) {
    const stats = [];
    
    // Get the current tier, either from the tier system or from the tier property
    const currentTier = item.currentTier || item.tier || "Bronze";
    
    // Function to get value either from tier or directly from item
    const getValue = (prop) => {
        if (item.tiers && item.tiers[currentTier] && item.tiers[currentTier][prop] !== undefined) {
            return item.tiers[currentTier][prop];
        }
        return item[prop];
    };
    
    // Add enchantment info if item is enchanted
    if (item.enchantment && item.enchantmentEffects && item.enchantmentEffects[item.enchantment]) {
        const enchantInfo = item.enchantmentEffects[item.enchantment];
        stats.push(`<div class="stat-enchant">${enchantInfo.name} Enchantment</div>`);
        
        // Add specific effects of the enchantment
        if (enchantInfo.effect) {
            const effects = enchantInfo.effect;
            
            // List all specific numeric effects 
            const effectsList = [];
            
            if (effects.damage) effectsList.push(`+${effects.damage} damage`);
            if (effects.burn) effectsList.push(`+${effects.burn} burn`);
            if (effects.poison) effectsList.push(`+${effects.poison} poison`);
            if (effects.shieldAmount) effectsList.push(`+${effects.shieldAmount} shield`);
            if (effects.healAmount) effectsList.push(`+${effects.healAmount} healing`);
            if (effects.multicast) {
                // For Shiny enchantment, it actually adds 1 multicast (turns 1 into 2)
                if (item.enchantment === "shiny") {
                    effectsList.push(`+1 multicast`);
                } else {
                    // For other enchantments with explicit multicast values
                    effectsList.push(`${effects.multicast}x multicast`);
                }
            }
            if (effects.crit) effectsList.push(`+${(effects.crit * 100).toFixed(0)}% crit chance`);
            if (effects.critMultiplier) effectsList.push(`+${effects.critMultiplier}x crit multiplier`);
            if (effects.damageMultiplier) effectsList.push(`${effects.damageMultiplier}x damage`);
            
            if (effectsList.length > 0) {
                stats.push(`<div class="stat-enchant-bonuses">Effect: ${effectsList.join(', ')}</div>`);
            }
            
            // Show scaling information if present
            if (effects.scalingType && effects.scaler) {
                let scalingDesc = "";
                if (effects.scalingType === "percentage") {
                    scalingDesc = `${effects.scalingValue * 100}% of ${effects.scaler}`;
                } else if (effects.scalingType === "multiplier") {
                    scalingDesc = `${effects.scalingValue}x ${effects.scaler}`;
                } else if (effects.scalingType === "equal") {
                    scalingDesc = `equal to ${effects.scaler}`;
                }
                
                stats.push(`<div class="stat-enchant-scaling">Scaling: ${scalingDesc}</div>`);
            }
        }
    }
    
    // Add cost information
    const cost = getValue('cost');
    if (cost) {
        stats.push(`<div>Cost: ${cost} gold</div>`);
    }
    
    if (getValue('damage')) {
        let damage = getValue('damage');
        // Check for enchantment damage multiplier
        if (item.enchantment && 
            item.enchantmentEffects && 
            item.enchantmentEffects[item.enchantment] && 
            item.enchantmentEffects[item.enchantment].effect.damageMultiplier) {
            const multiplier = item.enchantmentEffects[item.enchantment].effect.damageMultiplier;
            damage *= multiplier;
            stats.push(`<div class="stat-damage">Damage: ${damage} (${multiplier}x from Obsidian)</div>`);
        } else {
            stats.push(`<div class="stat-damage">Damage: ${damage}</div>`);
        }
    }
    
    if (getValue('cooldown')) {
        stats.push(`<div>Cooldown: ${getValue('cooldown')}s</div>`);
    }
    
    if (getValue('multicast') && getValue('multicast') > 1) {
        stats.push(`<div>Multicast: ${getValue('multicast')}</div>`);
    }
    
    if (getValue('crit')) {
        stats.push(`<div>Crit Chance: ${(getValue('crit') * 100).toFixed(0)}%</div>`);
    }
    
    if (getValue('critMultiplier')) {
        let critText = "";
        if (getValue('critMultiplier') == 2) critText = "Double";
        else if (getValue('critMultiplier') == 3) critText = "Triple";
        else if (getValue('critMultiplier') == 4) critText = "Quadruple";
        else if (getValue('critMultiplier') == 5) critText = "Quintuple";
        else critText = `${getValue('critMultiplier')}x`;
        
        stats.push(`<div>${critText} Crit Damage</div>`);
    }

    // Special case for Seashell - display shield based on shieldPerAquatic value
    if (item.name === "Sea Shell" && getValue('shield')) {
        const shieldPerAquatic = getValue('shieldPerAquatic');
        stats.push(`<div class="stat-shield">Shield: ${shieldPerAquatic} per Aquatic item</div>`);
    } else if (getValue('shield')) {
        stats.push(`<div class="stat-shield">Shield: ${getValue('shieldAmount')}</div>`);
    }
    
    if (getValue('heal')) {
        stats.push(`<div class="stat-heal">Heal: ${getValue('healAmount')}</div>`);
    }
    
    if (getValue('poison')) {
        stats.push(`<div class="stat-effect">Poison: ${getValue('poison')}</div>`);
    }
    
    if (getValue('burn')) {
        stats.push(`<div class="stat-effect">Burn: ${getValue('burn')}</div>`);
    }
    
    if (getValue('slowTargets')) {
        stats.push(`<div class="stat-effect">Slow: ${getValue('slowTargets')} target(s) for ${getValue('slowDuration')}s</div>`);
    }
    
    if (getValue('freezeTargets')) {
        stats.push(`<div class="stat-effect">Freeze: ${getValue('freezeTargets')} target(s) for ${getValue('freezeDuration')}s</div>`);
    }
    
    if (getValue('hasteTargets')) {
        stats.push(`<div class="stat-effect">Haste: ${getValue('hasteTargets')} target(s) for ${getValue('hasteDuration')}s</div>`);
    }
    
    if (getValue('regenAmount')) {
        stats.push(`<div class="stat-heal">Regen: ${getValue('regenAmount')} per turn</div>`);
    }

    // Add passive description if it exists
    if (typeof item.passive === 'function') {
        stats.push(`<div class="stat-passive">Passive: ${item.passive()}</div>`);
    } else if (item.passive) {
        stats.push(`<div class="stat-passive">Passive: ${item.passive}</div>`);
    }

    return stats.join('');
}

export function highlightAdjacentSlots(slotIndex) {
    document.querySelectorAll('.slot.adjacent-highlight')
        .forEach(slot => slot.classList.remove('adjacent-highlight'));
    
    const leftSlot = document.querySelector(`.slot[data-index="${slotIndex - 1}"]`);
    const rightSlot = document.querySelector(`.slot[data-index="${slotIndex + 1}"]`);
    
    if (leftSlot) leftSlot.classList.add('adjacent-highlight');
    if (rightSlot) rightSlot.classList.add('adjacent-highlight');
}

export function markOccupiedSlots(boardClass, slotIndex, itemSize) {
    for (let i = 0; i < itemSize; i++) {
        const slotToMark = document.querySelector(`.${boardClass} .slot[data-index="${slotIndex + i}"]`);
        if (slotToMark) {
            slotToMark.classList.add('occupied');
            if (i > 0) {
                slotToMark.classList.add('continuation');
            }
        }
    }
}

export function renderSearchResults(items, onSelect) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (items.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    resultsContainer.style.display = 'block';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'search-result-item';
        itemElement.innerHTML = `
            <div class="search-result-name">${item.name}</div>
            <div class="item-details">
                ${item.type} | Tier: ${item.tier} | Size: ${item.size}
            </div>
        `;
        
        itemElement.addEventListener('click', () => onSelect(item));
        resultsContainer.appendChild(itemElement);
    });
}

export function findLeftmostEmptySlot(itemSize = 1) {
    if (!window.playerBoard) return 0;
    
    for (let i = 0; i < window.playerBoard.length; i++) {
        let canFit = true;
        for (let j = 0; j < itemSize; j++) {
            if (i + j >= window.playerBoard.length || window.playerBoard[i + j] !== null) {
                canFit = false;
                break;
            }
        }
        if (canFit) {
            return i;
        }
    }
    return -1;
}

export function renderPlayerStatsEditor() {
    const container = document.createElement('div');
    container.className = 'player-stats-editor';
    
    const title = document.createElement('h3');
    title.textContent = 'Player Stats';
    
    const form = document.createElement('form');
    form.className = 'stats-form';
    form.onsubmit = (e) => e.preventDefault();
    
    // Health group
    const healthGroup = document.createElement('div');
    healthGroup.className = 'form-group';
    const healthLabel = document.createElement('label');
    healthLabel.textContent = 'Health:';
    const healthInput = document.createElement('input');
    healthInput.type = 'number';
    healthInput.min = '1';
    healthInput.value = '100';
    healthInput.required = true;
    
    // Regen group
    const regenGroup = document.createElement('div');
    regenGroup.className = 'form-group';
    const regenLabel = document.createElement('label');
    regenLabel.textContent = 'Regeneration:';
    const regenInput = document.createElement('input');
    regenInput.type = 'number';
    regenInput.min = '0';
    regenInput.value = '0';
    regenInput.required = true;
    
    // Shield group
    const shieldGroup = document.createElement('div');
    shieldGroup.className = 'form-group';
    const shieldLabel = document.createElement('label');
    shieldLabel.textContent = 'Shield:';
    const shieldInput = document.createElement('input');
    shieldInput.type = 'number';
    shieldInput.min = '0';
    shieldInput.value = '0';
    shieldInput.required = true;
    
    // Add event listeners for real-time updates
    const updateStats = () => {
        const health = parseInt(healthInput.value) || 100;
        const regen = parseInt(regenInput.value) || 0;
        const shield = parseInt(shieldInput.value) || 0;
        updatePlayerStats({ health, regen, shield });
    };
    
    healthInput.addEventListener('change', updateStats);
    regenInput.addEventListener('change', updateStats);
    shieldInput.addEventListener('change', updateStats);
    
    // Assemble the form
    healthGroup.appendChild(healthLabel);
    healthGroup.appendChild(healthInput);
    regenGroup.appendChild(regenLabel);
    regenGroup.appendChild(regenInput);
    shieldGroup.appendChild(shieldLabel);
    shieldGroup.appendChild(shieldInput);
    
    form.appendChild(healthGroup);
    form.appendChild(regenGroup);
    form.appendChild(shieldGroup);
    
    container.appendChild(title);
    container.appendChild(form);
    
    return container;
}