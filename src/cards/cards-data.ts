import {
	AllCardsService,
	CardIds,
	CardType,
	GameTag,
	isBattlegroundsCard,
	NON_BUYABLE_MINION_IDS,
	Race,
	ReferenceCard,
} from '@firestone-hs/reference-data';
import { groupByFunction, pickRandom } from '../services/utils';
import { getRaceEnum, hasMechanic, isCorrectTribe } from '../utils';

export const START_OF_COMBAT_CARD_IDS = [
	CardIds.CorruptedMyrmidon_BG23_012,
	CardIds.CorruptedMyrmidon_BG23_012_G,
	CardIds.Crabby_BG22_HERO_000_Buddy,
	CardIds.Crabby_BG22_HERO_000_Buddy_G,
	CardIds.MantidQueen_BG22_402,
	CardIds.MantidQueen_BG22_402_G,
	CardIds.PrizedPromoDrake_BG21_014,
	CardIds.PrizedPromoDrake_BG21_014_G,
	CardIds.RedWhelp_BGS_019,
	CardIds.RedWhelp_TB_BaconUps_102,
	CardIds.AmberGuardian_BG24_500,
	CardIds.AmberGuardian_BG24_500_G,
	CardIds.InterrogatorWhitemane_BG24_704,
	CardIds.InterrogatorWhitemane_BG24_704_G,
	CardIds.Soulsplitter_BG25_023,
	CardIds.Soulsplitter_BG25_023_G,
	CardIds.ChoralMrrrglr_BG26_354,
	CardIds.ChoralMrrrglr_BG26_354_G,
	CardIds.SanctumRester_BG26_356,
	CardIds.SanctumRester_BG26_356_G,
	CardIds.CarbonicCopy_BG27_503,
	CardIds.CarbonicCopy_BG27_503_G,
	CardIds.HawkstriderHerald_BG27_079,
	CardIds.HawkstriderHerald_BG27_079_G,
	CardIds.AudaciousAnchor_BG28_904,
	CardIds.AudaciousAnchor_BG28_904_G,
	CardIds.DiremuckForager_BG27_556,
	CardIds.DiremuckForager_BG27_556_G,
	CardIds.UpperHand_BG28_573,
	CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy,
	CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy_G,
	CardIds.IrateRooster_BG29_990,
	CardIds.IrateRooster_BG29_990_G,
	CardIds.MisfitDragonling_BG29_814,
	CardIds.MisfitDragonling_BG29_814_G,
	CardIds.ThousandthPaperDrake_BG29_810,
	CardIds.ThousandthPaperDrake_BG29_810_G,
	CardIds.YulonFortuneGranter_BG29_811,
	CardIds.YulonFortuneGranter_BG29_811_G,
	CardIds.HoardingHatespawn_BG29_872,
	CardIds.HoardingHatespawn_BG29_872_G,
	CardIds.TheUninvitedGuest_BG29_875,
	CardIds.TheUninvitedGuest_BG29_875_G,
	CardIds.Sandy_BGDUO_125,
	CardIds.Sandy_BGDUO_125_G,
	CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy,
	CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G,
];
export const WHELP_CARD_IDS = [
	CardIds.RedWhelp_BGS_019,
	CardIds.RedWhelp_TB_BaconUps_102,
	CardIds.Onyxia_OnyxianWhelpToken,
];

export class CardsData {
	public ghastcoilerSpawns: readonly string[];
	// public shredderSpawns: readonly string[];
	public validDeathrattles: readonly string[];
	public impMamaSpawns: readonly string[];
	public demonSpawns: readonly string[];
	public gentleDjinniSpawns: readonly string[];
	// public festergutSpawns: readonly string[];
	public kilrekSpawns: readonly string[];
	public battlecryMinions: readonly string[];
	public deathrattleMinions: readonly string[];
	// public sneedsSpawns: readonly string[];
	// public treasureChestSpawns: readonly string[];
	public pirateSpawns: readonly string[];
	public beastSpawns: readonly string[];
	public scrapScraperSpawns: readonly string[];

	public putricidePool1: readonly string[];
	public putricidePool2: readonly string[];
	public putridicePool2ForEternalSummoner: readonly string[];

	private pool: readonly ReferenceCard[];
	private minionsForTier: { [key: string]: readonly ReferenceCard[] };

	constructor(private readonly allCards: AllCardsService, init = true) {
		if (init) {
			this.inititialize();
		}
	}

