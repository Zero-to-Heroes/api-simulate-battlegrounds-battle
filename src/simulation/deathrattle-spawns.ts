import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { afterStatsUpdate, buildSingleBoardEntity, hasCorrectTribe, isCorrectTribe, modifyAttack, modifyHealth } from '../utils';
import { addCardsInHand, addStatsToBoard } from './deathrattle-effects';
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
): readonly BoardEntity[] => {
	if (!cardId) {
		console.error('Cannot spawn a minion without any cardId defined', new Error().stack);
	}
	const spawnMultiplier = 2 * boardToSpawnInto.filter((entity) => entity.cardId === CardIds.Collectible.Mage.Khadgar1).length || 1;
	const spawnMultiplierGolden =
		3 * boardToSpawnInto.filter((entity) => entity.cardId === CardIds.NonCollectible.Mage.KhadgarBattlegrounds).length || 1;
	const minionsToSpawn = limitSpawns
		? Math.min(quantity * spawnMultiplier * spawnMultiplierGolden, 7 - boardToSpawnInto.length)
		: quantity * spawnMultiplier * spawnMultiplierGolden;
	const result: BoardEntity[] = [];
	for (let i = 0; i < minionsToSpawn; i++) {
		const newMinion = buildSingleBoardEntity(
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
			const packLeaders = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.NonCollectible.Neutral.PackLeader);
			packLeaders.forEach((buffer) => {
				modifyAttack(newMinion, 2, boardToSpawnInto, allCards);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});

			const packLeaderBattlegrounds = boardToSpawnInto.filter(
				(entity) => entity.cardId === CardIds.NonCollectible.Neutral.PackLeaderBattlegrounds,
			);
			packLeaderBattlegrounds.forEach((buffer) => {
				modifyAttack(newMinion, 4, boardToSpawnInto, allCards);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});

			const mamaBears = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.NonCollectible.Neutral.MamaBear);
			mamaBears.forEach((buffer) => {
				modifyAttack(newMinion, 5, boardToSpawnInto, allCards);
				modifyHealth(newMinion, 5);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});

			const mamaBearBattlegrounds = boardToSpawnInto.filter(
				(entity) => entity.cardId === CardIds.NonCollectible.Neutral.MamaBearBattlegrounds,
			);
			mamaBearBattlegrounds.forEach((buffer) => {
				modifyAttack(newMinion, 10, boardToSpawnInto, allCards);
				modifyHealth(newMinion, 10);
				afterStatsUpdate(newMinion, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(buffer, newMinion, boardToSpawnInto);
			});
		}

		if (!newMinion.cardId) {
			console.warn('Invalid spawn', newMinion, cardId);
		}
		result.push(newMinion);

		if (isCorrectTribe(allCards.getCard(newMinion.cardId).race, Race.DEMON)) {
			const bigfernals = boardToSpawnInto.filter((entity) => entity.cardId === CardIds.NonCollectible.Neutral.Bigfernal);
			const goldenBigfernals = boardToSpawnInto.filter(
				(entity) => entity.cardId === CardIds.NonCollectible.Neutral.BigfernalBattlegrounds,
			);
			bigfernals.forEach((entity) => {
				modifyAttack(entity, 1, boardToSpawnInto, allCards);
				modifyHealth(entity, 1);
				afterStatsUpdate(entity, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(entity, entity, boardToSpawnInto);
			});
			goldenBigfernals.forEach((entity) => {
				modifyAttack(entity, 2, boardToSpawnInto, allCards);
				modifyHealth(entity, 2);
				afterStatsUpdate(entity, boardToSpawnInto, allCards);
				// spectator.registerPowerTarget(entity, entity, boardToSpawnInto);
			});
		}
		if (hasCorrectTribe(newMinion, Race.DEMON, allCards)) {
			addOldMurkeyeAttack(boardToSpawnInto, allCards);
			addOldMurkeyeAttack(otherBoard, allCards);
		}
	}

	return result;
};

