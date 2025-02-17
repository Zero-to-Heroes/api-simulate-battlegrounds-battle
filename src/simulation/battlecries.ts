import { AllCardsService, CardIds, CardType, GameTag, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasBattlecry, hasOnBattlecryTriggered } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { updateDivineShield } from '../keywords/divine-shield';
import { updateTaunt } from '../keywords/taunt';
import { updateWindfury } from '../keywords/windfury';
import { pickRandom, pickRandomAlive } from '../services/utils';
import {
	addStatsToBoard,
	buildSingleBoardEntity,
	getPlayerState,
	getRandomAliveMinion,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
} from '../utils';
import { getNeighbours } from './attack';
import { playBloodGemsOn } from './blood-gems';
import { addCardsInHand } from './cards-in-hand';
import { dealDamageToHero } from './damage-to-hero';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { SharedState } from './shared-state';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';
import { isMinionGolden, makeMinionGolden } from './utils/golden';

export const computeBattlecryMultiplier = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	sharedState: SharedState,
): number => {
	const brann = board.find(
		(entity) =>
			entity.cardId === CardIds.BrannBronzebeard_BG_LOE_077 ||
			// Should be a playtesting relic
			// entity.cardId === CardIds.BrannBronzebeard_BrannBronzebeardMurlocdragonToken_BG_LOE_077t ||
			entity.cardId === CardIds.MoiraBronzebeard_BG27_518,
	);
	const brannBlessings = boardHero.secrets?.some((e) => e.cardId === CardIds.BrannsBlessing_BG28_509);
	const brannBonus = !!brann || brannBlessings ? 2 : 0;
	const goldenBrann = board.find(
		(entity) =>
			entity.cardId === CardIds.BrannBronzebeard_TB_BaconUps_045 ||
			// entity.cardId === CardIds.BrannBronzebeard_BrannBronzebeardMurlocdragonToken_TB_BaconUps_045t ||
			entity.cardId === CardIds.MoiraBronzebeard_BG27_518_G,
	);
	const goldenBrannBonus = !!goldenBrann ? 3 : 0;
	const gilneanWarHorns =
		boardHero.questRewardEntities?.filter((entity) => entity.cardId === CardIds.GilneanWarHorn)?.length ?? 0;
	const echoesOfArgus = sharedState.anomalies.includes(CardIds.EchoesOfArgus_BG27_Anomaly_802) ? 1 : 0;

	const multiplier = echoesOfArgus + Math.max(goldenBrannBonus, brannBonus, 1) + gilneanWarHorns;
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

		const battlecryImpl = cardMappings[entity.cardId];
		if (hasBattlecry(battlecryImpl)) {
			battlecryImpl.battlecry(entity, {
				hero: hero,
				board: board,
				otherHero: otherHero,
				otherBoard: otherBoard,
				gameState,
			});
		} else {
			switch (entity.cardId) {
				case CardIds.RockpoolHunter_BG_UNG_073:
				case CardIds.RockpoolHunter_TB_BaconUps_061:
					const rockPoolTarget = getRandomAliveMinion(board, hero, Race.MURLOC, gameState.allCards);
					if (!!rockPoolTarget) {
						const rockpoolStats = entity.cardId === CardIds.RockpoolHunter_BG_UNG_073 ? 1 : 2;
						modifyStats(rockPoolTarget, rockpoolStats, rockpoolStats, board, hero, gameState);
						gameState.spectator.registerPowerTarget(entity, rockPoolTarget, board, hero, otherHero);
					}
					break;
				case CardIds.MenagerieMug_BGS_082:
				case CardIds.MenagerieMug_TB_BaconUps_144:
					const menagerieMugStats = entity.cardId === CardIds.MenagerieMug_BGS_082 ? 1 : 2;
					grantStatsToMinionsOfEachType(
						entity,
						board,
						hero,
						menagerieMugStats,
						menagerieMugStats,
						gameState,
						3,
					);
					break;
				case CardIds.SparringPartner_BG_AT_069:
				case CardIds.SparringPartner_BG_AT_069_G:
					const sparringPartnersTargets = allMinions.filter((e) => !e.taunt);
					const sparringPartnersTarget = pickRandom(sparringPartnersTargets);
					if (sparringPartnersTarget) {
						updateTaunt(sparringPartnersTarget, true, board, hero, otherHero, gameState);
					}
					break;
				case CardIds.TwilightEmissary_BGS_038:
				case CardIds.TwilightEmissary_TB_BaconUps_108:
					const twilightEmissaryTarget = getRandomAliveMinion(board, hero, Race.DRAGON, gameState.allCards);
					if (!!twilightEmissaryTarget) {
						const twilightEmissaryStats = entity.cardId === CardIds.TwilightEmissary_BGS_038 ? 2 : 4;
						modifyStats(
							twilightEmissaryTarget,
							twilightEmissaryStats,
							twilightEmissaryStats,
							board,
							hero,
							gameState,
						);
						gameState.spectator.registerPowerTarget(entity, twilightEmissaryTarget, board, hero, otherHero);
					}
					break;
				case CardIds.BloodsailCannoneer_BGS_053:
				case CardIds.BloodsailCannoneer_TB_BaconUps_138:
					addStatsToBoard(
						entity,
						board.filter((e) => e.entityId != entity.entityId),
						hero,
						entity.cardId === CardIds.BloodsailCannoneer_BGS_053 ? 3 : 6,
						0,
						gameState,
						Race[Race.PIRATE],
					);
					break;
				case CardIds.CrowsNestSentry_BG29_502:
				case CardIds.CrowsNestSentry_BG29_502_G:
					addStatsToBoard(
						entity,
						board.filter((e) => e.entityId != entity.entityId),
						hero,
						0,
						entity.cardId === CardIds.CrowsNestSentry_BG29_502 ? 4 : 8,
						gameState,
						Race[Race.PIRATE],
					);
					break;
				case CardIds.ColdlightSeerLegacy_BG_EX1_103:
				case CardIds.ColdlightSeerLegacy_TB_BaconUps_064:
					addStatsToBoard(
						entity,
						board.filter((e) => e.entityId != entity.entityId),
						hero,
						0,
						entity.cardId === CardIds.ColdlightSeerLegacy_BG_EX1_103 ? 2 : 4,
						gameState,
						Race[Race.MURLOC],
					);
					break;
				case CardIds.FelfinNavigator_BG_BT_010:
				case CardIds.FelfinNavigator_TB_BaconUps_124:
					addStatsToBoard(
						entity,
						board.filter((e) => e.entityId != entity.entityId),
						hero,
						entity.cardId === CardIds.FelfinNavigator_TB_BaconUps_124 ? 2 : 1,
						entity.cardId === CardIds.FelfinNavigator_TB_BaconUps_124 ? 2 : 1,
						gameState,
						Race[Race.MURLOC],
					);
					break;
				case CardIds.KeyboardIgniter_BG26_522:
				case CardIds.KeyboardIgniter_BG26_522_G:
					const numberOfTimesToTrigger = entity.cardId === CardIds.KeyboardIgniter_BG26_522 ? 1 : 2;
					for (let i = 0; i < numberOfTimesToTrigger; i++) {
						addStatsToBoard(
							entity,
							board.filter((e) => e.entityId != entity.entityId),
							hero,
							2,
							2,
							gameState,
							Race[Race.DEMON],
						);
						dealDamageToHero(entity, hero, board, 2, gameState);
					}
					break;
				case CardIds.MoonBaconJazzer_BG26_159:
				case CardIds.MoonBaconJazzer_BG26_159_G:
					// console.debug('triggering moonbaconjazzer');
					const moonBaconJazzerStats = entity.cardId === CardIds.MoonBaconJazzer_BG26_159 ? 1 : 2;
					hero.globalInfo.BloodGemHealthBonus =
						(hero.globalInfo?.BloodGemHealthBonus ?? 0) + moonBaconJazzerStats;
					break;
				case CardIds.Smogger_BG21_021:
				case CardIds.Smogger_BG21_021_G:
					const smoggerLoops = entity.cardId === CardIds.Smogger_BG21_021 ? 1 : 2;
					for (let i = 0; i < smoggerLoops; i++) {
						const smoggerTarget = getRandomAliveMinion(board, hero, Race.ELEMENTAL, gameState.allCards);
						const smoggerStats = hero.tavernTier ?? 3;
						modifyStats(smoggerTarget, smoggerStats, smoggerStats, board, hero, gameState);
						gameState.spectator.registerPowerTarget(entity, smoggerTarget, board, hero, otherHero);
					}
					break;
				case CardIds.AnnihilanBattlemaster_BGS_010:
				case CardIds.AnnihilanBattlemaster_TB_BaconUps_083:
					// TODO: pass damage taken info
					const startingHp = hero.cardId === CardIds.Patchwerk_TB_BaconShop_HERO_34 ? 60 : 30;
					const hpMissing = startingHp - hero.hpLeft;
					const annihilanStats =
						(entity.cardId === CardIds.AnnihilanBattlemaster_BGS_010 ? 2 : 4) * hpMissing;
					modifyStats(entity, 0, annihilanStats, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, hero, otherHero);
					break;
				case CardIds.Necrolyte_BG20_202:
				case CardIds.Necrolyte_BG20_202_G:
					// console.debug('triggering necrolyte', entity.entityId);
					const necrolyteBloodGems = entity.cardId === CardIds.Necrolyte_BG20_202 ? 2 : 4;
					const necrolyteTarget = pickRandom(board);
					playBloodGemsOn(entity, necrolyteTarget, necrolyteBloodGems, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, necrolyteTarget, board, hero, otherHero);

					const necrolyteTargetNeighbours = getNeighbours(board, necrolyteTarget);
					for (const neighbour of necrolyteTargetNeighbours) {
						const bloodGemStatsEnchantment = neighbour.enchantments?.find(
							(e) => e.cardId === CardIds.BloodGem_BloodGemsEnchantment,
						);
						if (bloodGemStatsEnchantment) {
							const atk = bloodGemStatsEnchantment.tagScriptDataNum1 ?? 0;
							const heath = bloodGemStatsEnchantment.tagScriptDataNum2 ?? 0;
							neighbour.attack = Math.max(0, neighbour.attack - atk);
							neighbour.health = Math.max(1, neighbour.health - heath);
							neighbour.maxHealth = Math.max(1, neighbour.maxHealth - heath);
							necrolyteTarget.attack += atk;
							necrolyteTarget.health += heath;
							necrolyteTarget.maxHealth += heath;
							gameState.spectator.registerPowerTarget(necrolyteTarget, neighbour, board, hero, otherHero);
						}
					}
					break;
				case CardIds.StrongshellScavenger_BG_ICC_807:
				case CardIds.StrongshellScavenger_TB_BaconUps_072:
					const strongshellScavengerStats = entity.cardId === CardIds.StrongshellScavenger_BG_ICC_807 ? 2 : 4;
					const strongshellScavengerTargets = board
						.filter((e) => e.entityId != entity.entityId)
						.filter((e) => e.taunt);
					strongshellScavengerTargets.forEach((target) => {
						modifyStats(
							target,
							strongshellScavengerStats,
							strongshellScavengerStats,
							board,
							hero,
							gameState,
						);
						gameState.spectator.registerPowerTarget(entity, target, board, hero, otherHero);
					});
					break;
				case CardIds.VigilantStoneborn_BG24_023:
				case CardIds.VigilantStoneborn_BG24_023_G:
					const vigilantStonebornTarget = pickRandom(board);
					const vigilantStonebornStats = entity.cardId === CardIds.VigilantStoneborn_BG24_023 ? 6 : 12;
					updateTaunt(vigilantStonebornTarget, true, board, hero, otherHero, gameState);
					modifyStats(vigilantStonebornTarget, 0, vigilantStonebornStats, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, vigilantStonebornTarget, board, hero, otherHero);
					break;
				case CardIds.Bonemare_BG26_ICC_705:
				case CardIds.Bonemare_BG26_ICC_705_G:
					const bonemareTarget = pickRandom(board);
					const bonemareStats = entity.cardId === CardIds.Bonemare_BG26_ICC_705 ? 4 : 8;
					updateTaunt(bonemareTarget, true, board, hero, otherHero, gameState);
					modifyStats(bonemareTarget, bonemareStats, bonemareStats, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, bonemareTarget, board, hero, otherHero);
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
					updateTaunt(
						ironGroundskeeperTarget,
						!ironGroundskeeperTarget.taunt,
						board,
						hero,
						otherHero,
						gameState,
					);
					break;
				case CardIds.LivingConstellation_BG27_001:
				case CardIds.LivingConstellation_BG27_001_G:
					const differentTypes = extractUniqueTribes(board, gameState.allCards);
					const livingConstellationStats =
						(entity.cardId === CardIds.LivingConstellation_BG27_001 ? 1 : 2) * differentTypes.length;
					const livingConstellationTarget = pickRandom(allMinions);
					const boardForTarget = board.includes(livingConstellationTarget) ? board : otherBoard;
					modifyStats(
						livingConstellationTarget,
						livingConstellationStats,
						livingConstellationStats,
						boardForTarget,
						hero,
						gameState,
					);
					gameState.spectator.registerPowerTarget(
						entity,
						livingConstellationTarget,
						boardForTarget,
						hero,
						otherHero,
					);
					break;
				case CardIds.FairyTaleCaroler_BG26_001:
				case CardIds.FairyTaleCaroler_BG26_001_G:
					addStatsToBoard(
						entity,
						board.filter((e) => e.entityId != entity.entityId),
						hero,
						entity.cardId === CardIds.FairyTaleCaroler_BG26_001 ? 2 : 4,
						entity.cardId === CardIds.FairyTaleCaroler_BG26_001 ? 2 : 4,
						gameState,
					);
					break;
				case CardIds.SparkLing_BG27_019:
				case CardIds.SparkLing_BG27_019_G:
					addStatsToBoard(
						entity,
						board.filter((e) => e.entityId != entity.entityId),
						hero,
						entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
						entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
						gameState,
					);
					addStatsToBoard(
						entity,
						otherBoard,
						hero,
						entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
						entity.cardId === CardIds.SparkLing_BG27_019 ? 1 : 2,
						gameState,
					);
					break;
				case CardIds.EmergentFlame_BG27_018:
				case CardIds.EmergentFlame_BG27_018_G:
					const emergentFlameTarget = pickRandom(
						allMinions.filter((e) => hasCorrectTribe(e, hero, Race.ELEMENTAL, gameState.allCards)),
					);
					if (!!emergentFlameTarget) {
						const targetBoard = board.includes(emergentFlameTarget) ? board : otherBoard;
						const targetHero = board.includes(emergentFlameTarget) ? hero : otherHero;
						const emergentFlameMultiplier = entity.cardId === CardIds.EmergentFlame_BG27_018 ? 1 : 2;
						const emergentFlameStats = (entity.scriptDataNum1 ?? 1) * emergentFlameMultiplier;
						modifyStats(
							emergentFlameTarget,
							emergentFlameStats,
							emergentFlameStats,
							targetBoard,
							targetHero,
							gameState,
						);
						gameState.spectator.registerPowerTarget(
							entity,
							emergentFlameTarget,
							targetBoard,
							hero,
							otherHero,
						);
					}
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
					const captainSandersTarget = pickRandom(
						board.filter((e) => !isMinionGolden(e, gameState.allCards)),
					);
					if (captainSandersTarget) {
						makeMinionGolden(captainSandersTarget, entity, board, hero, otherBoard, otherHero, gameState);
					}
					break;
				case CardIds.SanguineChampion_BG23_017:
				case CardIds.SanguineChampion_BG23_017_G:
					const sanguineChampionStats = entity.cardId === CardIds.SanguineChampion_BG23_017 ? 1 : 2;
					hero.globalInfo.BloodGemAttackBonus += sanguineChampionStats;
					hero.globalInfo.BloodGemHealthBonus += sanguineChampionStats;
					break;
				case CardIds.FacelessDisciple_BG24_719:
				case CardIds.FacelessDisciple_BG24_719_G:
					const target = pickRandom(allMinions.filter((e) => !e.definitelyDead && e.health > 0));
					if (target) {
						gameState.spectator.registerPowerTarget(entity, target, board, hero, otherHero);
						const minionTier = gameState.cardsData.getTavernLevel(target.cardId);
						const targetTier =
							entity.cardId === CardIds.FacelessDisciple_BG24_719 ? minionTier + 1 : minionTier + 2;
						const maxTier = !!gameState.anomalies?.includes(CardIds.SecretsOfNorgannon_BG27_Anomaly_504)
							? 7
							: 6;
						const newMinionId = gameState.cardsData.getRandomMinionForTavernTier(
							Math.min(maxTier, targetTier),
						);
						const targetBoard = board.includes(target) ? board : otherBoard;
						const targetHero = board.includes(target) ? hero : otherHero;
						const newMinion = buildSingleBoardEntity(
							newMinionId,
							hero,
							board,
							gameState.allCards,
							targetHero.friendly,
							gameState.sharedState.currentEntityId++,
							false,
							gameState.cardsData,
							gameState.sharedState,
							null,
						);
						// Replace the target with the new minion
						const index = targetBoard.indexOf(target);
						// console.debug('board before disciple', stringifySimple(targetBoard, gameState.allCards));
						targetBoard.splice(index, 1, newMinion);
						// console.debug('board after disciple', stringifySimple(targetBoard, gameState.allCards));
						gameState.spectator.registerPowerTarget(entity, newMinion, targetBoard, hero, otherHero);
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
								modifyStats(entity, 3, 0, board, hero, gameState);
								break;
							case CardIds.LivingSporesToken:
								entity.enchantments = entity.enchantments ?? [];
								entity.enchantments.push({
									cardId: CardIds.LivingSpores_LivingSporesEnchantment,
									timing: 0,
								});
								break;
							case CardIds.LightningSpeedToken:
								updateWindfury(entity, true, board, hero, otherHero, gameState);
								break;
							case CardIds.MassiveToken:
								updateTaunt(entity, true, board, hero, otherHero, gameState);
								break;
							case CardIds.PoisonSpitToken:
								entity.poisonous = true;
								break;
							case CardIds.RockyCarapaceToken:
								modifyStats(entity, 0, 3, board, hero, gameState);
								break;
							case CardIds.CracklingShieldToken:
								updateDivineShield(entity, board, hero, otherHero, true, gameState);
								break;
							case CardIds.VolcanicMightToken:
								modifyStats(entity, 1, 1, board, hero, gameState);
								break;
						}
					}
					break;
				case CardIds.Eagill_BG28_630:
				case CardIds.Eagill_BG28_630_G:
					const eagillMultiplier = entity.cardId === CardIds.Eagill_BG28_630 ? 1 : 2;
					const eagillBoardTarget = pickRandom(board.filter((e) => e.entityId !== entity.entityId));
					if (eagillBoardTarget) {
						modifyStats(
							eagillBoardTarget,
							2 * eagillMultiplier,
							3 * eagillMultiplier,
							board,
							hero,
							gameState,
						);
						gameState.spectator.registerPowerTarget(entity, eagillBoardTarget, board, hero, otherHero);
					}
					const eagillHandTarget = pickRandom(
						hero.hand.filter(
							(e) =>
								gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
						),
					);
					if (eagillHandTarget) {
						modifyStats(
							eagillHandTarget,
							2 * eagillMultiplier,
							3 * eagillMultiplier,
							board,
							hero,
							gameState,
						);
						gameState.spectator.registerPowerTarget(entity, eagillHandTarget, board, hero, otherHero);
					}
					break;
				case CardIds.Weebomination_TB_BaconShop_HERO_34_Buddy:
				case CardIds.Weebomination_TB_BaconShop_HERO_34_Buddy_G:
					const weebominationMultiplier =
						entity.cardId === CardIds.Weebomination_TB_BaconShop_HERO_34_Buddy ? 1 : 2;
					const weebominationTarget = pickRandom(allMinions);
					if (weebominationTarget) {
						const heroMaxHealth = gameState.allCards.getCard(hero.cardId)?.health ?? 40;
						const heroMissingHealth = heroMaxHealth - hero.hpLeft;
						const weebominationBuff = weebominationMultiplier * heroMissingHealth;
						modifyStats(weebominationTarget, 0, weebominationBuff, board, hero, gameState);
						gameState.spectator.registerPowerTarget(entity, weebominationTarget, board, hero, otherHero);
					}
					break;
				case CardIds.GoldshellWarden_BG29_803:
				case CardIds.GoldshellWarden_BG29_803_G:
					const goldshellMultiplier = entity.cardId === CardIds.GoldshellWarden_BG29_803_G ? 2 : 1;
					addStatsToBoard(
						entity,
						board.filter((e) => e.entityId != entity.entityId),
						hero,
						goldshellMultiplier * 2,
						goldshellMultiplier * 4,
						gameState,
						Race[Race.BEAST],
					);
					break;
				case CardIds.ShellWhistler_BG26_045:
				case CardIds.ShellWhistler_BG26_045_G:
					const shellWhistlerCardsToAdd =
						entity.cardId === CardIds.ShellWhistler_BG26_045_G ? [null] : [null, null];
					addCardsInHand(hero, board, shellWhistlerCardsToAdd, gameState);
					break;
				case CardIds.DisguisedGraverobber_BG28_303:
				case CardIds.DisguisedGraverobber_BG28_303_G:
					const disguisedGraverobberTarget = pickRandomAlive(
						board.filter((e) => hasCorrectTribe(e, hero, Race.UNDEAD, gameState.allCards)),
					);
					if (disguisedGraverobberTarget) {
						const disguisedGraverobberNumberOfCopies =
							entity.cardId === CardIds.DisguisedGraverobber_BG28_303 ? 1 : 2;
						disguisedGraverobberTarget.definitelyDead = true;
						const copies = Array.from({ length: disguisedGraverobberNumberOfCopies }).map(
							(_) => disguisedGraverobberTarget.cardId,
						);
						addCardsInHand(hero, board, copies, gameState);
					}
					break;
				case CardIds.FriendlySaloonkeeper_BGDUO_104:
				case CardIds.FriendlySaloonkeeper_BGDUO_104_G:
					const playerState = getPlayerState(gameState.gameState, hero);
					if (playerState) {
						const cardsToAdd =
							entity.cardId === CardIds.FriendlySaloonkeeper_BGDUO_104
								? [CardIds.TheCoinCore]
								: [CardIds.TheCoinCore, CardIds.TheCoinCore];
						addCardsInHand(playerState.player, playerState.board, cardsToAdd, gameState);
					}
					break;
				case CardIds.GenerousGeomancer_BGDUO_111:
				case CardIds.GenerousGeomancer_BGDUO_111_G:
					const cardsToAdd =
						entity.cardId === CardIds.GenerousGeomancer_BGDUO_111
							? [CardIds.BloodGem]
							: [CardIds.BloodGem, CardIds.BloodGem];
					addCardsInHand(
						gameState.gameState.player.player,
						gameState.gameState.player.board,
						cardsToAdd,
						gameState,
					);
					if (gameState.gameState.player.teammate) {
						addCardsInHand(
							gameState.gameState.player.teammate.player,
							gameState.gameState.player.teammate.board,
							cardsToAdd,
							gameState,
						);
					}
					break;
				case CardIds.OrcEstraConductor_BGDUO_119:
				case CardIds.OrcEstraConductor_BGDUO_119_G:
					const conductorTarget = pickRandom(
						allMinions.filter((e) => hasCorrectTribe(e, hero, Race.ELEMENTAL, gameState.allCards)),
					);
					if (!!conductorTarget) {
						const targetBoard = board.includes(conductorTarget) ? board : otherBoard;
						const targetHero = board.includes(conductorTarget) ? hero : otherHero;
						const multiplier = entity.cardId === CardIds.OrcEstraConductor_BGDUO_119 ? 1 : 2;
						const attackStats = 2 * (entity.scriptDataNum1 ?? 1) * multiplier;
						const healthStats = 2 * (entity.scriptDataNum1 ?? 1) * multiplier;
						modifyStats(conductorTarget, attackStats, healthStats, targetBoard, targetHero, gameState);
						gameState.spectator.registerPowerTarget(entity, conductorTarget, targetBoard, hero, otherHero);
					}
					break;
				case CardIds.FacelessOne_BGDUO_HERO_100_Buddy:
				case CardIds.FacelessOne_BGDUO_HERO_100_Buddy_G:
					const facelessOneCardsToAdd =
						entity.cardId === CardIds.FacelessOne_BGDUO_HERO_100_Buddy ? [null] : [null, null];
					addCardsInHand(hero, board, facelessOneCardsToAdd, gameState);
					break;
				case CardIds.Phyresz_TB_BaconShop_HERO_91_Buddy:
				case CardIds.Phyresz_TB_BaconShop_HERO_91_Buddy_G:
					const phyreszCardsToAdd =
						entity.cardId === CardIds.Phyresz_TB_BaconShop_HERO_91_Buddy ? [null] : [null, null];
					addCardsInHand(hero, board, phyreszCardsToAdd, gameState);
					break;
				case CardIds.Muckslinger_TB_BaconShop_HERO_23_Buddy:
				case CardIds.Muckslinger_TB_BaconShop_HERO_23_Buddy_G:
					const muckslingerCardsToAdd =
						entity.cardId === CardIds.Muckslinger_TB_BaconShop_HERO_23_Buddy
							? [pickRandom(gameState.cardsData.battlecryMinions)]
							: [
									pickRandom(gameState.cardsData.battlecryMinions),
									pickRandom(gameState.cardsData.battlecryMinions),
							  ];
					addCardsInHand(hero, board, muckslingerCardsToAdd, gameState);
					break;
				case CardIds.BarrensBrawler_BG29_861:
				case CardIds.BarrensBrawler_BG29_861_G:
					const barrendsBrawlerCardsToAdd =
						entity.cardId === CardIds.BarrensBrawler_BG29_861
							? [pickRandom(gameState.cardsData.deathrattleMinions)]
							: [
									pickRandom(gameState.cardsData.deathrattleMinions),
									pickRandom(gameState.cardsData.deathrattleMinions),
							  ];
					addCardsInHand(hero, board, barrendsBrawlerCardsToAdd, gameState);
					break;
				case CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy:
				case CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G:
					const vaelastraszBonus = entity.cardId === CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G ? 6 : 3;
					board
						.filter((e) => e.entityId !== entity.entityId)
						.forEach((e) => {
							modifyStats(e, vaelastraszBonus, vaelastraszBonus, board, hero, gameState);
						});
					break;
				case CardIds.NathanosBlightcaller_BG23_HERO_306_Buddy:
				case CardIds.NathanosBlightcaller_BG23_HERO_306_Buddy_G:
					const nathanosTarget = pickRandom(board);
					if (nathanosTarget) {
						gameState.spectator.registerPowerTarget(entity, nathanosTarget, board, null, null);
						nathanosTarget.definitelyDead = true;
						const buffMultiplier =
							entity.cardId === CardIds.NathanosBlightcaller_BG23_HERO_306_Buddy ? 1 : 2;
						const attackBuff = nathanosTarget.attack * buffMultiplier;
						const healthBuff = nathanosTarget.health * buffMultiplier;
						const buffTargets = getNeighbours(board, nathanosTarget);
						buffTargets.forEach((e) => {
							modifyStats(e, attackBuff, healthBuff, board, hero, gameState);
							gameState.spectator.registerPowerTarget(entity, e, board, null, null);
						});
					}
					break;
				case CardIds.TuskarrRaider_TB_BaconShop_HERO_18_Buddy:
				case CardIds.TuskarrRaider_TB_BaconShop_HERO_18_Buddy_G:
					const tuskarrTarget = pickRandom(allMinions);
					if (tuskarrTarget) {
						gameState.spectator.registerPowerTarget(entity, tuskarrTarget, board, null, null);
						const buffMultiplier =
							entity.cardId === CardIds.TuskarrRaider_TB_BaconShop_HERO_18_Buddy ? 1 : 2;
						const attackBuff = (hero.globalInfo.PiratesPlayedThisGame ?? 0) * buffMultiplier;
						const healthBuff = (hero.globalInfo.PiratesPlayedThisGame ?? 0) * buffMultiplier;
						modifyStats(tuskarrTarget, attackBuff, healthBuff, board, hero, gameState);
					}
					break;
				case CardIds.LuckyEgg_BG30_104:
				case CardIds.LuckyEgg_BG30_104_G:
					if (board.length > 0) {
						const transformedInto = gameState.cardsData.getRandomMinionForTavernTier(3);
						const premiumDbfId = gameState.allCards.getCard(transformedInto).battlegroundsPremiumDbfId;
						const goldenCardId = gameState.allCards.getCard(premiumDbfId).id;
						const currentIndex = board.findIndex((e) => e.entityId === entity.entityId);
						const currentIndexFromRight = board.length - currentIndex - 1;
						board.splice(currentIndex, 1);
						const newMinions = spawnEntities(
							goldenCardId,
							1,
							board,
							hero,
							otherBoard,
							otherHero,
							gameState.allCards,
							gameState.cardsData,
							gameState.sharedState,
							gameState.spectator,
							entity.friendly,
							false,
						);
						const spawns = performEntitySpawns(
							newMinions,
							board,
							hero,
							entity,
							currentIndexFromRight,
							otherBoard,
							otherHero,
							gameState,
						);
					}
					break;
				case CardIds.MuseumMummy_BG30_850:
				case CardIds.MuseumMummy_BG30_850_G:
					const newMinions = spawnEntities(
						entity.cardId === CardIds.MuseumMummy_BG30_850_G
							? CardIds.Skeleton_BG_ICC_026t_G
							: CardIds.SkeletonToken,
						1,
						board,
						hero,
						otherBoard,
						otherHero,
						gameState.allCards,
						gameState.cardsData,
						gameState.sharedState,
						gameState.spectator,
						entity.friendly,
						false,
					);
					const indexFromRight = board.length - board.findIndex((e) => e.entityId === entity.entityId) - 1;
					const spawns = performEntitySpawns(
						newMinions,
						board,
						hero,
						entity,
						indexFromRight,
						otherBoard,
						otherHero,
						gameState,
					);
					break;
				default:
					// All hte Battlecry minions that arent implemented / have no effect on the board state
					const hasBattlecry = gameState.allCards
						.getCard(entity.cardId)
						?.mechanics?.includes(GameTag[GameTag.BATTLECRY]);
					hasTriggered = hasBattlecry;
					break;
			}
		}
		if (hasTriggered) {
			afterBattlecryTriggered(entity, board, hero, otherBoard, otherHero, gameState);
		}
	}
};

const afterBattlecryTriggered = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	for (const boardEntity of board) {
		const onBattlecryTriggeredImpl = cardMappings[boardEntity.cardId];
		if (hasOnBattlecryTriggered(onBattlecryTriggeredImpl)) {
			onBattlecryTriggeredImpl.onBattlecryTriggered(boardEntity, {
				board: board,
				hero: hero,
				otherBoard: otherBoard,
				otherHero: otherHero,
				gameState: gameState,
			});
		}
	}
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

export interface BattlecryInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherBoard: BoardEntity[];
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}
export type OnBattlecryTriggeredInput = BattlecryInput;