	public inititialize(validTribes?: readonly Race[], anomalies?: readonly string[]): void {
		const poolWithoutGolden = this.allCards
			.getCards()
			.filter((card) => isBattlegroundsCard(card))
			.filter((card) => !NON_BUYABLE_MINION_IDS.includes(card.id as CardIds))
			.filter((card) => !!card.techLevel)
			.filter((card) => card.type?.toUpperCase() === CardType[CardType.MINION])
			.filter((card) => !hasMechanic(card, GameTag[GameTag.BACON_BUDDY]))
			.filter((card) => card.set !== 'Vanilla')
			.filter((card) =>
				anomalies?.includes(CardIds.BigLeague_BG27_Anomaly_100)
					? card.techLevel >= 3
					: anomalies?.includes(CardIds.LittleLeague_BG27_Anomaly_800)
					? card.techLevel <= 4
					: true,
			);
		this.pool = poolWithoutGolden
			.filter((card) => this.isValidTribe(validTribes, card.races))
			.filter((card) =>
				anomalies?.includes(CardIds.TheGoldenArena_BG27_Anomaly_801)
					? this.isGolden(card)
					: !this.isGolden(card),
			);
		this.minionsForTier = groupByFunction((card: ReferenceCard) => card.techLevel)(this.pool);
		this.ghastcoilerSpawns = this.pool
			.filter((card) => card.id !== 'BGS_008')
			.filter((card) => hasMechanic(card, 'DEATHRATTLE'))
			.filter((card) => this.isValidTribe(validTribes, card.races))
			.map((card) => card.id);
		this.validDeathrattles = poolWithoutGolden
			.filter((card) => hasMechanic(card, 'DEATHRATTLE'))
			.filter((card) => this.isValidTribe(validTribes, card.races))
			.map((card) => card.id);
		this.demonSpawns = this.pool.filter((card) => isCorrectTribe(card.races, Race.DEMON)).map((card) => card.id);
		this.impMamaSpawns = this.demonSpawns.filter((cardId) => cardId !== CardIds.ImpMama_BGS_044);
		this.gentleDjinniSpawns = this.pool
			.filter((card) => isCorrectTribe(card.races, Race.ELEMENTAL))
			.filter((card) => card.id !== CardIds.GentleDjinni_BGS_121)
			.map((card) => card.id);
		// FIXME: just spawn a random undead instead of an Undead Creation
		// this.festergutSpawns = pool
		// 	.filter((card) => !this.isGolden(card))
		// 	.filter((card) => isCorrectTribe(card.races, Race.UNDEAD))
		// 	.filter((card) => card.id !== CardIds.Festergut_BG25_HERO_100_Buddy)
		// 	// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
		// 	.map((card) => card.id);
		this.kilrekSpawns = this.pool
			.filter((card) => isCorrectTribe(card.races, Race.DEMON))
			.filter((card) => card.id !== CardIds.Kilrek_TB_BaconShop_HERO_37_Buddy)
			.map((card) => card.id);
		this.battlecryMinions = this.pool.filter((card) => hasMechanic(card, 'BATTLECRY')).map((card) => card.id);
		this.deathrattleMinions = this.pool
			.filter((card) => hasMechanic(card, GameTag[GameTag.DEATHRATTLE]))
			.map((card) => card.id);
		this.pirateSpawns = this.pool.filter((card) => isCorrectTribe(card.races, Race.PIRATE)).map((card) => card.id);
		this.beastSpawns = this.pool.filter((card) => isCorrectTribe(card.races, Race.BEAST)).map((card) => card.id);
		this.scrapScraperSpawns = this.pool
			.filter((card) => hasMechanic(card, GameTag[GameTag.MAGNETIC]))
			.map((card) => card.id);

		this.putricidePool1 = this.pool.filter((card) => card.battlegroundsPutridicePool1).map((card) => card.id);
		this.putricidePool2 = this.pool.filter((card) => card.battlegroundsPutridicePool2).map((card) => card.id);
		this.putridicePool2ForEternalSummoner = this.pool
			.filter((card) => card.battlegroundsPutridicePool2)
			.filter((card) => !card.battlegroundsPutridiceSummonerExclusion)
			.map((card) => card.id);
	}

