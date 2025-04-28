import { baseItem } from './baseItem.js';
import { cloneDeep } from './utils.js';

// Import individual item files
// Monster items
import CrusherClaw from '../assets/bazaar/monsters/CrusherClaw.js';
import Coconut from '../assets/bazaar/monsters/Coconut.js';
import Scrap from '../assets/bazaar/monsters/Scrap.js';
import MedKit from '../assets/bazaar/monsters/MedKit.js';
import GearnolaBar from '../assets/bazaar/monsters/GearnolaBar.js';
import JunkyardClub from '../assets/bazaar/monsters/JunkyardClub.js';
import JunkyardRepairbot from '../assets/bazaar/monsters/JunkyardRepairbot.js';
import TuskedHelm from '../assets/bazaar/monsters/TuskedHelm.js';
import OldSword from '../assets/bazaar/monsters/OldSword.js';
import Hatchet from '../assets/bazaar/monsters/Hatchet.js';
import ShoeBlade from '../assets/bazaar/monsters/ShoeBlade.js';
import Lumboars from '../assets/bazaar/monsters/Lumboars.js';
import SharpeningStone from '../assets/bazaar/monsters/SharpeningStone.js';
import BarbedWire from '../assets/bazaar/monsters/BarbedWire.js';

// Vanessa items
import Seashell from '../assets/bazaar/vanessa/Seashell.js';
import Cove from '../assets/bazaar/vanessa/Cove.js';
import Katana from '../assets/bazaar/vanessa/Katana.js';
import Cutlass from '../assets/bazaar/vanessa/Cutlass.js';
import Grenade from '../assets/bazaar/vanessa/Grenade.js';
import Trebuchet from '../assets/bazaar/vanessa/Trebuchet.js';
import Lighter from '../assets/bazaar/vanessa/Lighter.js';
import Ambergris from '../assets/bazaar/vanessa/Ambergris.js';
import Barrel from '../assets/bazaar/vanessa/Barrel.js';
import Bayonet from '../assets/bazaar/vanessa/Bayonet.js';
import BeachBall from '../assets/bazaar/vanessa/BeachBall.js';
import Bolas from '../assets/bazaar/vanessa/Bolas.js';
import Calico from '../assets/bazaar/vanessa/Calico.js';

// Mak items
import InfinitePotion from '../assets/bazaar/mak/InfinitePotion.js';
import Incense from '../assets/bazaar/mak/Incense.js';
import FrostPotion from '../assets/bazaar/mak/FrostPotion.js';
import RainbowPotion from '../assets/bazaar/mak/RainbowPotion.js';

// Helper function to create tiered versions of items
function createTieredItem(baseItem, tier) {
  if (!baseItem) return null;
  
  const tieredItem = cloneDeep(baseItem);
  
  // Set the tier in the appropriate property
  if (tieredItem.currentTier !== undefined) {
    tieredItem.currentTier = tier;
  } else {
    tieredItem.tier = tier;
  }
  
  return tieredItem;
}

// Create tier-specific versions of items needed for monster builds
const SilverSeashell = createTieredItem(Seashell, "Silver");
const GoldCoconut = createTieredItem(Coconut, "Gold");
const GoldScrap = createTieredItem(Scrap, "Gold");
const SilverJunkyardClub = createTieredItem(JunkyardClub, "Silver");
const SilverJunkyardRepairbot = createTieredItem(JunkyardRepairbot, "Silver");
const SilverBarbedWire = createTieredItem(BarbedWire, "Silver");
const GoldMedKit = createTieredItem(MedKit, "Gold");

// Create tier handler that automatically creates tiered versions of items
const createTierHandler = {
    get(target, prop) {
        if (typeof prop !== 'string') return target[prop];
        
        const tierPrefixes = ['Bronze', 'Silver', 'Gold', 'Diamond'];
        for (const prefix of tierPrefixes) {
            if (prop.startsWith(prefix)) {
                const itemName = prop.slice(prefix.length);
                const item = target[itemName];
                if (item) {
                    return createTieredItem(item, prefix);
                }
            }
        }
        return target[prop];
    }
};

// Create the items database with the proxy
const items = {
    Coconut,
    Scrap,
    MedKit,
    GearnolaBar,
    JunkyardClub,
    JunkyardRepairbot,
    Seashell,
    BarbedWire,
    OldSword,
    TuskedHelm,
    Hatchet,
    ShoeBlade,
    Lumboars,
    SharpeningStone
};

const tieredItems = new Proxy(items, createTierHandler);

// Database of all available items and their properties
const bazaar = {
    items: [
        // Vanessa items
        Seashell,
        Cove,
        Katana,
        Cutlass,
        BarbedWire,
        Grenade,
        Trebuchet,
        Lighter,
        Ambergris,
        Barrel,
        Bayonet,
        BeachBall,
        Bolas,
        Calico,
        
        // Monster items
        CrusherClaw,
        Coconut,
        Scrap,
        MedKit,
        GearnolaBar,
        JunkyardClub,
        JunkyardRepairbot,
        Hatchet,
        ShoeBlade,
        Lumboars,
        SharpeningStone,
        TuskedHelm,
        OldSword,
        
        // Mak items
        InfinitePotion,
        Incense,
        FrostPotion,
        RainbowPotion
    ],

    searchItems(query) {
        if (!query) return this.items;
        
        const lowerQuery = query.toLowerCase();
        return this.items.filter(item => {
            // Add more robust search criteria
            return (
                item.name.toLowerCase().includes(lowerQuery) || 
                (item.type && item.type.toLowerCase().includes(lowerQuery)) ||
                (item.tier && item.tier.toLowerCase().includes(lowerQuery)) ||
                (item.currentTier && item.currentTier.toLowerCase().includes(lowerQuery))
            );
        });
    }
};

const coconutCrabBuild = {
    name: "Coconut Crab",
    health: 200,
    slots: [
        null,
        null,
        null,
        tieredItems.GoldCoconut,
        CrusherClaw,
        null,
        tieredItems.SilverSeashell,
        null,
        null,
        null
    ]
};

const rogueScrapper = {
    name: "Rogue Scrapper",
    health: 450,
    slots: [
        null,
        tieredItems.GoldScrap,
        GearnolaBar,
        tieredItems.SilverJunkyardClub,
        null,
        tieredItems.SilverJunkyardRepairbot,
        null,
        tieredItems.SilverBarbedWire,
        tieredItems.GoldMedKit,
        null
    ]
};

const boarrior = {
    name: "Boarrior",
    health: 300,
    slots: [
        null,
        tieredItems.SilverScrap,
        TuskedHelm,
        tieredItems.SilverOldSword,
        tieredItems.SilverHatchet,
        tieredItems.SilverShoeBlade,
        Lumboars,
        null, // Occupied by Lumboars (size 2)
        SharpeningStone,
        null
    ]
};

export { 
    bazaar, 
    coconutCrabBuild,
    rogueScrapper,
    boarrior,
    tieredItems
};