const addOldMurkeyeAttack = (board: BoardEntity[], allCards: AllCardsService) => {
	const murkeyes = board.filter(
		(entity) =>
			entity.cardId === CardIds.Collectible.Neutral.OldMurkEyeLegacy ||
			entity.cardId === CardIds.Collectible.Neutral.OldMurkEyeVanilla,
	);
	const goldenMurkeyes = board.filter((entity) => entity.cardId === CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds);
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
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	const rivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare2);
	const goldenRivendare = boardWithDeadEntity.find(
		(entity) => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareBattlegrounds,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	const spawnedEntities: BoardEntity[] = [];
	const otherBoardSpawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < multiplier; i++) {
		switch (deadEntity.cardId) {
			case CardIds.Collectible.Neutral.Mecharoo:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.Mecharoo_JoEBotToken,
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
			case CardIds.NonCollectible.Neutral.MecharooBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.Mecharoo_JoEBotTokenBattlegrounds,
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
			case CardIds.NonCollectible.Neutral.Scallywag:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Rogue.Scallywag_SkyPirateToken,
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
			case CardIds.NonCollectible.Neutral.ScallywagBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Rogue.Scallywag_SkyPirateTokenBattlegrounds,
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
			case CardIds.NonCollectible.Neutral.IckyImp2:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.ImpGangBoss_ImpToken,
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
			case CardIds.NonCollectible.Neutral.IckyImpBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.ImpGangBoss_ImpTokenBattlegrounds,
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
			case CardIds.Collectible.Neutral.HarvestGolemLegacy:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.DamagedGolemLegacy,
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
			case CardIds.NonCollectible.Neutral.HarvestGolemBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.HarvestGolem_DamagedGolemTokenBattlegrounds,
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
			case CardIds.NonCollectible.Neutral.SewerRat:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.SewerRat_HalfShellToken,
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
			case CardIds.NonCollectible.Neutral.SewerRatBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.SewerRat_HalfShellTokenBattlegrounds,
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
			case CardIds.Collectible.Hunter.KindlyGrandmother1:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.KindlyGrandmother_BigBadWolf,
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
			case CardIds.NonCollectible.Hunter.KindlyGrandmotherBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.KindlyGrandmother_BigBadWolfTokenBattlegrounds,
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
			case CardIds.Collectible.Hunter.RatPack:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.RatPack_RatToken,
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
			case CardIds.NonCollectible.Hunter.RatPackBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.RatPack_RatTokenBattlegrounds,
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
			case CardIds.NonCollectible.Neutral.Imprisoner:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.ImpGangBoss_ImpToken,
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
			case CardIds.NonCollectible.Neutral.ImprisonerBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.ImpGangBoss_ImpTokenBattlegrounds,
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
			case CardIds.Collectible.Hunter.InfestedWolf:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.InfestedWolf_Spider,
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
			case CardIds.NonCollectible.Hunter.InfestedWolfBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.InfestedWolf_SpiderTokenBattlegrounds,
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
			case CardIds.Collectible.Neutral.TheBeastLegacy:
			case CardIds.NonCollectible.Neutral.TheBeastBattlegrounds:
				otherBoardSpawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.FinkleEinhornLegacy,
						1,
						otherBoard,
						otherBoardHero,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						!deadEntity.friendly,
						false,
					),
				);
				break;
			case CardIds.Collectible.Neutral.ReplicatingMenace:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotToken,
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
			case CardIds.NonCollectible.Neutral.ReplicatingMenaceBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotTokenBattlegrounds,
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
			case CardIds.Collectible.Paladin.MechanoEgg:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Paladin.MechanoEgg_RobosaurToken,
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
			case CardIds.NonCollectible.Paladin.MechanoEggBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Paladin.MechanoEgg_RobosaurTokenBattlegrounds,
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
			case CardIds.Collectible.Hunter.SavannahHighmaneLegacy:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.SavannahHighmane_HyenaLegacyToken,
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
			case CardIds.NonCollectible.Hunter.SavannahHighmaneBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.SavannahHighmane_HyenaTokenBattlegrounds,
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
			case CardIds.Collectible.Warlock.RingMatron:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.RingMatron_FieryImpToken,
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
			case CardIds.NonCollectible.Warlock.RingMatronBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.RingMatron_FieryImpTokenBattlegrounds,
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
			case CardIds.Collectible.Neutral.SatedThreshadon:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.PrimalfinTotem_PrimalfinToken,
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
			case CardIds.NonCollectible.Neutral.SatedThreshadonBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.SatedThreshadon_PrimalfinTokenBattlegrounds,
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
			case CardIds.NonCollectible.Priest.Ghastcoiler2:
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
			case CardIds.NonCollectible.Neutral.GentleDjinni:
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
			case CardIds.NonCollectible.Neutral.GentleDjinniBattlegrounds:
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

			case CardIds.NonCollectible.Priest.GhastcoilerBattlegrounds:
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
			// case CardIds.NonCollectible.Neutral.SneedsOldShredder2:
			// case CardIds.NonCollectible.Neutral.SneedsOldShredderBattlegrounds:
			// 	spawnedEntities.push(
			// 		...spawnEntities(
			// 			spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
			// 			1,
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
			// 	break;
			// case CardIds.NonCollectible.Neutral.SneedsOldShredderBattlegrounds:
			// 	spawnedEntities.push(
			// 		...[
			// 			...spawnEntities(
			// 				spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
			// 				1,
			// 				boardWithDeadEntity,
			// 				boardWithDeadEntityHero,
			// 				otherBoard,
			// 				otherBoardHero,
			// 				allCards,
			// 				spawns,
			// 				sharedState,
			// 				spectator,
			// 				deadEntity.friendly,
			// 				false,
			// 			),
			// 			...spawnEntities(
			// 				spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
			// 				1,
			// 				boardWithDeadEntity,
			// 				boardWithDeadEntityHero,
			// 				otherBoard,
			// 				otherBoardHero,
			// 				allCards,
			// 				spawns,
			// 				sharedState,
			// 				spectator,
			// 				deadEntity.friendly,
			// 				false,
			// 			),
			// 		],
			// 	);
			// 	break;
			case CardIds.Collectible.Warlock.Voidlord:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.Collectible.Warlock.VoidwalkerLegacy,
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
			case CardIds.NonCollectible.Warlock.VoidlordBattlegrounds:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.Voidlord_VoidwalkerTokenBattlegrounds,
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
			case CardIds.NonCollectible.Neutral.OmegaBuster:
				const entitiesToSpawn = Math.min(6, 7 - boardWithDeadEntity.length);
				const buffAmount = 6 - entitiesToSpawn;
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotToken,
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
						false,
					),
				);
				addStatsToBoard(deadEntity, boardWithDeadEntity, 1 * buffAmount, 1 * buffAmount, allCards, spectator);
				break;
			case CardIds.NonCollectible.Neutral.OmegaBusterBattlegrounds:
				const entitiesToSpawn2 = Math.min(6, 7 - boardWithDeadEntity.length);
				const buffAmount2 = 6 - entitiesToSpawn2;
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotTokenBattlegrounds,
						entitiesToSpawn2,
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
				addStatsToBoard(deadEntity, boardWithDeadEntity, 2 * buffAmount2, 2 * buffAmount2, allCards, spectator);
				break;
			case CardIds.NonCollectible.Neutral.KangorsApprentice:
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
			case CardIds.NonCollectible.Neutral.KangorsApprenticeBattlegrounds:
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
			case CardIds.NonCollectible.Neutral.TheTideRazor:
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
			case CardIds.NonCollectible.Neutral.TheTideRazorBattlegrounds:
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
	return [spawnedEntities, otherBoardSpawnedEntities];
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
	const rivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare2);
	const goldenRivendare = boardWithDeadEntity.find(
		(entity) => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareBattlegrounds,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	const spawnedEntities: BoardEntity[] = [];
	for (const enchantment of deadEntity.enchantments || []) {
		for (let i = 0; i < multiplier; i++) {
			switch (enchantment.cardId) {
				// Replicating Menace
				case CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantment:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotToken,
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
				case CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantmentBattlegrounds:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotTokenBattlegrounds,
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
				case CardIds.NonCollectible.Neutral.LivingSpores_LivingSporesEnchantment:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.NonCollectible.Neutral.LivingSpores_PlantToken,
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
			}
		}
	}
	return spawnedEntities;
};
