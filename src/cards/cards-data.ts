import { AllCardsService, CardIds, isBattlegroundsCard, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { getRaceEnum, hasMechanic } from '../utils';

export class CardsData {
	public static CARDS_WITH_NO_BACONUP_VERSION = [
		CardIds.BronzeWarden,
		CardIds.YoHoOgre,
		CardIds.CaveHydra,
		CardIds.FoeReaper4000,
		CardIds.Maexxna1,
	];

	// public shredderSpawns: readonly string[];
	public ghastcoilerSpawns: readonly string[];
	public validDeathrattles: readonly string[];
	public impMamaSpawns: readonly string[];
	public gentleDjinniSpawns: readonly string[];
	// public sneedsSpawns: readonly string[];
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
			.filter((card) => !this.isGolden(card))
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
			.filter((card) => !this.isGolden(card))
			.filter((card) => card.race === 'DEMON')
			.filter((card) => card.id !== CardIds.ImpMama)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.gentleDjinniSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => card.race === 'ELEMENTAL')
			.filter((card) => card.id !== CardIds.GentleDjinni)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.pirateSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => card.race === 'PIRATE')
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		// Auras are effects that are permanent (unlike deathrattles or "whenever" effects)
		// and that stop once the origin entity leaves play (so it doesn't include buffs)
		this.auraEnchantments = [
			[CardIds.Siegebreaker_SiegebreakingLegacyEnchantment],
			[CardIds.SiegebreakerBattlegrounds, CardIds.Siegebreaker_SiegebreakingEnchantmentBattlegrounds],
			[CardIds.Malganis_GraspOfMalganisEnchantment],
			[CardIds.MalganisBattlegrounds, CardIds.Malganis_GraspOfMalganisEnchantmentBattlegrounds],
			[CardIds.Kathranatir_GraspOfKathranatirEnchantment1],
			[CardIds.KathranatirBattlegrounds, CardIds.Kathranatir_GraspOfKathranatirEnchantment2],
			[CardIds.MurlocWarleader_MrgglaarglLegacyEnchantment],
			[CardIds.MurlocWarleaderBattlegrounds, CardIds.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds],
			[CardIds.SouthseaCaptain_YarrrLegacyEnchantment],
			[CardIds.SouthseaCaptainBattlegrounds, CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds],
		];
		this.auraOrigins = this.auraEnchantments.map((pair) => pair[0]);
		this.startOfCombats = [
			CardIds.RedWhelp,
			CardIds.RedWhelpBattlegrounds,
			CardIds.PrizedPromoDrake,
			CardIds.PrizedPromoDrakeBattlegrounds,
		];
	}

	public avengeValue(cardId: string): number {
		switch (cardId) {
			case CardIds.BirdBuddy:
			case CardIds.BirdBuddyBattlegrounds:
				return 1;
			case CardIds.PalescaleCrocolisk:
			case CardIds.PalescaleCrocoliskBattlegrounds:
			case CardIds.MechanoTank:
			case CardIds.MechanoTankBattlegrounds:
				return 2;
			case CardIds.Sisefin:
			case CardIds.SisefinBattlegrounds:
			case CardIds.BuddingGreenthumb:
			case CardIds.BuddingGreenthumbBattlegrounds:
				return 3;
			case CardIds.ImpatientDoomsayer:
			case CardIds.ImpatientDoomsayerBattlegrounds:
			case CardIds.WitchwingNestmatron:
			case CardIds.WitchwingNestmatronBattlegrounds:
				return 4;
			case CardIds.TonyTwoTusk:
			case CardIds.TonyTwoTuskBattlegrounds:
				return 5;
		}
		return 0;
	}

	private isGolden(card: ReferenceCard): boolean {
		return !!card.battlegroundsNormalDbfId;
	}

	private isValidTribe(validTribes: readonly Race[], race: string): boolean {
		const raceEnum: Race = getRaceEnum(race);
		return raceEnum === Race.ALL || !validTribes || validTribes.length === 0 || validTribes.includes(raceEnum);
	}
}
