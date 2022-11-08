import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData, WHELP_CARD_IDS } from '../cards/cards-data';
import {
	addCardsInHand,
	addStatsToBoard,
	afterStatsUpdate,
	buildSingleBoardEntity,
	hasCorrectTribe,
	isCorrectTribe,
	modifyAttack,
	modifyHealth,
	stringifySimple,
} from '../utils';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const spawnEntities = (
	cardId: string,
	quantity: number,
	boardToSpawnInto: BoardEntity[],
	boardToSpawnIntoHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
	friendly: boolean,
	// In most cases the business of knowing the number of minions to handle is left to the caller
	limitSpawns: boolean,
	spawnReborn = false,
	useKhadgar = true,
	boardEntityToSpawn: BoardEntity = null,
): readonly BoardEntity[] => {
	if (!cardId) {
		console.error('Cannot spawn a minion without any cardId defined', stringifySimple(boardToSpawnInto, allCards), new Error().stack);
	}
	const spawnMultiplier = useKhadgar
		? 2 * boardToSpawnInto.filter((entity) => entity.cardId === CardIds.Khadgar_BG_DAL_575).length || 1
		: 1;
	const spawnMultiplierGolden = useKhadgar
		? 3 * boardToSpawnInto.filter((entity) => entity.cardId === CardIds.KhadgarBattlegrounds).length || 1
		: 1;
	const minionsToSpawn = limitSpawns
		? Math.min(quantity * spawnMultiplier * spawnMultiplierGolden, 7 - boardToSpawnInto.length)
		: quantity * spawnMultiplier * spawnMultiplierGolden;
	const result: BoardEntity[] = [];
	for (let i = 0; i < minionsToSpawn; i++) {
		const newMinion = !!boardEntityToSpawn
			? { ...boardEntityToSpawn, entityId: sharedState.currentEntityId++ }
			: buildSingleBoardEntity(
					cardId,
					boardToSpawnIntoHero,
					boardToSpawnInto,
					allCards,
					friendly,
					sharedState.currentEntityId++,
					spawnReborn,
					cardsData,
					spectator,
			  );

		if (hasCorrectTribe(newMinion, Race.BEAST, allCards)) {
			const packLeaders = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.PackLeader);
			packLeaders.forEach((buffer) => {
				modifyAttack(newMinion, 2, boardToSpawnInto, allCards);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});

			const packLeaderBattlegrounds = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.PackLeaderBattlegrounds);
			packLeaderBattlegrounds.forEach((buffer) => {
				modifyAttack(newMinion, 4, boardToSpawnInto, allCards);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});

			const mamaBears = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.MamaBear);
			mamaBears.forEach((buffer) => {
				modifyAttack(newMinion, 5, boardToSpawnInto, allCards);
				modifyHealth(newMinion, 5, boardToSpawnInto, allCards);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});

			const mamaBearBattlegrounds = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.MamaBearBattlegrounds);
			mamaBearBattlegrounds.forEach((buffer) => {
				modifyAttack(newMinion, 10, boardToSpawnInto, allCards);
				modifyHealth(newMinion, 10, boardToSpawnInto, allCards);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});
		}

		if (!newMinion.cardId) {
			console.warn('Invalid spawn', newMinion, cardId);
		}
		result.push(newMinion);

		if (isCorrectTribe(allCards.getCard(newMinion.cardId).race, Race.DEMON)) {
			const bigfernals = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.Bigfernal);
			const goldenBigfernals = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.BigfernalBattlegrounds);
			bigfernals.forEach((entity) => {
				modifyAttack(entity, 1, boardToSpawnInto, allCards);
				modifyHealth(entity, 1, boardToSpawnInto, allCards);
				afterStatsUpdate(entity, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(entity, entity, boardToSpawnInto);
			});
			goldenBigfernals.forEach((entity) => {
				modifyAttack(entity, 2, boardToSpawnInto, allCards);
				modifyHealth(entity, 2, boardToSpawnInto, allCards);
				afterStatsUpdate(entity, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(entity, entity, boardToSpawnInto);
			});
		}

		if (hasCorrectTribe(newMinion, Race.DEMON, allCards)) {
			addOldMurkeyeAttack(boardToSpawnInto, allCards);
			addOldMurkeyeAttack(otherBoard, allCards);
		}

		// https://twitter.com/LoewenMitchell/status/1491879869457879040
		if (WHELP_CARD_IDS.includes(newMinion.cardId as CardIds)) {
			const manyWhelps = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.ManyWhelps);
			const goldenManyWhelps = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.ManyWhelpsBattlegrounds);
			manyWhelps.forEach((entity) => {
				modifyAttack(entity, 2, boardToSpawnInto, allCards);
				modifyHealth(entity, 2, boardToSpawnInto, allCards);
				afterStatsUpdate(entity, boardToSpawnInto, allCards);
			});
			goldenManyWhelps.forEach((entity) => {
				modifyAttack(entity, 4, boardToSpawnInto, allCards);
				modifyHealth(entity, 4, boardToSpawnInto, allCards);
				afterStatsUpdate(entity, boardToSpawnInto, allCards);
			});
		}
	}

	return result;
};

