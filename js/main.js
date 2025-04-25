import { baseItem } from './baseItem.js';
import { renderBoard, renderItem, highlightAdjacentSlots, renderSearchResults, renderPlayerStatsEditor } from './render.js';
import { bazaar, coconutCrabBuild, rogueScrapper, boarrior } from './database.js';
import { CombatSimulator } from './combat.js';

window.playerBoard = Array(10).fill(null);

const state = {
    get slots() { return window.playerBoard; },
    set slots(value) { window.playerBoard = value; },
    usedSlots: 0,
    selectedMonster: coconutCrabBuild, // Default monster
    playerStats: {
        health: 100,  // Default values
        regen: 0,
        shield: 0     // Add shield
    }
};

function init() {
    renderBoard('monster-board', true, state.selectedMonster);
    renderBoard('player-board', false);
    
    // Add stats editor
    const combatSection = document.querySelector('.combat-section');
    const statsEditor = renderPlayerStatsEditor();
    combatSection.insertBefore(statsEditor, document.getElementById('simulate-combat'));
    
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
    const results = query ? bazaar.searchItems(query) : bazaar.items;
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
    
    // Remove this line since we don't have simulateButton anymore
    // const simulateButton = document.getElementById('simulate-combat');
    // simulateButton.addEventListener('click', handleCombatSimulation);
    
    // Add the new simulation button listeners
    document.getElementById('quick-test').addEventListener('click', handleQuickTest);
    document.getElementById('full-analysis').addEventListener('click', handleFullAnalysis);
    
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
    
    // Make sure these search-related event listeners are properly set up
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', handleSearch);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            document.getElementById('search-results').style.display = 'none';
        }
    });

    // Add monster select event listener
    const monsterSelect = document.getElementById('monster-select');
    monsterSelect.addEventListener('change', (e) => {
        changeMonster(e.target.value);
    });
}

function handleCombatSimulation() {
    console.log("Simulate button clicked, creating simulator...");
    
    try {
        // Pass player stats to the simulator
        const simulator = new CombatSimulator(state.slots, state.selectedMonster, state.playerStats);
        console.log("Simulator created, running simulation...");
        
        const results = simulator.simulateFight(1);
        console.log("Simulation complete, displaying results...");
        
        const resultsDiv = document.getElementById('combat-results');
        resultsDiv.innerHTML = `
            <div class="combat-summary">
                <h3>Combat Results vs ${state.selectedMonster.name}</h3>
                <p>Wins: ${results.wins}</p>
                <p>Losses: ${results.losses}</p>
                <p>Win Rate: ${results.winRate.toFixed(1)}%</p>
            </div>
        `;

        simulator.displayLogs();
    } catch (error) {
        console.error("Error in combat simulation:", error);
        alert("There was an error running the combat simulation. Check the console for details.");
    }
}

function handleQuickTest() {
    console.log("Running quick test...");
    const simulator = new CombatSimulator(state.slots, state.selectedMonster, state.playerStats);
    const results = simulator.simulateFight(1);
    displayQuickTestResults(results, simulator);
}

function handleFullAnalysis() {
    console.log("Running full analysis...");
    
    let wins = 0;
    const itemStats = {};
    
    // Initialize item stats tracking
    [...state.slots, ...state.selectedMonster.slots]
        .filter(item => item)
        .forEach(item => {
            const itemKey = item.enchantment ? 
                `${item.enchantmentEffects[item.enchantment].name} ${item.name}` : 
                item.name;
            itemStats[itemKey] = { triggers: 0 };
        });

    // Run 10 simulations exactly like quick tests
    for (let i = 0; i < 10; i++) {
        console.log(`Running simulation ${i + 1}/10`);
        
        // Create a new simulator for each run, just like quick test does
        const simulator = new CombatSimulator(state.slots, state.selectedMonster, state.playerStats);
        const results = simulator.simulateFight(1);
        
        // Count the win
        if (results.wins > 0) {
            wins++;
            console.log(`Simulation ${i + 1}: Victory`);
        } else {
            console.log(`Simulation ${i + 1}: Defeat`);
        }
        
        // Count triggers from this simulation
        simulator.groupedLogs.forEach(timeGroup => {
            timeGroup.actions.forEach(log => {
                if (log.type === 'trigger') {
                    const match = log.message.match(/.*'s (.*) is triggering/);
                    if (match && match[1]) {
                        const fullItemName = match[1].trim();
                        if (itemStats[fullItemName]) {
                            itemStats[fullItemName].triggers++;
                        }
                    }
                }
            });
        });
    }

    console.log("Analysis complete:", {
        wins,
        itemStats
    });

    displayFullAnalysisResults({
        wins,
        totalFights: 10,
        itemStats
    });
}

function displayQuickTestResults(results, simulator) {
    const resultsDiv = document.getElementById('combat-results');
    resultsDiv.innerHTML = `
        <div class="combat-summary">
            <h3>Quick Test Results vs ${state.selectedMonster.name}</h3>
            <p>Outcome: ${results.wins > 0 ? 'Victory!' : 'Defeat'}</p>
        </div>
    `;
    simulator.displayLogs();
}

function displayFullAnalysisResults(results) {
    const resultsDiv = document.getElementById('combat-results');
    const winRate = (results.wins / results.totalFights * 100).toFixed(1);
    
    let itemStatsHtml = '';
    for (const [itemName, stats] of Object.entries(results.itemStats)) {
        const avgTriggers = (stats.triggers / results.totalFights).toFixed(1);
        itemStatsHtml += `
            <tr>
                <td>${itemName}</td>
                <td>${stats.triggers}</td>
                <td>${avgTriggers}</td>
            </tr>
        `;
    }

    resultsDiv.innerHTML = `
        <div class="combat-summary">
            <h3>Full Analysis Results vs ${state.selectedMonster.name}</h3>
            <p>Win Rate: ${winRate}% (${results.wins}/${results.totalFights} fights won)</p>
            
            <h4>Item Performance:</h4>
            <table class="item-stats-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Total Triggers</th>
                        <th>Avg per Fight</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemStatsHtml}
                </tbody>
            </table>
        </div>
    `;
    
    // Clear combat log for full analysis
    document.getElementById('combat-log').innerHTML = '';
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

function changeMonster(monsterKey) {
    switch(monsterKey) {
        case 'coconutCrab':
            state.selectedMonster = coconutCrabBuild;
            break;
        case 'rogueScrapper':
            state.selectedMonster = rogueScrapper;
            break;
        case 'boarrior':
            state.selectedMonster = boarrior;
            break;
        default:
            state.selectedMonster = coconutCrabBuild;
    }
    
    // Update the monster board display
    renderBoard('monster-board', true, state.selectedMonster);
}

// Add new function to handle stats updates
function updatePlayerStats(newStats) {
    state.playerStats = {
        ...state.playerStats,
        ...newStats
    };
}

// Export for use in render.js
export { updatePlayerStats };

init();
