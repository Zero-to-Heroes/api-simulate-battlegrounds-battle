import { AllCardsService, CardIds, GameTag, isBattlegroundsCard, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { groupByFunction, pickRandom } from '../services/utils';
import { getRaceEnum, hasMechanic } from '../utils';

export const AURA_ENCHANTMENTS: readonly string[][] = [
	[CardIds.Kathranatir2, CardIds.Kathranatir_GraspOfKathranatirEnchantment1],
	[CardIds.KathranatirBattlegrounds, CardIds.Kathranatir_GraspOfKathranatirEnchantment2],
	[CardIds.MurlocWarleaderLegacy, CardIds.MurlocWarleader_MrgglaarglLegacyEnchantment],
	[CardIds.MurlocWarleaderBattlegrounds, CardIds.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds],
	[CardIds.SouthseaCaptainLegacy, CardIds.SouthseaCaptain_YarrrLegacyEnchantment],
	[CardIds.SouthseaCaptainBattlegrounds, CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds],
	[CardIds.LadySinestraBattlegrounds1, CardIds.DraconicBlessingEnchantmentBattlegrounds1],
	[CardIds.LadySinestraBattlegrounds2, CardIds.DraconicBlessingEnchantmentBattlegrounds2],
];
// Auras are effects that are permanent (unlike deathrattles or "whenever" effects)
// and that stop once the origin entity leaves play (so it doesn't include buffs)
export const AURA_ORIGINS: readonly string[] = AURA_ENCHANTMENTS.map((pair) => pair[0]);
export const START_OF_COMBAT_CARD_IDS = [
	CardIds.CorruptedMyrmidon,
	CardIds.CorruptedMyrmidonBattlegrounds,
	CardIds.Crabby1,
	CardIds.CrabbyBattlegrounds,
	CardIds.MantidQueen,
	CardIds.MantidQueenBattlegrounds,
	CardIds.PrizedPromoDrake,
	CardIds.PrizedPromoDrakeBattlegrounds,
	CardIds.RedWhelp,
	CardIds.RedWhelpBattlegrounds,
];
export const WHELP_CARD_IDS = [CardIds.RedWhelp, CardIds.RedWhelpBattlegrounds, CardIds.Onyxia_OnyxianWhelpToken];

export class CardsData {
	// public shredderSpawns: readonly string[];
	public ghastcoilerSpawns: readonly string[];
	public validDeathrattles: readonly string[];
	public impMamaSpawns: readonly string[];
	public gentleDjinniSpawns: readonly string[];
	public kilrekSpawns: readonly string[];
	public brannEpicEggSpawns: readonly string[];
	// public sneedsSpawns: readonly string[];
	// public treasureChestSpawns: readonly string[];
	public pirateSpawns: readonly string[];
	public auraOrigins: readonly string[];

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
			.filter((card) => !!card.techLevel)
			.filter((card) => !hasMechanic(card, GameTag[GameTag.BACON_BUDDY]))
			.filter((card) => card.set !== 'Vanilla');
		this.minionsForTier = groupByFunction((card: ReferenceCard) => card.techLevel)(pool.filter((card) => !this.isGolden(card)));
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
		this.kilrekSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => card.race === Race[Race.DEMON])
			.filter((card) => card.id !== CardIds.KilrekBattlegrounds1)
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
		this.brannEpicEggSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => hasMechanic(card, 'BATTLECRY'))
			.map((card) => card.id);
		this.pirateSpawns = pool
			.filter((card) => !this.isGolden(card))
			.filter((card) => card.race === 'PIRATE')
			// .filter((card) => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map((card) => card.id);
	}

	public avengeValue(cardId: string): number {
		switch (cardId) {
			case CardIds.BirdBuddy:
			case CardIds.BirdBuddyBattlegrounds:
				return 1;
			case CardIds.FrostwolfLieutenant:
			case CardIds.FrostwolfLieutenantBattlegrounds:
			case CardIds.MechanoTank:
			case CardIds.MechanoTankBattlegrounds:
			case CardIds.PalescaleCrocolisk:
			case CardIds.PalescaleCrocoliskBattlegrounds:
			case CardIds.StormpikeLieutenant:
			case CardIds.StormpikeLieutenantBattlegrounds:
				return 2;
			case CardIds.BuddingGreenthumb:
			case CardIds.BuddingGreenthumbBattlegrounds:
			case CardIds.PashmarTheVengeful:
			case CardIds.PashmarTheVengefulBattlegrounds:
			case CardIds.WitchwingNestmatron:
			case CardIds.WitchwingNestmatronBattlegrounds:
				return 3;
			case CardIds.ImpatientDoomsayer:
			case CardIds.ImpatientDoomsayerBattlegrounds:
			case CardIds.Sisefin:
			case CardIds.SisefinBattlegrounds:
			case CardIds.TonyTwoTusk:
			case CardIds.TonyTwoTuskBattlegrounds:
			case CardIds.Onyxia_Broodmother:
				return 4;
		}
		return 0;
	}

	public getTavernLevel(cardId: string): number {
		return this.allCards.getCard(cardId).techLevel;
	}

	public getRandomMinionForTavernTier(tavernTier: number): string {
		// Tzvern tier can be undefined for hero-power specific tokens, like the Amalgam, or when
		// for some reason tokens end up in the shop. For now, defaulting to 1 for tavern
		// level seems to work in all cases
		return pickRandom(this.minionsForTier[tavernTier ?? 1]).id;
	}

	private isGolden(card: ReferenceCard): boolean {
		return !!card.battlegroundsNormalDbfId;
	}

	private isValidTribe(validTribes: readonly Race[], race: string): boolean {
		const raceEnum: Race = getRaceEnum(race);
		return raceEnum === Race.ALL || !validTribes || validTribes.length === 0 || validTribes.includes(raceEnum);
	}
}
