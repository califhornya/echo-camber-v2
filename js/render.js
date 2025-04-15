import { monsterBuild } from './database.js';
import { applyEnchantment } from './combat.js';

const ENCHANTMENT_TYPES = ['heavy', 'icy', 'turbo', 'shielded', 'restorative', 
    'toxic', 'fiery', 'shiny', 'deadly', 'radiant', 'obsidian'];

export function renderBoard(boardClass, isMonster = false) {
    const board = document.querySelector(`.${boardClass}`);
    board.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = i;
        
        board.appendChild(slot);
    }

    // If it's monster board, populate it with predefined items
    if (isMonster && monsterBuild) {
        monsterBuild.slots.forEach((item, index) => {
            if (item) {
                renderItem(item, index, boardClass);
            }
        });
    }
}

export function renderItem(item, slotIndex, boardClass = 'player-board') {
    const slot = document.querySelector(`.${boardClass} .slot[data-index="${slotIndex}"]`);
    if (!slot) return;
    
    const itemElement = document.createElement('div');
    itemElement.className = `item size-${item.size}`;
    if (item.enchantment) {
        itemElement.classList.add('enchanted');
        itemElement.classList.add(`enchanted-${item.enchantment}`);
    }
    
    // Create image container
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
    
    // Add remove item button (only for player board)
    if (boardClass === 'player-board') {
        const removeButton = document.createElement('button');
        removeButton.className = 'item-remove-button';
        removeButton.textContent = '×';
        removeButton.title = 'Remove item';
        
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const slotIndex = parseInt(slot.dataset.index);
            
            // Clear only this item's slots in the player board
            for (let j = 0; j < item.size; j++) {
                window.playerBoard[slotIndex + j] = null;
            }
            
            // Remove only this item's element
            itemElement.remove();
            
            // Remove 'occupied' class from the cleared slots
            for (let j = 0; j < item.size; j++) {
                const occupiedSlot = document.querySelector(`.player-board .slot[data-index="${slotIndex + j}"]`);
                if (occupiedSlot) {
                    occupiedSlot.classList.remove('occupied');
                }
            }
        });
        
        itemElement.appendChild(removeButton);
    }
    
    // Add enchantment button and dropdown if item has enchantment effects
    if (item.enchantmentEffects) {
        const enchantButton = document.createElement('button');
        enchantButton.className = 'item-enchant-button';
        enchantButton.textContent = '✨';
        enchantButton.title = 'Enchant item';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'enchantment-dropdown';
        
        // Add enchantment options
        Object.entries(item.enchantmentEffects).forEach(([key, enchant]) => {
            const option = document.createElement('div');
            option.className = 'enchantment-option';
            
            // Create the content with remove button for selected enchantment
            if (item.enchantment === key) {
                option.classList.add('selected');
                
                // Create a container for the name and remove button
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.justifyContent = 'space-between';
                container.style.alignItems = 'center';
                
                // Add enchantment name
                const nameSpan = document.createElement('span');
                nameSpan.textContent = enchant.name;
                container.appendChild(nameSpan);
                
                // Add remove button
                const removeButton = document.createElement('span');
                removeButton.textContent = '×';
                removeButton.className = 'enchantment-remove';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeEnchantment(item);
                    renderItem(item, parseInt(slot.dataset.index), boardClass);
                    dropdown.classList.remove('active');
                });
                container.appendChild(removeButton);
                
                option.appendChild(container);
            } else {
                option.textContent = enchant.name;
            }
            
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                applyEnchantment(item, key);
                document.querySelectorAll('.enchantment-dropdown').forEach(d => {
                    d.classList.remove('active');
                });
                renderItem(item, parseInt(slot.dataset.index), boardClass);
            });
            
            dropdown.appendChild(option);
        });
        
        // Toggle dropdown on button click
        enchantButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other dropdowns first
            document.querySelectorAll('.enchantment-dropdown.active').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            
            // Position the dropdown above the button
            const buttonRect = enchantButton.getBoundingClientRect();
            dropdown.style.left = `${buttonRect.left}px`;
            dropdown.style.top = `${buttonRect.top - dropdown.offsetHeight - 5}px`; // 5px gap
            
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const clickX = e.clientX;
            const clickY = e.clientY;
            const dropdownRect = dropdown.getBoundingClientRect();
            const buttonRect = enchantButton.getBoundingClientRect();
            
            // Check if click is outside both dropdown and button
            const outsideDropdown = clickX < dropdownRect.left || 
                                   clickX > dropdownRect.right || 
                                   clickY < dropdownRect.top || 
                                   clickY > dropdownRect.bottom;
            const outsideButton = clickX < buttonRect.left || 
                                 clickX > buttonRect.right || 
                                 clickY < buttonRect.top || 
                                 clickY > buttonRect.bottom;
                                 
            if (outsideDropdown && outsideButton) {
                dropdown.classList.remove('active');
            }
        });
        
        itemElement.appendChild(enchantButton);
        itemElement.appendChild(dropdown);
    }
    
    // Create item content
    const content = document.createElement('div');
    content.className = 'item-content';

    // Helper function to get item effects description
    function getItemEffects(item) {
        const effects = [];
        
        // Add base effects
        if (item.damage && !item.enchantment) effects.push(`Deal ${item.damage} damage.`);
        if (item.shield && !item.enchantment) effects.push(`Gain ${item.shieldAmount} shield.`);
        if (item.heal && !item.enchantment) effects.push(`Heal for ${item.healAmount}.`);
        
        // Add enchantment effects if present
        if (item.enchantment && item.enchantmentEffects[item.enchantment]) {
            const enchantEffects = item.enchantmentEffects[item.enchantment].effect;
            
            // Add base effects with enchantment modifications
            if (item.damage || enchantEffects.damage) {
                effects.push(`> Deal ${item.damage || 0} damage.`);
            }
            if (item.shield || enchantEffects.shield) {
                effects.push(`> Gain ${item.shieldAmount || 0} shield.`);
            }
            if (item.heal || enchantEffects.heal) {
                effects.push(`> Heal for ${item.healAmount || 0}.`);
            }
            
            // Add additional enchantment effects
            if (enchantEffects.slowTargets) {
                effects.push(`> Slow ${enchantEffects.slowTargets} item(s) for ${enchantEffects.slowDuration} second(s).`);
            }
            if (enchantEffects.freezeTargets) {
                effects.push(`> Freeze ${enchantEffects.freezeTargets} item(s) for ${enchantEffects.freezeDuration} second(s).`);
            }
            if (enchantEffects.hasteTargets) {
                effects.push(`> Haste ${enchantEffects.hasteTargets} item(s) for ${enchantEffects.hasteDuration} second(s).`);
            }
            if (enchantEffects.poison) {
                effects.push(`> Apply ${enchantEffects.poison} poison.`);
            }
            if (enchantEffects.burn) {
                effects.push(`> Apply ${enchantEffects.burn} burn.`);
            }
            if (enchantEffects.multicast) {
                effects.push(`> Trigger ${enchantEffects.multicast} additional time(s).`);
            }
            if (enchantEffects.critDamage) {
                effects.push(`> Critical hits deal ${enchantEffects.critDamage}x damage.`);
            }
            if (enchantEffects.damageMultiplier) {
                effects.push(`> Deal ${enchantEffects.damageMultiplier}x damage.`);
            }
        }
        
        return effects.join('\n');
    }

    // Create the item name with tooltip
    const itemName = document.createElement('div');
    itemName.className = 'item-name';

    if (item.enchantment) {
        const enchantSpan = document.createElement('span');
        enchantSpan.className = 'enchantment-name';
        enchantSpan.textContent = item.enchantmentEffects[item.enchantment].name;
        
        // Add tooltip
        const tooltip = document.createElement('span');
        tooltip.className = 'enchantment-tooltip';
        tooltip.textContent = getItemEffects(item);
        enchantSpan.appendChild(tooltip);
        
        // Add mouseover event to position tooltip
        enchantSpan.addEventListener('mouseenter', (e) => {
            const rect = enchantSpan.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`; // 5px gap
            tooltip.style.visibility = 'visible';
        });
        
        // Add mouseout event to hide tooltip
        enchantSpan.addEventListener('mouseleave', () => {
            tooltip.style.visibility = 'hidden';
        });
        
        itemName.appendChild(enchantSpan);
        itemName.appendChild(document.createTextNode(` ${item.name}`));
    } else {
        itemName.textContent = item.name;
    }

    content.appendChild(itemName);
    content.appendChild(document.createElement('div')).className = 'item-type';
    content.lastChild.textContent = item.type;

    itemElement.appendChild(content);
    slot.appendChild(itemElement);
    
    // Mark occupied slots
    for (let i = 0; i < item.size; i++) {
        const occupiedSlot = document.querySelector(`.${boardClass} .slot[data-index="${slotIndex + i}"]`);
        occupiedSlot.classList.add('occupied');
    }
}

export function highlightAdjacentSlots(slotIndex) {
    // Clear previous highlights
    document.querySelectorAll('.slot.adjacent-highlight')
        .forEach(slot => slot.classList.remove('adjacent-highlight'));
    
    // Highlight adjacent slots
    const leftSlot = document.querySelector(`.slot[data-index="${slotIndex - 1}"]`);
    const rightSlot = document.querySelector(`.slot[data-index="${slotIndex + 1}"]`);
    
    if (leftSlot) leftSlot.classList.add('adjacent-highlight');
    if (rightSlot) rightSlot.classList.add('adjacent-highlight');
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
            <div class="item-name">${item.name}</div>
            <div class="item-details">
                ${item.type} | Tier: ${item.tier} | Size: ${item.size}
            </div>
        `;
        
        itemElement.addEventListener('click', () => onSelect(item));
        resultsContainer.appendChild(itemElement);
    });
}

function removeEnchantment(item) {
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

export function findLeftmostEmptySlot(itemSize = 1) {
    if (!window.playerBoard) return 0;
    
    // Look for a sequence of empty slots that can fit the item
    for (let i = 0; i < window.playerBoard.length; i++) {
        let canFit = true;
        // Check if there are enough consecutive empty slots
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
    return -1; // No space found
}