const addOldMurkeyeAttack = (board: BoardEntity[], allCards: AllCardsService) => {
	const murkeyes = board.filter((entity) => entity.cardId === CardIds.OldMurkEyeLegacy || entity.cardId === CardIds.OldMurkEyeVanilla);
	const goldenMurkeyes = board.filter((entity) => entity.cardId === CardIds.OldMurkEyeBattlegrounds);
	murkeyes.forEach((entity) => {
		modifyAttack(entity, 1, board, allCards);
		afterStatsUpdate(entity, board, allCards);
	});
	goldenMurkeyes.forEach((entity) => {
		modifyAttack(entity, 2, board, allCards);
		afterStatsUpdate(entity, board, allCards);
	});
};

export const spawnEntitiesFromDeathrattle = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	entitiesDeadThisAttack: readonly BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): readonly BoardEntity[] => {
	// Because if the baron dies because of a cleave, it still applies its effect to the other entities that died this turn
	const rivendare = [...boardWithDeadEntity, ...entitiesDeadThisAttack].find(
		(entity) => entity.cardId === CardIds.BaronRivendare_BG_FP1_031,
	);
	const goldenRivendare = [...boardWithDeadEntity, ...entitiesDeadThisAttack].find(
		(entity) => entity.cardId === CardIds.BaronRivendareBattlegrounds,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	const spawnedEntities: BoardEntity[] = [];
	// const otherBoardSpawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < multiplier; i++) {
		switch (deadEntity.cardId) {
			case CardIds.Mecharoo:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.Mecharoo_JoEBotToken,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.MecharooBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.Mecharoo_JoEBotTokenBattlegrounds,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.PiggybackImp_BG_AV_309:
			case CardIds.PiggybackImpBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						deadEntity.cardId === CardIds.PiggybackImpBattlegrounds
							? CardIds.PiggybackImp_BackpiggyImpToken_BG_AV_309t
							: CardIds.PiggybackImp_BackpiggyImpToken_AV_309t,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.Scallywag:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.Scallywag_SkyPirateToken,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.ScallywagBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.Scallywag_SkyPirateTokenBattlegrounds,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.IckyImp_BG21_029:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.ImpGangBoss_ImpToken,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.IckyImp_BG21_029_G:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.ImpGangBoss_ImpTokenBattlegrounds,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.HarvestGolemLegacy_BG_EX1_556:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.DamagedGolemLegacy,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.HarvestGolemLegacyBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.HarvestGolem_DamagedGolemLegacyTokenBattlegrounds,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.SewerRat:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.SewerRat_HalfShellToken,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.SewerRatBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.SewerRat_HalfShellTokenBattlegrounds,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.KindlyGrandmother_KAR_005:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.KindlyGrandmother_BigBadWolf,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.KindlyGrandmotherBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.KindlyGrandmother_BigBadWolfTokenBattlegrounds,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.RatPack_BG_CFM_316:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.RatPack_RatToken_BG_CFM_316t,
						deadEntity.attack,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.RatPackBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.RatPack_RatTokenBattlegrounds,
						deadEntity.attack,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.Imprisoner:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.ImpGangBoss_ImpToken,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.ImprisonerBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.ImpGangBoss_ImpTokenBattlegrounds,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.InfestedWolf:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.InfestedWolf_Spider,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.InfestedWolfBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.InfestedWolf_SpiderTokenBattlegrounds,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			// case CardIds.TheBeastLegacy:
			// case CardIds.TheBeastBattlegrounds:
			// 	otherBoardSpawnedEntities.push(
			// 		...spawnEntities(
			// 			CardIds.FinkleEinhornLegacy,
			// 			1,
			// 			otherBoard,
			// 			otherBoardHero,
			// 			boardWithDeadEntity,
			// 			boardWithDeadEntityHero,
			// 			allCards,
			// 			spawns,
			// 			sharedState,
			// 			spectator,
			// 			!deadEntity.friendly,
			// 			false,
			// 		),
			// 	);
			// 	break;
			case CardIds.ReplicatingMenace_BG_BOT_312:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t,
						3,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.ReplicatingMenaceBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.ReplicatingMenace_MicrobotTokenBattlegrounds,
						3,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.MechanoEgg:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.MechanoEgg_RobosaurToken,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.MechanoEggBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.MechanoEgg_RobosaurTokenBattlegrounds,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.SavannahHighmaneLegacy_BG_EX1_534:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.SavannahHighmane_HyenaLegacyToken_BG_EX1_534t,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.SavannahHighmaneLegacyBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.SavannahHighmane_HyenaLegacyTokenBattlegrounds,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.RingMatron_BG_DMF_533:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.RingMatron_FieryImpToken_BG_DMF_533t,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.RingMatronBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.RingMatron_FieryImpTokenBattlegrounds,
						2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.SatedThreshadon:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.PrimalfinTotem_PrimalfinToken,
						3,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.SatedThreshadonBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.SatedThreshadon_PrimalfinTokenBattlegrounds,
						3,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.Ghastcoiler_BGS_008:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				break;
			case CardIds.GentleDjinni:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.gentleDjinniSpawns[Math.floor(Math.random() * spawns.gentleDjinniSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				// Not totally exact, since the DR could be prevented by other DR triggering at the same time,
				// but close enough for now
				addCardsInHand(
					boardWithDeadEntityHero,
					Math.min(1, 7 - boardWithDeadEntity.length),
					boardWithDeadEntity,
					allCards,
					spectator,
				);
				break;
			case CardIds.GentleDjinniBattlegrounds:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.gentleDjinniSpawns[Math.floor(Math.random() * spawns.gentleDjinniSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.gentleDjinniSpawns[Math.floor(Math.random() * spawns.gentleDjinniSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				addCardsInHand(
					boardWithDeadEntityHero,
					Math.min(2, 7 - boardWithDeadEntity.length),
					boardWithDeadEntity,
					allCards,
					spectator,
				);
				break;

			case CardIds.KilrekBattlegrounds_TB_BaconShop_HERO_37_Buddy:
				// Not totally exact, since the DR could be prevented by other DR triggering at the same time,
				// but close enough for now
				addCardsInHand(
					boardWithDeadEntityHero,
					Math.min(1, 7 - boardWithDeadEntity.length),
					boardWithDeadEntity,
					allCards,
					spectator,
				);
				break;
			case CardIds.KilrekBattlegrounds_TB_BaconShop_HERO_37_Buddy_G:
				addCardsInHand(
					boardWithDeadEntityHero,
					Math.min(2, 7 - boardWithDeadEntity.length),
					boardWithDeadEntity,
					allCards,
					spectator,
				);
				break;

			case CardIds.BrannsEpicEggBattlegrounds_TB_BaconShop_HERO_43_Buddy:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.brannEpicEggSpawns[Math.floor(Math.random() * spawns.brannEpicEggSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				// Not totally exact, since the DR could be prevented by other DR triggering at the same time,
				// but close enough for now
				addCardsInHand(
					boardWithDeadEntityHero,
					Math.min(1, 7 - boardWithDeadEntity.length),
					boardWithDeadEntity,
					allCards,
					spectator,
				);
				break;
			case CardIds.BrannsEpicEggBattlegrounds_TB_BaconShop_HERO_43_Buddy_G:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.brannEpicEggSpawns[Math.floor(Math.random() * spawns.brannEpicEggSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.brannEpicEggSpawns[Math.floor(Math.random() * spawns.brannEpicEggSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				addCardsInHand(
					boardWithDeadEntityHero,
					Math.min(2, 7 - boardWithDeadEntity.length),
					boardWithDeadEntity,
					allCards,
					spectator,
				);
				break;

			case CardIds.GhastcoilerBattlegrounds:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				break;
			case CardIds.Voidlord_BG_LOOT_368:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.VoidwalkerLegacy_BG_CS2_065,
						3,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.VoidlordBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.Voidlord_VoidwalkerLegacyTokenBattlegrounds,
						3,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.OmegaBuster:
			case CardIds.OmegaBusterBattlegrounds:
				// Here we have to truncate the spawned entities instead of letting the caller handle it,
				// because we need to know how many minions couldn't spawn so that we can apply the buff.
				// HOWEVER, this can cause an issue, if for instance a Scallywag token spawns, attacks right away,
				// and then Omega Buster spawns. In this case, it will not have yet processed the token's attack,
				// and will limit the spawns
				const cardParam = 5;
				const entitiesToSpawn = Math.max(0, Math.min(cardParam, 7 - boardWithDeadEntity.length - spawnedEntities.length));
				const buffAmount = (deadEntity.cardId === CardIds.OmegaBusterBattlegrounds ? 2 : 1) * (cardParam - entitiesToSpawn);
				spawnedEntities.push(
					...spawnEntities(
						deadEntity.cardId === CardIds.OmegaBusterBattlegrounds
							? CardIds.ReplicatingMenace_MicrobotTokenBattlegrounds
							: CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t,
						entitiesToSpawn,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						true,
					),
				);
				addStatsToBoard(deadEntity, boardWithDeadEntity, buffAmount, buffAmount, allCards, spectator, Race[Race.MECH]);
				// when the buster triggers multiple times because of Baron for instance
				addStatsToBoard(deadEntity, spawnedEntities, buffAmount, buffAmount, allCards, spectator, Race[Race.MECH]);
				break;
			// case CardIds.OmegaBusterBattlegrounds:
			// 	const entitiesToSpawn2 = Math.min(6, 7 - boardWithDeadEntity.length);
			// 	const buffAmount2 = 6 - entitiesToSpawn2;
			// 	spawnedEntities.push(
			// 		...spawnEntities(
			// 			CardIds.ReplicatingMenace_MicrobotTokenBattlegrounds,
			// 			entitiesToSpawn2,
			// 			boardWithDeadEntity,
			// 			boardWithDeadEntityHero,
			// 			otherBoard,
			// 			otherBoardHero,
			// 			allCards,
			// 			spawns,
			// 			sharedState,
			// 			spectator,
			// 			deadEntity.friendly,
			// 			false,
			// 		),
			// 	);
			// 	addStatsToBoard(deadEntity, boardWithDeadEntity, 2 * buffAmount2, 2 * buffAmount2, allCards, spectator, Race[Race.MECH]);
			// 	// when the buster triggers multiple times because of Baron for instance
			// 	addStatsToBoard(deadEntity, spawnedEntities, 2 * buffAmount2, 2 * buffAmount2, allCards, spectator, Race[Race.MECH]);
			// 	break;
			case CardIds.KangorsApprentice:
				const cardIdsToSpawn = sharedState.deaths
					.filter((entity) => entity.friendly === deadEntity.friendly)
					// eslint-disable-next-line prettier/prettier
					.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.race, Race.MECH))
					.slice(0, 2)
					.map((entity) => entity.cardId);
				cardIdsToSpawn.forEach((cardId) =>
					spawnedEntities.push(
						...spawnEntities(
							cardId,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					),
				);
				break;
			case CardIds.KangorsApprenticeBattlegrounds:
				const cardIdsToSpawn2 = sharedState.deaths
					.filter((entity) => entity.friendly === deadEntity.friendly)
					.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.race, Race.MECH))
					.slice(0, 4)
					.map((entity) => entity.cardId);
				cardIdsToSpawn2.forEach((cardId) =>
					spawnedEntities.push(
						...spawnEntities(
							cardId,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					),
				);
				break;
			case CardIds.TheTideRazor:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				break;
			case CardIds.TheTideRazorBattlegrounds:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
						...spawnEntities(
							spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					],
				);
				break;
			default:
			// spawnedEntities.push(...[]);
		}
	}
	return spawnedEntities;
};

export const spawnEntitiesFromEnchantments = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): readonly BoardEntity[] => {
	const rivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.BaronRivendare_BG_FP1_031);
	const goldenRivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.BaronRivendareBattlegrounds);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	const spawnedEntities: BoardEntity[] = [];
	for (const enchantment of deadEntity.enchantments || []) {
		for (let i = 0; i < multiplier; i++) {
			switch (enchantment.cardId) {
				// Replicating Menace
				case CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_BG_BOT_312e:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t,
							3,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.ReplicatingMenace_ReplicatingMenaceEnchantmentBattlegrounds:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.ReplicatingMenace_MicrobotTokenBattlegrounds,
							3,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.LivingSpores_LivingSporesEnchantment:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.LivingSpores_PlantToken,
							2,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.EarthInvocation_ElementEarthEnchantment:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.ElementEarth_StoneElementalToken,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.SneedsReplicator_ReplicateEnchantment:
					spawnedEntities.push(
						...spawnEntities(
							spawns.getRandomMinionForTavernTier(Math.max(1, spawns.getTavernLevel(deadEntity.cardId) - 1)),
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
			}
		}
	}
	return spawnedEntities;
};
