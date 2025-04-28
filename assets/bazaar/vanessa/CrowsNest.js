import { baseItem } from '../../../js/baseItem.js';

const CrowsNest = {
    ...baseItem,
    name: "Crow's Nest",
    type: ["Property", "Aquatic"],
    size: 3,
    currentTier: "Bronze",
    image: "./assets/images/CrowsNest.webp",
    
    tiers: {
        Bronze: {
            value: 3,
            critChance: 0.2
        },
        Silver: {
            value: 6,
            critChance: 0.4
        },
        Gold: {
            value: 12,
            critChance: 0.6
        },
        Diamond: {
            value: 24,
            critChance: 0.8
        }
    },

    passive: "If you have exactly one Weapon, that Weapon has lifesteal.",

    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                onCrit: {
                    slowTargets: 1,
                    slowDuration: 4
                }
            }
        },
        icy: {
            name: "Icy",
            effect: {
                onCrit: {
                    freezeTargets: 1,
                    freezeDuration: 2,
                    freezeSize: "small"
                }
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                onCrit: {
                    hasteTargets: 1,
                    hasteDuration: 4
                }
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                onCrit: {
                    shield: 40
                }
            }
        },
        restorative: {
            name: "Restorative",
            effect: {
                onCrit: {
                    heal: 60
                }
            }
        },
        toxic: {
            name: "Toxic",
            effect: {
                onCrit: {
                    poison: 4
                }
            }
        },
        fiery: {
            name: "Fiery",
            effect: {
                onCrit: {
                    burn: 6
                }
            }
        },
        shiny: {
            name: "Shiny",
            effect: {
                lifestealCondition: "twoOrLessWeapons"
            }
        },
        deadly: {
            name: "Deadly",
            effect: {
                weaponCritDamageMultiplier: 2
            }
        },
        radiant: {
            name: "Radiant",
            effect: {
                immuneToFreeze: true,
                immuneToSlow: true,
                immuneToDestroy: true
            }
        },
        obsidian: {
            name: "Obsidian",
            effect: {
                weaponDamageBonus: 30
            }
        }
    }
};

export default CrowsNest; 