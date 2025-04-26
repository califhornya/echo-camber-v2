export function cloneDeep(obj) {
    // Handle non-objects
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Create new object/array
    const clone = Array.isArray(obj) ? [] : {};

    // Copy all properties
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // If it's a function, bind it to the clone
            if (typeof obj[key] === 'function') {
                clone[key] = obj[key].bind(clone);
            } else {
                clone[key] = cloneDeep(obj[key]);
            }
        }
    }

    return clone;
}

export function countAquaticItems(items) {
    const count = items.filter(item => 
        item && item.type === "Aquatic"
    ).length;
    return count;
}

export function getHighestShieldValue(items) {
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
    
    return shieldValues.length > 0 ? Math.max(...shieldValues) : 0;
} 