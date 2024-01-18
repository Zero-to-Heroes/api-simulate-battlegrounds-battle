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
	hasCorrectTribe,
	isMinionGolden,
	makeMinionGolden,
	modifyAttack,
	modifyHealth,
} from '../utils';
import { playBloodGemsOn } from './blood-gems';
import { FullGameState } from './internal-game-state';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const computeBattlecryMultiplier = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	sharedState: SharedState,
): number => {
	const brann = board.find(
		(entity) =>
			entity.cardId === CardIds.BrannBronzebeard_BG_LOE_077 ||
			entity.cardId === CardIds.MoiraBronzebeard_BG27_518,
	);
	const brannBlessings = boardHero.secrets?.some((e) => e.cardId === CardIds.BrannsBlessing_BG28_509);
	const brannBonus = !!brann || brannBlessings ? 2 : 0;
	const goldenBrann = board.find(
		(entity) =>
			entity.cardId === CardIds.BrannBronzebeard_TB_BaconUps_045 ||
			entity.cardId === CardIds.MoiraBronzebeard_BG27_518_G,
	);
	const goldenBrannBonus = !!goldenBrann ? 3 : 0;
	const echoesOfArgus = sharedState.anomalies.includes(CardIds.EchoesOfArgus_BG27_Anomaly_802) ? 1 : 0;

	const multiplier = echoesOfArgus + Math.max(goldenBrannBonus, brannBonus, 1);
	return multiplier;
};