	public avengeValue(cardId: string): number {
		switch (cardId) {
			case CardIds.BirdBuddy_BG21_002:
			case CardIds.BirdBuddy_BG21_002_G:
			case CardIds.HungeringAbomination_BG25_014:
			case CardIds.HungeringAbomination_BG25_014_G:
			// Not technically an avenge, but behaves as if
			// case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy:
			// case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G:
			case CardIds.IceSickle:
				return 1;
			case CardIds.GhoulOfTheFeast_BG25_002:
			case CardIds.GhoulOfTheFeast_BG25_002_G:
			case CardIds.MechanoTank_BG21_023:
			case CardIds.MechanoTank_BG21_023_G:
			case CardIds.PalescaleCrocolisk_BG21_001:
			case CardIds.PalescaleCrocolisk_BG21_001_G:
			case CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy:
			case CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy_G:
			case CardIds.VanndarStormpike_LeadTheStormpikes:
			case CardIds.Drekthar_LeadTheFrostwolves:
			case CardIds.Bristlebach_BG26_157:
			case CardIds.Bristlebach_BG26_157_G:
				return 2;
			case CardIds.BuddingGreenthumb_BG21_030:
			case CardIds.BuddingGreenthumb_BG21_030_G:
			// case CardIds.FrostwolfLieutenant:
			// case CardIds.FrostwolfLieutenantBattlegrounds:
			case CardIds.PashmarTheVengeful_BG23_014:
			case CardIds.PashmarTheVengeful_BG23_014_G:
			case CardIds.WitchwingNestmatron_BG21_038:
			case CardIds.WitchwingNestmatron_BG21_038_G:
			case CardIds.BoomSquad_BG27_Reward_502:
			case CardIds.ChampionOfThePrimus_BG27_029:
			case CardIds.ChampionOfThePrimus_BG27_029_G:
			case CardIds.TremblingTrolley_BG28_967:
			case CardIds.TremblingTrolley_BG28_967_G:
				return 3;
			case CardIds.Onyxia_Broodmother:
			case CardIds.ImpatientDoomsayer_BG21_007:
			case CardIds.ImpatientDoomsayer_BG21_007_G:
			case CardIds.Sisefin_BG21_009:
			case CardIds.Sisefin_BG21_009_G:
			case CardIds.TonyTwoTusk_BG21_031:
			case CardIds.TonyTwoTusk_BG21_031_G:
			// case CardIds.ScrapScraper_BG26_148:
			// case CardIds.ScrapScraper_BG26_148_G:
			case CardIds.RelentlessSentry_BG25_003:
			case CardIds.RelentlessSentry_BG25_003_G:
			case CardIds.PhaerixWrathOfTheSun_BG28_403:
			case CardIds.PhaerixWrathOfTheSun_BG28_403_G:
			case CardIds.TumblingDisaster_BG28_Reward_505:
			case CardIds.CycleOfEnergy_BG28_Reward_504:
			case CardIds.AugmentedLaborer_BG28_740:
			case CardIds.AugmentedLaborer_BG28_740_G:
			case CardIds.MurglMkIi_BG29_991:
			case CardIds.MurglMkIi_BG29_991_G:
			case CardIds.QuilligraphySet:
				return 4;
			case CardIds.RelentlessMurghoul_BG27_010:
			case CardIds.RelentlessMurghoul_BG27_010_G:
			case CardIds.StaffOfTheScourge:
				return 5;
			case CardIds.StableAmalgamation_BG28_Reward_518:
				return 7;
		}
		return 0;
	}

	public defaultScriptDataNum(cardId: string): number {
		switch (cardId) {
			case CardIds.TumblingDisaster_BG28_Reward_505:
				return 1;
			default:
				return 0;
		}
	}

	public getTavernLevel(cardId: string): number {
		return this.allCards.getCard(cardId).techLevel ?? 1;
	}

	public getRandomMinionForTavernTier(tavernTier: number): string {
		// Tzvern tier can be undefined for hero-power specific tokens, like the Amalgam, or when
		// for some reason tokens end up in the shop. For now, defaulting to 1 for tavern
		// level seems to work in all cases
		const minionsForTier = this.minionsForTier[tavernTier ?? 1];
		if (!minionsForTier?.length) {
			console.error('incorrect minions for tier', tavernTier, this.minionsForTier, minionsForTier);
		}
		return pickRandom(this.minionsForTier[tavernTier ?? 1])?.id;
	}

	public getRandomMechToMagnetize(tavernLimitUpper: number): string {
		const magneticMechs = this.pool
			.filter((m) => m.type?.toUpperCase() === CardType[CardType.MINION])
			.filter((m) => hasMechanic(m, GameTag[GameTag.MODULAR]));
		const pool = magneticMechs.filter((m) => m.techLevel <= tavernLimitUpper);
		return pickRandom(pool)?.id;
	}

	public getRandomMinionForTribe(tribe: Race, tavernLimitUpper: number): string {
		const pool = this.pool
			.filter((m) => this.isValidTribe([tribe], m.races, false))
			.filter((m) => m.type?.toUpperCase() === CardType[CardType.MINION])
			.filter((m) => m.techLevel <= tavernLimitUpper);
		return pickRandom(pool)?.id;
	}

	public isGolden(card: ReferenceCard): boolean {
		return !!card.battlegroundsNormalDbfId;
	}

	private isValidTribe(validTribes: readonly Race[], cardRaces: readonly string[], allowEmptyRaces = true): boolean {
		if (!cardRaces?.length && allowEmptyRaces) {
			return true;
		}
		return (cardRaces ?? [])
			.map((race) => getRaceEnum(race))
			.some((raceEnum) => raceEnum === Race.ALL || !validTribes?.length || validTribes.includes(raceEnum));
	}
}
