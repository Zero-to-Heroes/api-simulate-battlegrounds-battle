import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { getRaceEnum, hasMechanic } from '../utils';

const REMOVED_CARD_IDS = [
	'GVG_085', // Annoy-o-Tron
	'BGS_025', // Mounted Raptor
	'GIL_681', // Nightmare Amalgam
	'GVG_058', // Shielded Minibot
	'ULD_179', // Phallanx Commander
	'OG_145', // Psych-o-Tron
	'UNG_037', // Tortollian Shellraiser
	'GIL_655', // Festeroot Hulk
	'BGS_024', // Piloted Sky Golem
	'UNG_010', // Sated Threshadon
	'OG_300', // Boogeymonster
	CardIds.Collectible.Neutral.Zoobot,
	CardIds.NonCollectible.Neutral.ZoobotTavernBrawl,
	CardIds.Collectible.Neutral.MenagerieMagician,
	CardIds.NonCollectible.Neutral.MenagerieMagicianTavernBrawl,
	CardIds.Collectible.Paladin.CobaltGuardian,
	CardIds.NonCollectible.Neutral.GentleMegasaur,
	CardIds.NonCollectible.Neutral.GentleMegasaurTavernBrawl,
	CardIds.NonCollectible.Neutral.NatPagleExtremeAngler_TreasureChestToken,
	CardIds.NonCollectible.Neutral.NatPagleExtremeAngler_TreasureChestTokenTavernBrawl,
];

export class CardsData {
	public static CARDS_WITH_NO_BACONUP_VERSION = [
		CardIds.Collectible.Paladin.RighteousProtector,
		CardIds.Collectible.Warlock.VulgarHomunculus,
		CardIds.NonCollectible.Neutral.DragonspawnLieutenant,
		CardIds.NonCollectible.Neutral.BronzeWarden,
		CardIds.NonCollectible.Neutral.YoHoOgre,
		CardIds.Collectible.Hunter.CaveHydra,
		CardIds.Collectible.Neutral.Toxfin,
		CardIds.Collectible.Neutral.FoeReaper4000,
		CardIds.Collectible.Neutral.Maexxna,
		CardIds.NonCollectible.Paladin.HolyMackerel,
		CardIds.NonCollectible.Neutral.NadinaTheRed,
	];

	public shredderSpawns: readonly string[];
	public ghastcoilerSpawns: readonly string[];
	public impMamaSpawns: readonly string[];
	public gentleDjinniSpawns: readonly string[];
	public sneedsSpawns: readonly string[];
	// public treasureChestSpawns: readonly string[];
	public pirateSpawns: readonly string[];

	public auraEnchantments: readonly string[][];
	public auraOrigins: readonly string[];
	public startOfCombats: readonly string[];

	constructor(private readonly allCards: AllCardsService, init = true) {
		if (init) {
			this.inititialize();
		}
	}

	public inititialize(validTribes?: readonly Race[]) {
		this.shredderSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.cost === 2)
			.filter(card => this.isValidTribe(validTribes, card.race))
			.map(card => card.id);
		this.ghastcoilerSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.id !== 'BGS_008')
			.filter(card => hasMechanic(card, 'DEATHRATTLE'))
			.filter(card => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.filter(card => this.isValidTribe(validTribes, card.race))
			.map(card => card.id);
		this.impMamaSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.race === 'DEMON')
			.filter(card => card.id !== CardIds.NonCollectible.Warlock.ImpMama)
			.filter(card => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map(card => card.id);
		this.gentleDjinniSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.race === 'ELEMENTAL')
			.filter(card => card.id !== CardIds.NonCollectible.Neutral.GentleDjinni)
			.filter(card => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map(card => card.id);
		this.sneedsSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.id !== 'GVG_114' && card.id !== 'BGS_006')
			.filter(card => card.rarity === 'Legendary')
			.filter(card => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.filter(card => this.isValidTribe(validTribes, card.race))
			.map(card => card.id);
		// this.treasureChestSpawns = this.allCards
		// 	.getCards()
		// 	.filter(card => card.techLevel)
		// 	.filter(
		// 		card => card.id.startsWith('TB_BaconUps') || CardsData.CARDS_WITH_NO_BACONUP_VERSION.includes(card.id),
		// 	) // Only golden
		// 	.filter(card => this.isValidTribe(validTribes, card.race))
		// 	.map(card => card.id);
		this.pirateSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.race === 'PIRATE')
			.map(card => card.id);
		// console.log('initialized cards data', this);
		// Auras are effects that are permanent (unlike deathrattles or "whenever" effects)
		// and that stop once the origin entity leaves play (so it doesn't include buffs)
		this.auraEnchantments = [
			[
				CardIds.Collectible.Neutral.DireWolfAlpha,
				CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantment,
			],
			[
				CardIds.NonCollectible.Neutral.DireWolfAlphaTavernBrawl,
				CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantmentTavernBrawl,
			],
			[
				CardIds.Collectible.Warlock.Siegebreaker,
				CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantment,
			],
			[
				CardIds.NonCollectible.Warlock.SiegebreakerTavernBrawl,
				CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentTavernBrawl,
			],
			[CardIds.Collectible.Warlock.Malganis, CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantment],
			[
				CardIds.NonCollectible.Warlock.MalganisTavernBrawl,
				CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantmentTavernBrawl,
			],
			[
				CardIds.Collectible.Neutral.MurlocWarleader,
				CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantment,
			],
			[
				CardIds.NonCollectible.Neutral.MurlocWarleaderTavernBrawl,
				CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentTavernBrawl,
			],
			[
				CardIds.Collectible.Neutral.SouthseaCaptain,
				CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantment,
			],
			[
				CardIds.NonCollectible.Neutral.SouthseaCaptainTavernBrawl,
				CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentTavernBrawl,
			],
			[
				CardIds.NonCollectible.Neutral.WhirlwindTempest,
				CardIds.NonCollectible.Neutral.WhirlwindTempest_Enchantment,
			],
		];
		this.auraOrigins = this.auraEnchantments.map(pair => pair[0]);
		this.startOfCombats = [
			CardIds.NonCollectible.Neutral.RedWhelp,
			CardIds.NonCollectible.Neutral.RedWhelpTavernBrawl,
		];
	}

	private isValidTribe(validTribes: readonly Race[], race: string): boolean {
		const raceEnum: Race = getRaceEnum(race);
		return raceEnum === Race.ALL || !validTribes || validTribes.length === 0 || validTribes.includes(raceEnum);
	}
}
