import { AllCardsService, CardIds, isBattlegroundsCard, Race } from '@firestone-hs/reference-data';
import { getRaceEnum, hasMechanic } from '../utils';

export class CardsData {
	public static CARDS_WITH_NO_BACONUP_VERSION = [
		CardIds.Collectible.Paladin.RighteousProtector,
		CardIds.NonCollectible.Neutral.DragonspawnLieutenant,
		CardIds.NonCollectible.Neutral.BronzeWarden,
		CardIds.NonCollectible.Neutral.YoHoOgre,
		CardIds.Collectible.Hunter.CaveHydra,
		CardIds.Collectible.Neutral.Toxfin,
		CardIds.Collectible.Neutral.FoeReaper4000,
		CardIds.Collectible.Neutral.Maexxna1,
	];

	// public shredderSpawns: readonly string[];
	public ghastcoilerSpawns: readonly string[];
	public validDeathrattles: readonly string[];
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

	public inititialize(validTribes?: readonly Race[]): void {
		const pool = this.allCards
			.getCards()
			.filter((card) => isBattlegroundsCard(card))
			.filter((card) => card.set !== 'Vanilla');
		this.ghastcoilerSpawns = pool
			.filter((card) => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter((card) => card.id !== 'BGS_008')
			.filter((card) => hasMechanic(card, 'DEATHRATTLE'))
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.filter((card) => this.isValidTribe(validTribes, card.race))
			.map((card) => card.id);
		this.validDeathrattles = pool
			// .filter((card) => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter((card) => hasMechanic(card, 'DEATHRATTLE'))
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.filter((card) => this.isValidTribe(validTribes, card.race))
			.map((card) => card.id);
		this.impMamaSpawns = pool
			.filter((card) => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter((card) => card.race === 'DEMON')
			.filter((card) => card.id !== CardIds.NonCollectible.Warlock.ImpMama)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.gentleDjinniSpawns = pool
			.filter((card) => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter((card) => card.race === 'ELEMENTAL')
			.filter((card) => card.id !== CardIds.NonCollectible.Neutral.GentleDjinni)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.sneedsSpawns = pool
			.filter((card) => this.isValidTribe(validTribes, card.race))
			.filter((card) => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter((card) => card.id !== 'GVG_114' && card.id !== 'BGS_006')
			.filter((card) => card.rarity === 'Legendary')
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.pirateSpawns = pool
			.filter((card) => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter((card) => card.race === 'PIRATE')
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		// Auras are effects that are permanent (unlike deathrattles or "whenever" effects)
		// and that stop once the origin entity leaves play (so it doesn't include buffs)
		this.auraEnchantments = [
			[CardIds.Collectible.Warlock.SiegebreakerLegacy, CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingLegacyEnchantment],
			[
				CardIds.NonCollectible.Warlock.SiegebreakerBattlegrounds,
				CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentBattlegrounds,
			],
			[CardIds.Collectible.Warlock.Malganis1, CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantment],
			[
				CardIds.NonCollectible.Warlock.MalganisBattlegrounds,
				CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantmentBattlegrounds,
			],
			[CardIds.Collectible.Neutral.MurlocWarleaderLegacy, CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglLegacyEnchantment],
			[
				CardIds.NonCollectible.Neutral.MurlocWarleaderBattlegrounds,
				CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds,
			],
			[CardIds.Collectible.Neutral.SouthseaCaptainLegacy, CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrLegacyEnchantment],
			[
				CardIds.NonCollectible.Neutral.SouthseaCaptainBattlegrounds,
				CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentBattlegrounds,
			],
		];
		this.auraOrigins = this.auraEnchantments.map((pair) => pair[0]);
		this.startOfCombats = [CardIds.NonCollectible.Neutral.RedWhelp, CardIds.NonCollectible.Neutral.RedWhelpBattlegrounds];
	}

	private isValidTribe(validTribes: readonly Race[], race: string): boolean {
		const raceEnum: Race = getRaceEnum(race);
		return raceEnum === Race.ALL || !validTribes || validTribes.length === 0 || validTribes.includes(raceEnum);
	}
}
