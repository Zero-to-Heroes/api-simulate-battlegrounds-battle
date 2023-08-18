import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { pickRandom } from '../services/utils';
import {
	addCardsInHand,
	addStatsToBoard,
	afterStatsUpdate,
	getRandomAliveMinion,
	grantStatsToMinionsOfEachType,
	modifyAttack,
	modifyHealth,
} from '../utils';
import { playBloodGemsOn } from './blood-gems';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const computeBattlecryMultiplier = (board: BoardEntity[], boardHero: BgsPlayerEntity): number => {
	const brann = board.find((entity) => entity.cardId === CardIds.BrannBronzebeard_BG_LOE_077);
	const goldenBrann = board.find((entity) => entity.cardId === CardIds.BrannBronzebeard_TB_BaconUps_045);
	const multiplier = goldenBrann ? 3 : brann ? 2 : 1;
	return multiplier;
};

export const triggerBattlecry = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	entity: BoardEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
) => {
	const allMinions = [...board, ...otherBoard];
	const totalTriggers = computeBattlecryMultiplier(board, hero);
	for (let z = 0; z < totalTriggers; z++) {
		let hasTriggered = true;
		switch (entity.cardId) {
			case CardIds.RazorfenGeomancer_BG20_100:
			case CardIds.RazorfenGeomancer_BG20_100_G:
				const razorFenCardsToAdd =
					entity.cardId === CardIds.RazorfenGeomancer_BG20_100
						? [CardIds.BloodGem]
						: [CardIds.BloodGem, CardIds.BloodGem];
				addCardsInHand(hero, board, allCards, spectator, razorFenCardsToAdd);
				break;
			case CardIds.RockpoolHunter_BG_UNG_073:
			case CardIds.RockpoolHunter_TB_BaconUps_061:
				const rockPoolTarget = getRandomAliveMinion(board, Race.MURLOC, allCards);
				const rockpoolStats = entity.cardId === CardIds.RockpoolHunter_BG_UNG_073 ? 1 : 2;
				modifyAttack(rockPoolTarget, rockpoolStats, board, allCards);
				modifyHealth(rockPoolTarget, rockpoolStats, board, allCards);
				afterStatsUpdate(rockPoolTarget, board, allCards);
				spectator.registerPowerTarget(entity, rockPoolTarget, board);
				break;
			case CardIds.ShellCollector_BG23_002:
			case CardIds.ShellCollector_BG23_002_G:
				const shellCollectorCardsToAdd =
					entity.cardId === CardIds.ShellCollector_BG23_002
						? [CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, allCards, spectator, shellCollectorCardsToAdd);
				break;
			case CardIds.MenagerieMug_BGS_082:
			case CardIds.MenagerieMug_TB_BaconUps_144:
				const menagerieMugStats = entity.cardId === CardIds.MenagerieMug_BGS_082 ? 1 : 2;
				grantStatsToMinionsOfEachType(
					entity,
					board,
					menagerieMugStats,
					menagerieMugStats,
					allCards,
					spectator,
					3,
				);
				break;
			case CardIds.MenagerieJug_BGS_083:
			case CardIds.MenagerieJug_TB_BaconUps_145:
				const menagerieJugStats = entity.cardId === CardIds.MenagerieJug_BGS_083 ? 2 : 4;
				grantStatsToMinionsOfEachType(
					entity,
					board,
					menagerieJugStats,
					menagerieJugStats,
					allCards,
					spectator,
					3,
				);
				break;
			case CardIds.NerubianDeathswarmer_BG25_011:
			case CardIds.NerubianDeathswarmer_BG25_011_G:
				const nerubianDeathswarmerStats = entity.cardId === CardIds.NerubianDeathswarmer_BG25_011 ? 1 : 2;
				hero.globalInfo.UndeadAttackBonus =
					(hero.globalInfo?.UndeadAttackBonus ?? 0) + nerubianDeathswarmerStats;
				break;
			case CardIds.SparringPartner_BG_AT_069:
			case CardIds.SparringPartner_BG_AT_069_G:
				const sparringPartnersTargets = allMinions.filter((e) => !e.taunt);
				const sparringPartnersTarget = pickRandom(sparringPartnersTargets);
				if (sparringPartnersTarget) {
					sparringPartnersTarget.taunt = true;
				}
				break;
			case CardIds.TwilightEmissary_BGS_038:
			case CardIds.TwilightEmissary_TB_BaconUps_108:
				const twilightEmissaryTarget = getRandomAliveMinion(board, Race.DRAGON, allCards);
				const twilightEmissaryStats = entity.cardId === CardIds.TwilightEmissary_BGS_038 ? 2 : 4;
				modifyAttack(twilightEmissaryTarget, twilightEmissaryStats, board, allCards);
				modifyHealth(twilightEmissaryTarget, twilightEmissaryStats, board, allCards);
				afterStatsUpdate(twilightEmissaryTarget, board, allCards);
				spectator.registerPowerTarget(entity, twilightEmissaryTarget, board);
				break;
			case CardIds.BloodsailCannoneer_BGS_053:
			case CardIds.BloodsailCannoneer_TB_BaconUps_138:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.BloodsailCannoneer_BGS_053 ? 3 : 6,
					0,
					allCards,
					spectator,
					Race[Race.PIRATE],
				);
				break;
			case CardIds.ColdlightSeerLegacy_BG_EX1_103:
			case CardIds.ColdlightSeerLegacy_TB_BaconUps_064:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					0,
					entity.cardId === CardIds.ColdlightSeerLegacy_BG_EX1_103 ? 2 : 4,
					allCards,
					spectator,
					Race[Race.MURLOC],
				);
				break;
			case CardIds.KeyboardIgniter_BG26_522:
			case CardIds.KeyboardIgniter_BG26_522_G:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.KeyboardIgniter_BG26_522 ? 1 : 2,
					entity.cardId === CardIds.KeyboardIgniter_BG26_522 ? 2 : 4,
					allCards,
					spectator,
					Race[Race.DEMON],
				);
				break;
			case CardIds.MoonBaconJazzer_BG26_159:
			case CardIds.MoonBaconJazzer_BG26_159_G:
				const moonBaconJazzerStats = entity.cardId === CardIds.MoonBaconJazzer_BG26_159 ? 1 : 2;
				hero.globalInfo.BloodGemHealthBonus =
					(hero.globalInfo?.BloodGemHealthBonus ?? 0) + moonBaconJazzerStats;
				break;
			case CardIds.Smogger_BG21_021:
			case CardIds.Smogger_BG21_021_G:
				const smoggerLoops = entity.cardId === CardIds.Smogger_BG21_021 ? 1 : 2;
				for (let i = 0; i < smoggerLoops; i++) {
					const smoggerTarget = getRandomAliveMinion(board, Race.ELEMENTAL, allCards);
					const smoggerStats = hero.tavernTier ?? 3;
					modifyAttack(smoggerTarget, smoggerStats, board, allCards);
					modifyHealth(smoggerTarget, smoggerStats, board, allCards);
					afterStatsUpdate(smoggerTarget, board, allCards);
					spectator.registerPowerTarget(entity, smoggerTarget, board);
				}
				break;
			case CardIds.AnnihilanBattlemaster_BGS_010:
			case CardIds.AnnihilanBattlemaster_TB_BaconUps_083:
				// TODO: pass damage taken info
				const startingHp = hero.cardId === CardIds.Patchwerk_TB_BaconShop_HERO_34 ? 60 : 30;
				const hpMissing = startingHp - hero.hpLeft;
				const annihilanStats = (entity.cardId === CardIds.AnnihilanBattlemaster_BGS_010 ? 2 : 4) * hpMissing;
				modifyHealth(entity, annihilanStats, board, allCards);
				afterStatsUpdate(entity, board, allCards);
				spectator.registerPowerTarget(entity, entity, board);
				break;
			case CardIds.ElectricSynthesizer_BG26_963:
			case CardIds.ElectricSynthesizer_BG26_963_G:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					0,
					entity.cardId === CardIds.ElectricSynthesizer_BG26_963 ? 3 : 6,
					allCards,
					spectator,
					Race[Race.DRAGON],
				);
				break;
			case CardIds.Necrolyte_BG20_202:
			case CardIds.Necrolyte_BG20_202_G:
				const necrolyteBloodGems = entity.cardId === CardIds.Necrolyte_BG20_202 ? 2 : 4;
				const necrolyteTarget = pickRandom(board);
				playBloodGemsOn(necrolyteTarget, necrolyteBloodGems, board, hero, allCards, spectator);
				spectator.registerPowerTarget(entity, necrolyteTarget, board);
				break;
			case CardIds.PrimalfinLookout_BGS_020:
			case CardIds.PrimalfinLookout_TB_BaconUps_089:
				const primalfinLookoutCardsToAdd =
					entity.cardId === CardIds.PrimalfinLookout_BGS_020
						? [cardsData.getRandomMinionForTribe(Race.MURLOC, hero.tavernTier ?? 1)]
						: [
								cardsData.getRandomMinionForTribe(Race.MURLOC, hero.tavernTier ?? 1),
								cardsData.getRandomMinionForTribe(Race.MURLOC, hero.tavernTier ?? 1),
						  ];
				addCardsInHand(hero, board, allCards, spectator, primalfinLookoutCardsToAdd);
				break;
			case CardIds.StrongshellScavenger_BG_ICC_807:
			case CardIds.StrongshellScavenger_TB_BaconUps_072:
				const strongshellScavengerStats = entity.cardId === CardIds.StrongshellScavenger_BG_ICC_807 ? 2 : 4;
				const strongshellScavengerTargets = board
					.filter((e) => e.entityId != entity.entityId)
					.filter((e) => e.taunt);
				strongshellScavengerTargets.forEach((target) => {
					modifyAttack(target, strongshellScavengerStats, board, allCards);
					modifyHealth(target, strongshellScavengerStats, board, allCards);
					afterStatsUpdate(target, board, allCards);
					spectator.registerPowerTarget(entity, target, board);
				});
				break;
			case CardIds.VigilantStoneborn_BG24_023:
			case CardIds.VigilantStoneborn_BG24_023_G:
				const vigilantStonebornTarget = pickRandom(board);
				const vigilantStonebornStats = entity.cardId === CardIds.VigilantStoneborn_BG24_023 ? 6 : 12;
				vigilantStonebornTarget.taunt = true;
				modifyHealth(vigilantStonebornTarget, vigilantStonebornStats, board, allCards);
				afterStatsUpdate(vigilantStonebornTarget, board, allCards);
				spectator.registerPowerTarget(entity, vigilantStonebornTarget, board);
				break;
			case CardIds.Bonemare_BG26_ICC_705:
			case CardIds.Bonemare_BG26_ICC_705_G:
				const bonemareTarget = pickRandom(board);
				const bonemareStats = entity.cardId === CardIds.Bonemare_BG26_ICC_705 ? 4 : 8;
				bonemareTarget.taunt = true;
				modifyAttack(bonemareTarget, bonemareStats, board, allCards);
				modifyHealth(bonemareTarget, bonemareStats, board, allCards);
				afterStatsUpdate(bonemareTarget, board, allCards);
				spectator.registerPowerTarget(entity, bonemareTarget, board);
				break;
			case CardIds.GeneralDrakkisath_BG25_309:
			case CardIds.GeneralDrakkisath_BG25_309_G:
				const generalDrakkisathCardsToAdd =
					entity.cardId === CardIds.GeneralDrakkisath_BG25_309
						? [CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t]
						: [
								CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t,
								CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t,
						  ];
				addCardsInHand(hero, board, allCards, spectator, generalDrakkisathCardsToAdd);
				break;
			case CardIds.KingBagurgle_BGS_030:
			case CardIds.KingBagurgle_TB_BaconUps_100:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.KingBagurgle_BGS_030 ? 2 : 4,
					entity.cardId === CardIds.KingBagurgle_BGS_030 ? 2 : 4,
					allCards,
					spectator,
					Race[Race.MURLOC],
				);
				break;
			// Not correct, but only used to trigger the "add cards in hand" effect
			case CardIds.Murozond_BGS_043:
			case CardIds.Murozond_TB_BaconUps_110:
				const murozondCardsToAdd =
					entity.cardId === CardIds.Murozond_BGS_043
						? [CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, allCards, spectator, murozondCardsToAdd);
				break;
			case CardIds.TavernTempest_BGS_123:
			case CardIds.TavernTempest_TB_BaconUps_162:
				const tavernTempestCardsToAdd =
					entity.cardId === CardIds.TavernTempest_BGS_123
						? [CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, allCards, spectator, tavernTempestCardsToAdd);
				break;
			case CardIds.MechaJaraxxus_BG25_807:
			case CardIds.MechaJaraxxus_BG25_807_G:
				const mechaJaraxxusCardsToAdd =
					entity.cardId === CardIds.MechaJaraxxus_BG25_807
						? [CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, allCards, spectator, mechaJaraxxusCardsToAdd);
				break;
			case CardIds.UtherTheLightbringer_BG23_190:
			case CardIds.UtherTheLightbringer_BG23_190_G:
				const utherTarget = pickRandom(allMinions);
				const utherStats = entity.cardId === CardIds.UtherTheLightbringer_BG23_190 ? 15 : 30;
				utherTarget.attack = utherStats;
				utherTarget.health = utherStats;
				utherTarget.maxHealth = utherStats;
				break;
			default:
				hasTriggered = false;
				break;
		}
		if (hasTriggered) {
			afterBattlecryTriggered(entity, board, hero, otherBoard, otherHero, allCards, cardsData, spectator);
		}
	}
};

const afterBattlecryTriggered = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	spectator: Spectator,
) => {
	board
		.filter((e) => e.cardId === CardIds.KalecgosArcaneAspect_BGS_041)
		.forEach((e) => {
			addStatsToBoard(entity, board, 1, 1, allCards, spectator, Race[Race.DRAGON]);
		});
	board
		.filter((e) => e.cardId === CardIds.KalecgosArcaneAspect_TB_BaconUps_109)
		.forEach((e) => {
			addStatsToBoard(entity, board, 2, 2, allCards, spectator, Race[Race.DRAGON]);
		});
};
