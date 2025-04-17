import { baseItem } from './baseItem.js';
import { renderBoard, renderItem, highlightAdjacentSlots, renderSearchResults } from './render.js';
import { testDatabase, monsterBuild } from './database.js';
import { CombatSimulator } from './combat.js';

window.playerBoard = Array(10).fill(null);

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
    if (startSlot + size > 10) return false;
    
    for (let i = 0; i < size; i++) {
        if (state.slots[startSlot + i] !== null) return false;
    }
    
    return true;
}

function placeItem(item, startSlot) {
    if (!canPlaceItem(item, startSlot)) return false;
    
    for (let i = 0; i < item.size; i++) {
        state.slots[startSlot + i] = item;
    }
    state.usedSlots += item.size;
    
    renderItem(item, startSlot, 'player-board');
    return true;
}

function handleSearch(e) {
    const query = e.target.value.trim();
    const results = query ? testDatabase.searchItems(query) : testDatabase.items;
    renderSearchResults(results, handleItemSelect);
}

function handleItemSelect(item) {
    const slotIndex = findLeftmostEmptySlot(item.size);
    
    if (slotIndex !== -1) {
        const itemCopy = JSON.parse(JSON.stringify(item));
        
        for (let i = 0; i < item.size; i++) {
            window.playerBoard[slotIndex + i] = itemCopy;
        }
        
        renderItem(itemCopy, slotIndex, 'player-board');
        
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
    
    simulateButton.addEventListener('click', handleCombatSimulation);
    
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
    
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', handleSearch);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            document.getElementById('search-results').style.display = 'none';
        }
    });
}

function handleCombatSimulation() {
    const simulator = new CombatSimulator(state.slots, monsterBuild);
    const results = simulator.simulateFight(1);
    
    const resultsDiv = document.getElementById('combat-results');
    resultsDiv.innerHTML = `
        <div class="combat-summary">
            <h3>Combat Results</h3>
            <p>Wins: ${results.wins}</p>
            <p>Losses: ${results.losses}</p>
            <p>Win Rate: ${results.winRate.toFixed(1)}%</p>
        </div>
    `;

    simulator.displayLogs();
}

function findLeftmostEmptySlot(itemSize = 1) {
    for (let i = 0; i < window.playerBoard.length; i++) {
        let canFit = true;
        for (let j = 0; i + j < window.playerBoard.length && j < itemSize; j++) {
            if (window.playerBoard[i + j] !== null) {
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

function handleOrientationChange() {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const rotateMessage = document.querySelector('.rotate-message');
    const container = document.querySelector('.container');

    if (isLandscape) {
        rotateMessage.style.display = 'none';
        container.style.display = 'flex';
    } else {
        rotateMessage.style.display = 'flex';
        container.style.display = 'none';
    }
}

window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('load', handleOrientationChange);

init();
