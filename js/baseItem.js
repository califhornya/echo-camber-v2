const baseItem = {
    name: "null",
    type: "null",
    tier: "Bronze",
    cooldown: 0,
    size: 1,
    trigger: "Cooldown",
    target: "enemy",

    damage: 0,
    poison: 0,
    burn: 0,
    heal: false,
    shield: false,

    freeze: false,
    freezeDuration: 0,
    freezeTargets: 0,
    nextUnfreeze: null,

    slow: false,
    slowDuration: 0,
    slowTargets: 0,

    haste: false,
    hasteDuration: 0,
    hasteTargets: 0,

    crit: 0,
    multicast: 0,
    nextTrigger: 0,

    ammo: 0,        // Default 0 means unlimited ammo
    maxAmmo: 0,     // Maximum ammo capacity
    critDamage: 2,  // Default crit multiplier is 2x
    enchantment: null,

    image: null,
};

export { baseItem }; // Export baseItem