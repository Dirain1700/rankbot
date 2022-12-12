export interface Species {
    /**
     * Number. Note this is National Dex Number.
     */
    num: number;
    /**
     * Name. Note that this is the full name with forme,
     * e.g. 'Basculin-Blue-Striped'. To get the name without forme, see
     * `species.baseSpecies`.
     */
    name: string;
    /**
     * Generation. Any one of 1 to 8. Possibly undefined.
     */
    gen?: number & (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8);
    /**
     * Base species. Species, but without the forme name.
     *
     * DO NOT ASSUME A POKEMON CAN TRANSFORM FROM `baseSpecies` TO
     * `species`. USE `changesFrom` FOR THAT.
     */
    baseSpecies?: string;
    /**
     * Forme name. If the forme exists,
     * `species.name === species.baseSpecies + '-' + species.forme`
     *
     * The games make a distinction between Forme (foorumu) (legendary Pokémon)
     * and Form (sugata) (non-legendary Pokémon). PS does not use the same
     * distinction – they're all "Forme" to PS, reflecting current community
     * use of the term.
     *
     * This property only tracks non-cosmetic formes, and will be `''` for
     * cosmetic formes.
     */
    forme?: string;
    /**
     * Base forme name (e.g. 'Altered' for Giratina).
     */
    baseForme?: string;
    /**
     * Other forms. List of names of cosmetic forms. These should have
     * `aliases.js` aliases to this entry, but not have their own
     * entry in `pokedex.js`.
     */
    cosmeticFormes?: string[];
    /**
     * Other formes. List of names of formes, appears only on the base
     * forme. Unlike forms, these have their own entry in `pokedex.js`.
     */
    otherFormes?: string[];
    /**
     * List of forme speciesNames in the order they appear in the game data -
     * the union of baseSpecies, otherFormes and cosmeticFormes. Appears only on
     * the base species forme.
     *
     * A species's alternate formeindex may change from generation to generation -
     * the forme with index N in Gen A is not guaranteed to be the same forme as the
     * forme with index in Gen B.
     *
     * Gigantamaxes are not considered formes by the game (see data/FORMES.md - PS
     * labels them as such for convenience) - Gigantamax "formes" are instead included at
     * the end of the formeOrder list so as not to interfere with the correct index numbers.
     */
    formeOrder?: string[];
    /**
     * Sprite ID. Basically the same as ID, but with a dash between
     * species and forme.
     */
    spriteid?: string;
    /** Abilities. */
    abilities: SpeciesAbility;
    /** Types. */
    types: string[];
    /** Added type (added by Trick-Or-Treat or Forest's Curse, but only listed in species by OMs). */
    addedType?: string;
    /** Pre-evolution. '' if nothing evolves into this Pokemon. */
    prevo?: string;
    /** Evolutions. Array because many Pokemon have multiple evolutions. */
    evos?: string[];
    evoType?: "trade" | "useItem" | "levelMove" | "levelExtra" | "levelFriendship" | "levelHold" | "other";
    /** Evolution condition. falsy if doesn't evolve. */
    evoCondition?: string;
    /** Evolution item. falsy if doesn't evolve. */
    evoItem?: string;
    /** Evolution move. falsy if doesn't evolve. */
    evoMove?: string;
    /** Region required to be in for evolution. falsy if doesn't evolve. */
    evoRegion?: "Alola" | "Galar";
    /** Evolution level. falsy if doesn't evolve. */
    evoLevel?: number;
    /** Is NFE? True if this Pokemon can evolve (Mega evolution doesn't count). */
    nfe?: boolean;
    /** Egg groups. */
    eggGroups: string[];
    /** True if this species can hatch from an Egg. */
    canHatch?: boolean;
    /**
     * Gender. M = always male, F = always female, N = always
     * genderless, '' = sometimes male sometimes female.
     */
    gender?: GenderName;
    /** Gender ratio. Should add up to 1 unless genderless. */
    genderRatio?: { M: number; F: number };
    /** Base stats. */
    baseStats: StatsTable;
    /** Max HP. Overrides usual HP calculations (for Shedinja). */
    maxHP?: number;
    /** A Pokemon's Base Stat Total */
    bst?: number;
    /** Weight (in kg). Not valid for OMs; use weighthg / 10 instead. */
    weightkg: number;
    /** Weight (in integer multiples of 0.1kg). */
    weighthg?: number;
    /** Height (in m). */
    heightm: number;
    /** Color. */
    color: string;
    /**
     * Tags, boolean data. Currently just legendary/mythical status.
     */
    tags?: SpeciesTag[];
    /** Does this Pokemon have an unreleased hidden ability? */
    unreleasedHidden?: boolean | "Past";
    /**
     * Is it only possible to get the hidden ability on a male pokemon?
     * This is mainly relevant to Gen 5.
     */
    maleOnlyHidden?: boolean;
    /** True if a pokemon is mega. */
    isMega?: boolean;
    /** True if a pokemon is primal. */
    isPrimal?: boolean;
    /** Name of its Gigantamax move, if a pokemon is capable of gigantamaxing. */
    canGigantamax?: string;
    /** If this Pokemon can gigantamax, is its gigantamax released? */
    gmaxUnreleased?: boolean;
    /** True if a Pokemon species is incapable of dynamaxing */
    cannotDynamax?: boolean;
    /** What it transforms from, if a pokemon is a forme that is only accessible in battle. */
    battleOnly?: string | string[];
    /** Required item. Do not use this directly; see requiredItems. */
    requiredItem?: string;
    /** Required move. Move required to use this forme in-battle. */
    requiredMove?: string;
    /** Required ability. Ability required to use this forme in-battle. */
    requiredAbility?: string;
    /**
     * Required items. Items required to be in this forme, e.g. a mega
     * stone, or Griseous Orb. Array because Arceus formes can hold
     * either a Plate or a Z-Crystal.
     */
    requiredItems?: string[];

    /**
     * Formes that can transform into this Pokemon, to inherit learnsets
     * from. (Like `prevo`, but for transformations that aren't
     * technically evolution. Includes in-battle transformations like
     * Zen Mode and out-of-battle transformations like Rotom.)
     *
     * Not filled out for megas/primals - fall back to baseSpecies
     * for in-battle formes.
     */
    changesFrom?: string;

    /**
     * Singles Tier. The Pokemon's location in the Smogon tier system.
     */
    tier?: string;
    /**
     * Doubles Tier. The Pokemon's location in the Smogon doubles tier system.
     */
    doublesTier?: string;
    /**
     * National Dex Tier. The Pokemon's location in the Smogon National Dex tier system.
     */
    natDexTier?: string;
}

export interface SpeciesAbility {
    0: string;
    1?: string;
    H?: string;
    S?: string;
}

export interface StatsTable {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
}

export type GenderName = "M" | "F" | "N";

export type SpeciesTag = "Mythical" | "Restricted Legendary" | "Sub-Legendary";

export type EvoType = "trade" | "useItem" | "levelMove" | "levelExtra" | "levelFriendship" | "levelHold" | "other";
