import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandomAlive } from '../services/utils';
import { hasCorrectTribe } from '../utils';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { afterStatsUpdate, modifyAttack, modifyHealth } from './stats';

export const applyAfterDeathEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): BoardEntity[] => {
	const maxSpawns = 7 - boardWithDeadEntity.length;
	const allSpawns = [];

	let secretTriggered = null;
	if (
		(secretTriggered = boardWithDeadEntityHero.secrets?.find(
			(secret) => !secret.triggered && secret?.cardId === CardIds.Avenge_TB_Bacon_Secrets_08,
		)) != null
	) {
		secretTriggered.triggered = true;
		const target = pickRandomAlive(boardWithDeadEntity);
		modifyAttack(target, 3, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		modifyHealth(target, 2, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		afterStatsUpdate(target, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	} else if (
		(secretTriggered = boardWithDeadEntityHero.secrets?.find(
			(secret) => !secret.triggered && secret?.cardId === CardIds.Redemption_TB_Bacon_Secrets_10,
		)) != null
	) {
		secretTriggered.triggered = true;
		// It doesn't coming back with its enchantments, does it?
		// const newSpawn: BoardEntity = {
		// 	...deadEntity,
		// 	definitelyDead: false,
		// 	health: 1,
		// 	avengeCurrent: 0,
		// };
		// const copy = { ...deadEntity };
		// removeAurasFromSelf(
		// 	newSpawn,
		// 	boardWithDeadEntity,
		// 	boardWithDeadEntityHero,
		// 	gameState.allCards,
		// 	gameState.sharedState,
		// 	gameState.spectator,
		// );
		const spawns = spawnEntities(
			deadEntity.cardId,
			1,
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			otherBoard,
			otherBoardHero,
			gameState.allCards,
			gameState.cardsData,
			gameState.sharedState,
			gameState.spectator,
			deadEntity.friendly,
			false,
			false,
			true,
			// { ...newSpawn } as BoardEntity,
		);
		spawns[0].health = 1;
		// if (spawns[0].cardId === CardIds.ToxicTumbleweed_TumblingAssassinToken_BG28_641t) {
		// 	console.debug('spawning tumbleweed after redemption', spawns[0].venomous);
		// }
		allSpawns.push(...spawns);
	} else if (
		(secretTriggered = boardWithDeadEntityHero.secrets?.find(
			(secret) => !secret.triggered && secret?.cardId === CardIds.Effigy_TB_Bacon_Secrets_05,
		)) != null
	) {
		secretTriggered.triggered = true;
		const minionTier = gameState.cardsData.getTavernLevel(deadEntity.cardId);
		const newMinion = gameState.cardsData.getRandomMinionForTavernTier(minionTier);
		const spawns = spawnEntities(
			newMinion,
			1,
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			otherBoard,
			otherBoardHero,
			gameState.allCards,
			gameState.cardsData,
			gameState.sharedState,
			gameState.spectator,
			deadEntity.friendly,
			false,
			false,
			true,
		);
		allSpawns.push(...spawns);
	}

	if (hasCorrectTribe(deadEntity, Race.BEAST, gameState.allCards)) {
		const feathermanes =
			boardWithDeadEntityHero.hand
				?.filter((e) => !e.locked)
				.filter(
					(e) =>
						e.cardId === CardIds.FreeFlyingFeathermane_BG27_014 ||
						e.cardId === CardIds.FreeFlyingFeathermane_BG27_014_G,
				) ?? [];
		// removeCardFromHand(boardWithDeadEntityHero, spawn);
		for (const feathermaneSpawn of feathermanes) {
			if (allSpawns.length >= maxSpawns) {
				break;
			}
			feathermaneSpawn.locked = true;
			const spawns = spawnEntities(
				feathermaneSpawn.cardId,
				1,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				otherBoard,
				otherBoardHero,
				gameState.allCards,
				gameState.cardsData,
				gameState.sharedState,
				gameState.spectator,
				deadEntity.friendly,
				false,
				false,
				true,
				{ ...feathermaneSpawn } as BoardEntity,
			);

			// So that it can be flagged as "unspawned" if it is not spawned in the end
			for (const spawn of spawns) {
				spawn.onCanceledSummon = () => (feathermaneSpawn.locked = false);
				// spawn.backRef = feathermaneSpawn;
			}
			// console.log(
			// 	'\tspawning feathermane',
			// 	stringifySimpleCard(feathermaneSpawn, allCards),
			// 	stringifySimple(spawns, allCards),
			// );
			allSpawns.push(...spawns);
		}
	}

	performEntitySpawns(
		allSpawns,
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		deadEntityIndexFromRight,
		otherBoard,
		otherBoardHero,
		gameState,
	);

	return allSpawns;
};

export const applyOnDeathEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	// Nothing yet
	return [];
};