export const triggerBattlecry = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	entity: BoardEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const allMinions = [...board, ...otherBoard];
	const totalTriggers = computeBattlecryMultiplier(board, hero, gameState.sharedState);
	for (let z = 0; z < totalTriggers; z++) {
		let hasTriggered = true;
		switch (entity.cardId) {
			case CardIds.RazorfenGeomancer_BG20_100:
			case CardIds.RazorfenGeomancer_BG20_100_G:
				const razorFenCardsToAdd =
					entity.cardId === CardIds.RazorfenGeomancer_BG20_100
						? [CardIds.BloodGem]
						: [CardIds.BloodGem, CardIds.BloodGem];
				addCardsInHand(hero, board, razorFenCardsToAdd, gameState);
				break;
			case CardIds.RockpoolHunter_BG_UNG_073:
			case CardIds.RockpoolHunter_TB_BaconUps_061:
				const rockPoolTarget = getRandomAliveMinion(board, Race.MURLOC, gameState.allCards);
				const rockpoolStats = entity.cardId === CardIds.RockpoolHunter_BG_UNG_073 ? 1 : 2;
				modifyAttack(rockPoolTarget, rockpoolStats, board, gameState.allCards);
				modifyHealth(rockPoolTarget, rockpoolStats, board, gameState.allCards);
				afterStatsUpdate(rockPoolTarget, board, gameState.allCards);
				gameState.spectator.registerPowerTarget(entity, rockPoolTarget, board, hero, otherHero);
				break;
			case CardIds.ShellCollector_BG23_002:
			case CardIds.ShellCollector_BG23_002_G:
				const shellCollectorCardsToAdd =
					entity.cardId === CardIds.ShellCollector_BG23_002
						? [CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, shellCollectorCardsToAdd, gameState);
				break;
			case CardIds.MenagerieMug_BGS_082:
			case CardIds.MenagerieMug_TB_BaconUps_144:
				const menagerieMugStats = entity.cardId === CardIds.MenagerieMug_BGS_082 ? 1 : 2;
				grantStatsToMinionsOfEachType(
					entity,
					board,
					menagerieMugStats,
					menagerieMugStats,
					gameState.allCards,
					gameState.spectator,
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
					gameState.allCards,
					gameState.spectator,
					3,
				);
				break;
			case CardIds.NerubianDeathswarmer_BG25_011:
			case CardIds.NerubianDeathswarmer_BG25_011_G:
				const nerubianDeathswarmerStats = entity.cardId === CardIds.NerubianDeathswarmer_BG25_011 ? 1 : 2;
				hero.globalInfo.UndeadAttackBonus =
					(hero.globalInfo?.UndeadAttackBonus ?? 0) + nerubianDeathswarmerStats;
				addStatsToBoard(
					entity,
					board,
					nerubianDeathswarmerStats,
					0,
					gameState.allCards,
					gameState.spectator,
					Race[Race.UNDEAD],
				);
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
				const twilightEmissaryTarget = getRandomAliveMinion(board, Race.DRAGON, gameState.allCards);
				const twilightEmissaryStats = entity.cardId === CardIds.TwilightEmissary_BGS_038 ? 2 : 4;
				modifyAttack(twilightEmissaryTarget, twilightEmissaryStats, board, gameState.allCards);
				modifyHealth(twilightEmissaryTarget, twilightEmissaryStats, board, gameState.allCards);
				afterStatsUpdate(twilightEmissaryTarget, board, gameState.allCards);
				gameState.spectator.registerPowerTarget(entity, twilightEmissaryTarget, board, hero, otherHero);
				break;
			case CardIds.BloodsailCannoneer_BGS_053:
			case CardIds.BloodsailCannoneer_TB_BaconUps_138:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.BloodsailCannoneer_BGS_053 ? 3 : 6,
					0,
					gameState.allCards,
					gameState.spectator,
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
					gameState.allCards,
					gameState.spectator,
					Race[Race.MURLOC],
				);
				break;
			case CardIds.KeyboardIgniter_BG26_522:
			case CardIds.KeyboardIgniter_BG26_522_G:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.KeyboardIgniter_BG26_522 ? 2 : 4,
					entity.cardId === CardIds.KeyboardIgniter_BG26_522 ? 2 : 4,
					gameState.allCards,
					gameState.spectator,
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
					const smoggerTarget = getRandomAliveMinion(board, Race.ELEMENTAL, gameState.allCards);
					const smoggerStats = hero.tavernTier ?? 3;
					modifyAttack(smoggerTarget, smoggerStats, board, gameState.allCards);
					modifyHealth(smoggerTarget, smoggerStats, board, gameState.allCards);
					afterStatsUpdate(smoggerTarget, board, gameState.allCards);
					gameState.spectator.registerPowerTarget(entity, smoggerTarget, board, hero, otherHero);
				}
				break;
			case CardIds.AnnihilanBattlemaster_BGS_010:
			case CardIds.AnnihilanBattlemaster_TB_BaconUps_083:
				// TODO: pass damage taken info
				const startingHp = hero.cardId === CardIds.Patchwerk_TB_BaconShop_HERO_34 ? 60 : 30;
				const hpMissing = startingHp - hero.hpLeft;
				const annihilanStats = (entity.cardId === CardIds.AnnihilanBattlemaster_BGS_010 ? 2 : 4) * hpMissing;
				modifyHealth(entity, annihilanStats, board, gameState.allCards);
				afterStatsUpdate(entity, board, gameState.allCards);
				gameState.spectator.registerPowerTarget(entity, entity, board, hero, otherHero);
				break;
			case CardIds.ElectricSynthesizer_BG26_963:
			case CardIds.ElectricSynthesizer_BG26_963_G:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.ElectricSynthesizer_BG26_963 ? 2 : 4,
					entity.cardId === CardIds.ElectricSynthesizer_BG26_963 ? 1 : 2,
					gameState.allCards,
					gameState.spectator,
					Race[Race.DRAGON],
				);
				break;
			case CardIds.Necrolyte_BG20_202:
			case CardIds.Necrolyte_BG20_202_G:
				const necrolyteBloodGems = entity.cardId === CardIds.Necrolyte_BG20_202 ? 2 : 4;
				const necrolyteTarget = pickRandom(board);
				playBloodGemsOn(
					necrolyteTarget,
					necrolyteBloodGems,
					board,
					hero,
					gameState.allCards,
					gameState.spectator,
				);
				gameState.spectator.registerPowerTarget(entity, necrolyteTarget, board, hero, otherHero);
				break;
			case CardIds.PrimalfinLookout_BGS_020:
			case CardIds.PrimalfinLookout_TB_BaconUps_089:
				const primalfinLookoutCardsToAdd =
					entity.cardId === CardIds.PrimalfinLookout_BGS_020
						? [gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, hero.tavernTier ?? 1)]
						: [
								gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, hero.tavernTier ?? 1),
								gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, hero.tavernTier ?? 1),
						  ];
				addCardsInHand(hero, board, primalfinLookoutCardsToAdd, gameState);
				gameState.spectator.registerPowerTarget(entity, hero, board, hero, otherHero);
				break;
			case CardIds.StrongshellScavenger_BG_ICC_807:
			case CardIds.StrongshellScavenger_TB_BaconUps_072:
				const strongshellScavengerStats = entity.cardId === CardIds.StrongshellScavenger_BG_ICC_807 ? 2 : 4;
				const strongshellScavengerTargets = board
					.filter((e) => e.entityId != entity.entityId)
					.filter((e) => e.taunt);
				strongshellScavengerTargets.forEach((target) => {
					modifyAttack(target, strongshellScavengerStats, board, gameState.allCards);
					modifyHealth(target, strongshellScavengerStats, board, gameState.allCards);
					afterStatsUpdate(target, board, gameState.allCards);
					gameState.spectator.registerPowerTarget(entity, target, board, hero, otherHero);
				});
				break;
			case CardIds.VigilantStoneborn_BG24_023:
			case CardIds.VigilantStoneborn_BG24_023_G:
				const vigilantStonebornTarget = pickRandom(board);
				const vigilantStonebornStats = entity.cardId === CardIds.VigilantStoneborn_BG24_023 ? 6 : 12;
				vigilantStonebornTarget.taunt = true;
				modifyHealth(vigilantStonebornTarget, vigilantStonebornStats, board, gameState.allCards);
				afterStatsUpdate(vigilantStonebornTarget, board, gameState.allCards);
				gameState.spectator.registerPowerTarget(entity, vigilantStonebornTarget, board, hero, otherHero);
				break;
			case CardIds.Bonemare_BG26_ICC_705:
			case CardIds.Bonemare_BG26_ICC_705_G:
				const bonemareTarget = pickRandom(board);
				const bonemareStats = entity.cardId === CardIds.Bonemare_BG26_ICC_705 ? 4 : 8;
				bonemareTarget.taunt = true;
				modifyAttack(bonemareTarget, bonemareStats, board, gameState.allCards);
				modifyHealth(bonemareTarget, bonemareStats, board, gameState.allCards);
				afterStatsUpdate(bonemareTarget, board, gameState.allCards);
				gameState.spectator.registerPowerTarget(entity, bonemareTarget, board, hero, otherHero);
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
				addCardsInHand(hero, board, generalDrakkisathCardsToAdd, gameState);
				break;
			case CardIds.KingBagurgle_BGS_030:
			case CardIds.KingBagurgle_TB_BaconUps_100:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.KingBagurgle_BGS_030 ? 3 : 6,
					entity.cardId === CardIds.KingBagurgle_BGS_030 ? 3 : 6,
					gameState.allCards,
					gameState.spectator,
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
				addCardsInHand(hero, board, murozondCardsToAdd, gameState);
				break;
			case CardIds.TavernTempest_BGS_123:
			case CardIds.TavernTempest_TB_BaconUps_162:
				const tavernTempestCardsToAdd =
					entity.cardId === CardIds.TavernTempest_BGS_123
						? [CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, tavernTempestCardsToAdd, gameState);
				break;
			case CardIds.MechaJaraxxus_BG25_807:
			case CardIds.MechaJaraxxus_BG25_807_G:
				const mechaJaraxxusCardsToAdd =
					entity.cardId === CardIds.MechaJaraxxus_BG25_807
						? [CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, mechaJaraxxusCardsToAdd, gameState);
				break;
			case CardIds.OozelingGladiator_BG27_002:
			case CardIds.OozelingGladiator_BG27_002_G:
				const oozelingCardsToAdd =
					entity.cardId === CardIds.OozelingGladiator_BG27_002
						? [CardIds.TheCoinCore, CardIds.TheCoinCore]
						: [CardIds.TheCoinCore, CardIds.TheCoinCore, CardIds.TheCoinCore, CardIds.TheCoinCore];
				addCardsInHand(hero, board, oozelingCardsToAdd, gameState);
				break;
			case CardIds.UtherTheLightbringer_BG23_190:
			case CardIds.UtherTheLightbringer_BG23_190_G:
				const utherTarget = pickRandom(allMinions);
				const utherStats = entity.cardId === CardIds.UtherTheLightbringer_BG23_190 ? 15 : 30;
				utherTarget.attack = utherStats;
				utherTarget.health = utherStats;
				utherTarget.maxHealth = utherStats;
				break;
			case CardIds.IronGroundskeeper_BG27_000:
			case CardIds.IronGroundskeeper_BG27_000_G:
				const ironGroundskeeperTargets = allMinions;
				const ironGroundskeeperTarget = pickRandom(ironGroundskeeperTargets);
				ironGroundskeeperTarget.taunt = !ironGroundskeeperTarget.taunt;
				break;
			case CardIds.LivingConstellation_BG27_001:
			case CardIds.LivingConstellation_BG27_001_G:
				const differentTypes = extractUniqueTribes(board, gameState.allCards);
				const livingConstellationStats =
					(entity.cardId === CardIds.LivingConstellation_BG27_001 ? 1 : 2) * differentTypes.length;
				const livingConstellationTarget = pickRandom(board);
				modifyAttack(livingConstellationTarget, livingConstellationStats, board, gameState.allCards);
				modifyHealth(livingConstellationTarget, livingConstellationStats, board, gameState.allCards);
				afterStatsUpdate(livingConstellationTarget, board, gameState.allCards);
				gameState.spectator.registerPowerTarget(entity, livingConstellationTarget, board, hero, otherHero);
				break;
			case CardIds.FairyTaleCaroler_BG26_001:
			case CardIds.FairyTaleCaroler_BG26_001_G:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.FairyTaleCaroler_BG26_001 ? 2 : 4,
					entity.cardId === CardIds.FairyTaleCaroler_BG26_001 ? 2 : 4,
					gameState.allCards,
					gameState.spectator,
				);
				break;
			case CardIds.SparkLing_BG27_019:
			case CardIds.SparkLing_BG27_019_G:
				addStatsToBoard(
					entity,
					board.filter((e) => e.entityId != entity.entityId),
					entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
					entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
					gameState.allCards,
					gameState.spectator,
				);
				addStatsToBoard(
					entity,
					otherBoard,
					entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
					entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
					gameState.allCards,
					gameState.spectator,
				);
				break;
			case CardIds.EmergentFlame_BG27_018:
			case CardIds.EmergentFlame_BG27_018_G:
				const allBoards = [...board, ...otherBoard];
				const emergentFlameTarget = pickRandom(
					allBoards.filter((e) => hasCorrectTribe(e, Race.ELEMENTAL, gameState.allCards)),
				);
				const emergentFlameStats = entity.cardId === CardIds.EmergentFlame_BG27_018 ? 1 : 2;
				modifyAttack(emergentFlameTarget, emergentFlameStats, board, gameState.allCards);
				modifyHealth(emergentFlameTarget, emergentFlameStats, board, gameState.allCards);
				afterStatsUpdate(emergentFlameTarget, board, gameState.allCards);
				break;
			case CardIds.ArgentBraggart_BG_SCH_149:
			case CardIds.ArgentBraggart_TB_BaconUps_308:
				const highestAttack = Math.max(...allMinions.map((minion) => minion.attack));
				const highestHealth = Math.max(...allMinions.map((minion) => minion.health));
				const argentBraggartMultiplier = entity.cardId === CardIds.ArgentBraggart_BG_SCH_149 ? 1 : 2;
				entity.attack = argentBraggartMultiplier * highestAttack;
				entity.health = argentBraggartMultiplier * highestHealth;
				break;
			case CardIds.CaptainSanders_BG25_034:
			case CardIds.CaptainSanders_BG25_034_G:
				const captainSandersTarget = pickRandom(board.filter((e) => !isMinionGolden(e, gameState.allCards)));
				if (captainSandersTarget) {
					makeMinionGolden(
						captainSandersTarget,
						entity,
						board,
						hero,
						gameState.allCards,
						gameState.spectator,
						gameState.sharedState,
					);
				}
				break;
			case CardIds.SanguineChampion_BG23_017:
			case CardIds.SanguineChampion_BG23_017_G:
				const sanguineChampionStats = entity.cardId === CardIds.SanguineChampion_BG23_017 ? 1 : 2;
				hero.globalInfo.BloodGemAttackBonus += sanguineChampionStats;
				hero.globalInfo.BloodGemHealthBonus += sanguineChampionStats;
				break;
			case CardIds.Murky_BG24_012:
			case CardIds.Murky_BG24_012_G:
				const murkyScale = entity.cardId === CardIds.Murky_BG24_012 ? 1 : 2;
				// const murkyBattlecriesPlayed = entity.scriptDataNum1 > 0 ? entity.scriptDataNum1 / murkyScale - 1 : 0;
				const murkyStats = murkyScale * 10;
				const murkyTarget = pickRandom(
					board.filter((e) => hasCorrectTribe(e, Race.MURLOC, gameState.allCards)),
				);
				modifyAttack(murkyTarget, murkyStats, board, gameState.allCards);
				modifyHealth(murkyTarget, murkyStats, board, gameState.allCards);
				afterStatsUpdate(murkyTarget, board, gameState.allCards);
				break;
			case CardIds.LovesickBalladist_BG26_814:
			case CardIds.LovesickBalladist_BG26_814_G:
				const balladistMultiplier = entity.cardId === CardIds.LovesickBalladist_BG26_814 ? 1 : 2;
				const balladistStats = balladistMultiplier * (entity.scriptDataNum1 ?? 0);
				const balladistTarget = pickRandom(
					board.filter((e) => hasCorrectTribe(e, Race.PIRATE, gameState.allCards)),
				);
				if (balladistTarget) {
					modifyHealth(balladistTarget, balladistStats, board, gameState.allCards);
					afterStatsUpdate(balladistTarget, board, gameState.allCards);
					gameState.spectator.registerPowerTarget(entity, balladistTarget, board, hero, otherHero);
				}
				break;
			case CardIds.Amalgadon_BGS_069:
			case CardIds.Amalgadon_TB_BaconUps_121:
				const numberOfTribes = extractUniqueTribes(board, gameState.allCards).length;
				const amalgadonMultiplier = entity.cardId === CardIds.Amalgadon_BGS_069 ? 1 : 2;
				const totalAdapts = amalgadonMultiplier * numberOfTribes;
				for (let i = 0; i < totalAdapts; i++) {
					const adapts = [
						CardIds.FlamingClawsToken,
						CardIds.LivingSporesToken,
						CardIds.VolcanicMightToken,
						CardIds.RockyCarapaceToken,
					];
					if (!entity.divineShield) {
						adapts.push(CardIds.CracklingShieldToken);
					}
					if (!entity.windfury) {
						adapts.push(CardIds.LightningSpeedToken);
					}
					if (!entity.taunt) {
						adapts.push(CardIds.MassiveToken);
					}
					if (!entity.venomous && !entity.poisonous) {
						adapts.push(CardIds.PoisonSpitToken);
					}
					const adapt = pickRandom(adapts);
					switch (adapt) {
						case CardIds.FlamingClawsToken:
							modifyAttack(entity, 3, board, gameState.allCards);
							afterStatsUpdate(entity, board, gameState.allCards);
							break;
						case CardIds.LivingSporesToken:
							entity.enchantments = entity.enchantments ?? [];
							entity.enchantments.push({
								cardId: CardIds.LivingSpores_LivingSporesEnchantment,
								timing: 0,
							});
							break;
						case CardIds.LightningSpeedToken:
							entity.windfury = true;
							break;
						case CardIds.MassiveToken:
							entity.taunt = true;
							break;
						case CardIds.PoisonSpitToken:
							entity.poisonous = true;
							break;
						case CardIds.RockyCarapaceToken:
							modifyHealth(entity, 3, board, gameState.allCards);
							afterStatsUpdate(entity, board, gameState.allCards);
							break;
						case CardIds.CracklingShieldToken:
							entity.divineShield = true;
							break;
						case CardIds.VolcanicMightToken:
							modifyAttack(entity, 1, board, gameState.allCards);
							modifyHealth(entity, 1, board, gameState.allCards);
							afterStatsUpdate(entity, board, gameState.allCards);
							break;
					}
				}
				break;
			case CardIds.RodeoPerformer_BG28_550:
			case CardIds.RodeoPerformer_BG28_550_G:
				const rodeoPerformerCardsToAdd =
					entity.cardId === CardIds.RodeoPerformer_BG28_550_G ? [null] : [null, null];
				addCardsInHand(hero, board, rodeoPerformerCardsToAdd, gameState);
				break;
			default:
				hasTriggered = false;
				break;
		}
		if (hasTriggered) {
			afterBattlecryTriggered(
				entity,
				board,
				hero,
				otherBoard,
				otherHero,
				gameState.allCards,
				gameState.cardsData,
				gameState.spectator,
			);
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

// TODO: this is probably too slow
const extractUniqueTribes = (board: BoardEntity[], allCards: AllCardsService): readonly Race[] => {
	const boardReferenceCards = board.map((m) => allCards.getCard(m.cardId));
	const minionsPlayedWithTribes = boardReferenceCards.filter((c) => !!c.races?.length);
	const minionsToProcess: /*Mutable<ReferenceCard & { picked?: boolean }>*/ any[] = [
		...minionsPlayedWithTribes
			.filter((c) => !c.races.includes(Race[Race.ALL]))
			.map((c) => ({ ...c, races: [...c.races] })),
	];

	const uniqueTribes: Race[] = [];
	const maxTribesPerMinion = 2;
	for (let i = 1; i <= maxTribesPerMinion; i++) {
		let dirty = true;
		while (dirty) {
			dirty = false;
			for (let j = 0; j < minionsToProcess.length; j++) {
				const minion = minionsToProcess[j];
				// console.debug('considering minion', minion.name, minion.races);
				if (!minion.picked && minion.races.length > 0 && minion.races.length <= i) {
					const raceToAdd: string = minion.races[0];
					uniqueTribes.push(Race[raceToAdd]);
					// console.debug('added', raceToAdd, uniqueTribes);
					for (const m of minionsToProcess) {
						m.races = m.races.filter((r) => r !== raceToAdd);
						// console.debug('updates races', m.name, m.races, raceToAdd);
					}
					minion.picked = true;
					dirty = true;
					// Restart the loop, so we're not dependant on the order in which we process things
					j = 0;
				}
			}
			// minionsToProcess = minionsToProcess.filter((c) => !c.picked);
		}
	}

	uniqueTribes.push(
		...minionsPlayedWithTribes
			.filter((m) => m.races.includes(Race[Race.ALL]))
			.flatMap((m) => m.races)
			.map((r: string) => Race[r]),
	);
	return uniqueTribes;
};
