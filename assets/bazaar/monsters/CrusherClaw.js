import { baseItem } from '../../../js/baseItem.js';

const CrusherClaw = {
    ...baseItem,
    name: "Crusher Claw",
    type: "Aquatic",
    tier: "Silver",
    cost: 10,
    cooldown: 2,
    size: 2,
    trigger: "Cooldown",
    target: "enemy",
    damage: 0,
    shield: true,
    shieldAmount: 15,
    shieldBonus: 5,
    passive: "Shield items gain +5 shield. Deal damage equal to your highest shield value.",
    
    image: "assets/images/CrusherClaw.webp",
    
    enchantmentEffects: {
        heavy: {
            name: "Heavy",
            effect: {
                damageMultiplier: 3,
                cooldown: 3
            }
        },
        turbo: {
            name: "Turbo",
            effect: {
                cooldown: 1
            }
        },
        icy: {
            name: "Icy",
            effect: {
                freezeTargets: 1,
                freezeDuration: 2
            }
        },
        shielded: {
            name: "Shielded",
            effect: {
                scalingType: "equal",
                scaler: "shieldAmount",
                shield: true,
                shieldAmount: 0
            }
        }
    }
};

export default CrusherClaw;
