import { bazaar, coconutCrabBuild, rogueScrapper } from './database.js';
import { applyEnchantment, removeEnchantment } from './combat.js';

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
    
    // Clear any existing content
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
    
    if (boardClass === 'player-board') {
        addRemoveButton(itemElement, slot, item);
    }
    
    if (item.enchantmentEffects) {
        addEnchantmentButton(itemElement, item, slot, boardClass);
    }
    
    addItemName(itemElement, item);
    addItemStats(itemElement, item);
    
    slot.appendChild(itemElement);
    markOccupiedSlots(boardClass, slotIndex, item.size);
}

function addRemoveButton(itemElement, slot, item) {
    const removeButton = document.createElement('button');
    removeButton.className = 'item-remove-button';
    removeButton.textContent = '×';
    removeButton.title = 'Remove item';
    
    removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotIndex = parseInt(slot.dataset.index);
        
        for (let j = 0; j < item.size; j++) {
            window.playerBoard[slotIndex + j] = null;
        }
        
        itemElement.remove();
        
        for (let j = 0; j < item.size; j++) {
            const occupiedSlot = document.querySelector(`.player-board .slot[data-index="${slotIndex + j}"]`);
            if (occupiedSlot) occupiedSlot.classList.remove('occupied');
        }
    });
    
    itemElement.appendChild(removeButton);
}

function addEnchantmentButton(itemElement, item, slot, boardClass) {
    const enchantButton = document.createElement('button');
    enchantButton.className = 'item-enchant-button';
    enchantButton.textContent = '✨';
    enchantButton.title = 'Enchant item';
    
    // Create dropdown and attach a unique ID based on the item and slot
    const dropdownId = `enchantment-dropdown-${boardClass}-${slot.dataset.index}`;
    
    // Remove any existing dropdown with this ID to prevent duplicates
    const existingDropdown = document.getElementById(dropdownId);
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const dropdown = document.createElement('div');
    dropdown.className = 'enchantment-dropdown';
    dropdown.id = dropdownId;
    
    Object.entries(item.enchantmentEffects).forEach(([key, enchant]) => {
        const option = document.createElement('div');
        option.className = 'enchantment-option';
        
        if (item.enchantment === key) {
            option.classList.add('selected');
            
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.justifyContent = 'space-between';
            container.style.alignItems = 'center';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = enchant.name;
            container.appendChild(nameSpan);
            
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
            // Hide dropdown after selection
            dropdown.classList.remove('active');
            renderItem(item, parseInt(slot.dataset.index), boardClass);
        });
        
        dropdown.appendChild(option);
    });
    
    enchantButton.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close all other dropdowns
        document.querySelectorAll('.enchantment-dropdown.active').forEach(d => {
            d.classList.remove('active');
        });
        
        // Position the dropdown
        const buttonRect = enchantButton.getBoundingClientRect();
        dropdown.style.top = `${buttonRect.bottom + 5}px`;
        dropdown.style.left = `${buttonRect.left}px`;
        
        // Toggle dropdown visibility
        dropdown.classList.toggle('active');
    });
    
    // Add document click handler to close dropdown
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && !enchantButton.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    itemElement.appendChild(enchantButton);
    document.body.appendChild(dropdown);
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

function addItemStats(itemElement, item) {
    const statsDiv = document.createElement('div');
    statsDiv.className = 'item-stats';
    
    const stats = [];
    
    if (item.damage) {
        let damage = item.damage;
        if (item.damageMultiplier) {
            damage *= item.damageMultiplier;
        }
        stats.push(`<span class="stat-damage">Damage: ${damage}</span>`);
    }
    if (item.cooldown) {
        stats.push(`Cooldown: ${item.cooldown}s`);
    }
    if (item.multicast && item.multicast > 1) {
        stats.push(`Multicast: ${item.multicast}`);
    }
    if (item.crit) {
        stats.push(`Crit Chance: ${item.crit * 100}%`);
    }
    if (item.critMultiplier == 3) {
        stats.push(`Double Crit Damage`);
    }
    if (item.critMultiplier == 4) {
        stats.push(`Triple Crit Damage`);
    }
    if (item.critMultiplier == 5) {
        stats.push(`Quadruple Crit Damage`);
    }

    if (item.shield) {
        stats.push(`<span class="stat-shield">Shield: ${item.shieldAmount}</span>`);
    }
    if (item.heal) {
        stats.push(`<span class="stat-heal">Heal: ${item.healAmount}</span>`);
    }
    if (item.poison) {
        stats.push(`<span class="stat-effect">Poison: ${item.poison}</span>`);
    }
    if (item.burn) {
        stats.push(`<span class="stat-effect">Burn: ${item.burn}</span>`);
    }
    if (item.slowTargets) {
        stats.push(`<span class="stat-effect">Slow: ${item.slowTargets} target(s) for ${item.slowDuration}s</span>`);
    }
    if (item.freezeTargets) {
        stats.push(`<span class="stat-effect">Freeze: ${item.freezeTargets} target(s) for ${item.freezeDuration}s</span>`);
    }
    if (item.hasteTargets) {
        stats.push(`<span class="stat-effect">Haste: ${item.hasteTargets} target(s) for ${item.hasteDuration}s</span>`);
    }

    statsDiv.innerHTML = stats.join('\n');
    itemElement.appendChild(statsDiv);
}

function markOccupiedSlots(boardClass, slotIndex, itemSize) {
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

export function highlightAdjacentSlots(slotIndex) {
    document.querySelectorAll('.slot.adjacent-highlight')
        .forEach(slot => slot.classList.remove('adjacent-highlight'));
    
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
