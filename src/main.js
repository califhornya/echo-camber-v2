import { baseItem } from './baseItem.js';
import { renderBoard, renderItem, highlightAdjacentSlots, renderSearchResults } from './render.js';
import { testDatabase, monsterBuild } from './database.js';
import { CombatSimulator } from './combat.js';

window.playerBoard = Array(10).fill(null);  // This will be our single source of truth

const state = {
    get slots() { return window.playerBoard; },
    set slots(value) { window.playerBoard = value; },
    usedSlots: 0
};

function init() {
    renderBoard('monster-board', true);
    renderBoard('player-board', false);
    setupEventListeners();
}

function canPlaceItem(item, startSlot) {
    const size = item.size;
    
    // Check if there's enough space
    if (startSlot + size > 10) return false;
    
    // Check if any of the required slots are occupied
    for (let i = 0; i < size; i++) {
        if (state.slots[startSlot + i] !== null) return false;
    }
    
    return true;
}

function placeItem(item, startSlot) {
    if (!canPlaceItem(item, startSlot)) return false;
    
    // Place the item
    for (let i = 0; i < item.size; i++) {
        state.slots[startSlot + i] = item;
    }
    state.usedSlots += item.size;
    
    // Render the item
    renderItem(item, startSlot, 'player-board');
    return true;
}

function handleSearch(e) {
    const query = e.target.value.trim();
    console.log('Search query:', query);
    
    const results = testDatabase.searchItems(query);
    console.log('Search results:', results);
    
    renderSearchResults(results, handleItemSelect);
}

function handleItemSelect(item) {
    const slotIndex = findLeftmostEmptySlot(item.size);
    
    if (slotIndex !== -1) {
        // Place the item in the global state
        for (let i = 0; i < item.size; i++) {
            window.playerBoard[slotIndex + i] = item;
        }
        
        // Render the item
        renderItem(item, slotIndex, 'player-board');
        
        // Clear search input and results after placing
        const searchInput = document.getElementById('search-input');
        searchInput.value = '';
        document.getElementById('search-results').style.display = 'none';
    } else {
        alert("Not enough space for this item!");
    }
}

function setupEventListeners() {
    const playerBoard = document.querySelector('.player-board');
    const searchInput = document.getElementById('search-input');
    const simulateButton = document.getElementById('simulate-combat');
    
    // Add combat simulation handler
    simulateButton.addEventListener('click', handleCombatSimulation);
    
    // Board events
    playerBoard.addEventListener('mouseover', (e) => {
        const slot = e.target.closest('.slot');
        if (slot) {
            const index = parseInt(slot.dataset.index);
            highlightAdjacentSlots(index);
        }
    });
    
    playerBoard.addEventListener('mouseout', () => {
        document.querySelectorAll('.slot.adjacent-highlight')
            .forEach(slot => slot.classList.remove('adjacent-highlight'));
    });
    
    // Search events
    searchInput.addEventListener('input', handleSearch);
    
    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            document.getElementById('search-results').style.display = 'none';
        }
    });
}

function handleCombatSimulation() {
    const simulator = new CombatSimulator(state.slots, monsterBuild);
    const results = simulator.simulateFight(1); // Run just 1 simulation for now to check logs
    
    // Display results
    const resultsDiv = document.getElementById('combat-results');
    resultsDiv.innerHTML = `
        <div class="combat-summary">
            <h3>Combat Results</h3>
            <p>Wins: ${results.wins}</p>
            <p>Losses: ${results.losses}</p>
            <p>Win Rate: ${results.winRate.toFixed(1)}%</p>
        </div>
    `;

    // Display logs
    simulator.displayLogs();
}

// For testing purposes
function addTestItem() {
    const testItem = {
        ...baseItem,
        name: "Test Item",
        size: 2,
        type: "Weapon"
    };
    placeItem(testItem, 0);
}

// Update findLeftmostEmptySlot to use state.slots instead of window.playerBoard
function findLeftmostEmptySlot(itemSize = 1) {
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

init();
// Uncomment to test: addTestItem();
