import {
	AllCardsService,
	CardIds,
	GameTag,
	isBattlegroundsCard,
	NON_BUYABLE_MINION_IDS,
	Race,
	ReferenceCard,
} from '@firestone-hs/reference-data';
import { groupByFunction, pickRandom } from '../services/utils';
import { getRaceEnum, hasMechanic, isCorrectTribe } from '../utils';

export const START_OF_COMBAT_CARD_IDS = [
	CardIds.CorruptedMyrmidon,
	CardIds.CorruptedMyrmidonBattlegrounds,
	CardIds.Crabby_BG22_HERO_000_Buddy,
	CardIds.CrabbyBattlegrounds,
	CardIds.MantidQueen,
	CardIds.MantidQueenBattlegrounds,
	CardIds.PrizedPromoDrake,
	CardIds.PrizedPromoDrakeBattlegrounds,
	CardIds.RedWhelp,
	CardIds.RedWhelpBattlegrounds,
	CardIds.AmberGuardian,
	CardIds.AmberGuardianBattlegrounds,
	CardIds.InterrogatorWhitemane_BG24_704,
	CardIds.InterrogatorWhitemane_BG24_704_G,
	CardIds.Soulsplitter,
	CardIds.SoulsplitterBattlegrounds,
];
export const WHELP_CARD_IDS = [CardIds.RedWhelp, CardIds.RedWhelpBattlegrounds, CardIds.Onyxia_OnyxianWhelpToken];

export class CardsData {
	// public shredderSpawns: readonly string[];
	public ghastcoilerSpawns: readonly string[];
	public validDeathrattles: readonly string[];
	public impMamaSpawns: readonly string[];
	public gentleDjinniSpawns: readonly string[];
	// public festergutSpawns: readonly string[];
	public kilrekSpawns: readonly string[];
	public brannEpicEggSpawns: readonly string[];
	// public sneedsSpawns: readonly string[];
	// public treasureChestSpawns: readonly string[];
	public pirateSpawns: readonly string[];
	public beastSpawns: readonly string[];

	public putricidePool1: readonly string[];
	public putricidePool2: readonly string[];
	public putridicePool2ForEternalSummoner: readonly string[];

	private minionsForTier: { [key: string]: readonly ReferenceCard[] };

	constructor(private readonly allCards: AllCardsService, init = true) {
		if (init) {
			this.inititialize();
		}
	}

	public inititialize(validTribes?: readonly Race[]): void {
		const pool = this.allCards
			.getCards()
			.filter((card) => isBattlegroundsCard(card))
			.filter((card) => !NON_BUYABLE_MINION_IDS.includes(card.id as CardIds))
			.filter((card) => !!card.techLevel)
			.filter((card) => !hasMechanic(card, GameTag[GameTag.BACON_BUDDY]))
			.filter((card) => card.set !== 'Vanilla');
		this.minionsForTier = groupByFunction((card: ReferenceCard) => card.techLevel)(pool.filter((card) => !this.isGolden(card)));
		this.ghastcoilerSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => card.id !== 'BGS_008')
			.filter((card) => hasMechanic(card, 'DEATHRATTLE'))
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.filter((card) => this.isValidTribe(validTribes, card.races))
			.map((card) => card.id);
		this.validDeathrattles = pool
			// .filter((card) => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter((card) => hasMechanic(card, 'DEATHRATTLE'))
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.filter((card) => this.isValidTribe(validTribes, card.races))
			.map((card) => card.id);
		this.impMamaSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => isCorrectTribe(card.races, Race.DEMON))
			.filter((card) => card.id !== CardIds.ImpMama)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.gentleDjinniSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => isCorrectTribe(card.races, Race.ELEMENTAL))
			.filter((card) => card.id !== CardIds.GentleDjinni)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		// FIXME: just spawn a random undead instead of an Undead Creation
		// this.festergutSpawns = pool
		// 	.filter((card) => !this.isGolden(card))
		// 	.filter((card) => isCorrectTribe(card.races, Race.UNDEAD))
		// 	.filter((card) => card.id !== CardIds.Festergut_BG25_HERO_100_Buddy)
		// 	// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
		// 	.map((card) => card.id);
		this.kilrekSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => isCorrectTribe(card.races, Race.DEMON))
			.filter((card) => card.id !== CardIds.KilrekBattlegrounds_TB_BaconShop_HERO_37_Buddy)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.brannEpicEggSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => hasMechanic(card, 'BATTLECRY'))
			.map((card) => card.id);
		this.pirateSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => isCorrectTribe(card.races, Race.PIRATE))
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.beastSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => isCorrectTribe(card.races, Race.BEAST))
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);

		this.putricidePool1 = pool.filter((card) => card.battlegroundsPutridicePool1).map((card) => card.id);
		this.putricidePool2 = pool.filter((card) => card.battlegroundsPutridicePool2).map((card) => card.id);
		this.putridicePool2ForEternalSummoner = pool
			.filter((card) => card.battlegroundsPutridicePool2)
			.filter((card) => !card.battlegroundsPutridiceSummonerExclusion)
			.map((card) => card.id);
	}

	public avengeValue(cardId: string): number {
		switch (cardId) {
			case CardIds.BirdBuddy:
			case CardIds.BirdBuddyBattlegrounds:
			case CardIds.HungeringAbomination:
			case CardIds.HungeringAbominationBattlegrounds:
			// Not technically an avenge, but behaves as if
			case CardIds.ShadowyConstruct:
			case CardIds.ShadowyConstructBattlegrounds:
				return 1;
			case CardIds.GhoulOfTheFeast:
			case CardIds.GhoulOfTheFeastBattlegrounds:
			case CardIds.MechanoTank_BG21_023:
			case CardIds.MechanoTank_BG21_023_G:
			case CardIds.PalescaleCrocolisk_BG21_001:
			case CardIds.PalescaleCrocolisk_BG21_001_G:
			case CardIds.StormpikeLieutenant:
			case CardIds.StormpikeLieutenantBattlegrounds:
			case CardIds.VanndarStormpike_LeadTheStormpikes:
				return 2;
			case CardIds.BuddingGreenthumb:
			case CardIds.BuddingGreenthumbBattlegrounds:
			case CardIds.FrostwolfLieutenant:
			case CardIds.FrostwolfLieutenantBattlegrounds:
			case CardIds.PashmarTheVengeful:
			case CardIds.PashmarTheVengefulBattlegrounds:
			case CardIds.WitchwingNestmatron_BG21_038:
			case CardIds.WitchwingNestmatron_BG21_038_G:
			case CardIds.Drekthar_LeadTheFrostwolves:
				return 3;
			case CardIds.ImpatientDoomsayer:
			case CardIds.ImpatientDoomsayerBattlegrounds:
			case CardIds.Sisefin_BG21_009:
			case CardIds.Sisefin_BG21_009_G:
			case CardIds.TonyTwoTusk_BG21_031:
			case CardIds.TonyTwoTusk_BG21_031_G:
			case CardIds.Onyxia_Broodmother:
				return 4;
		}
		return 0;
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

	private isGolden(card: ReferenceCard): boolean {
		return !!card.battlegroundsNormalDbfId;
	}

	private isValidTribe(validTribes: readonly Race[], races: readonly string[]): boolean {
		if (!races?.length) {
			return false;
		}
		return races
			.map((race) => getRaceEnum(race))
			.some((raceEnum) => raceEnum === Race.ALL || !validTribes?.length || validTribes.includes(raceEnum));
	}
}
