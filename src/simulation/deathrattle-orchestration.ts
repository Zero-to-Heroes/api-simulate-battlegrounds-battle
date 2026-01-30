import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardIds } from '../services/card-ids';
import { hasCorrectTribe } from '../utils';
import { applyAvengeEffects } from './avenge';
import { applyAfterDeathEffects } from './death-effects';
import {
	applyAfterMinionDiesEffect,
	applyWheneverMinionDiesEffect,
	handleAfterMinionKillsEffect,
} from './deathrattle-effects';
import { spawnEntities, spawnEntitiesFromDeathrattle } from './deathrattle-spawns';
import { FullGameState, PlayerState } from './internal-game-state';
import { handleRebornForEntity } from './reborn';
import { performEntitySpawns } from './spawns';

// FIXME:
// From Mitchell on Discord:
// - Minions die left to right
// - When a minion dies, it procs natural deathrattle, added deathrattles, and then all avenges progress
// by 1 (and trigger as necessary)
// - Then next minion
// - After ALL deathrattles and avenges are done, Reborn triggers
// - (Ideally after all of that I would want Feathermane to trigger, but that is not what it does right now.
// Right now it triggers at deathrattle speed rather than after Reborn speed)
export const orchestrateMinionDeathEffects = (
	deathrattleInput: DeathrattleInput,
	processAvenge = true,
	processReborn = true,
) => {
	handleAfterMinionsKillEffects(deathrattleInput);

	// Not sure about this
	handleWheneverMinionsDieEffects(deathrattleInput);

	const playerBoardBefore = [...deathrattleInput.gameState.gameState.player.board];
	const opponentBoardBefore = [...deathrattleInput.gameState.gameState.opponent.board];

	const entitiesFromDeathrattles = processDeathrattles(deathrattleInput, processAvenge);

	// When a Silent Enforcer dies, it deals damage to other minions, then Soul Juggler damages the minions
	// **before** they completely die and spawn their own deathrattles
	handleAfterMinionsDieEffects(deathrattleInput);

	// Hack to try and fix how reborn indices are handled when there are spawns during the deathrattle phase
	// Ideally, this should probably be rewritten completely to keep the dead entities in the board itself
	// so we can use that as a source for the spawn index. However this is a big rewrite with lots of
	// potential side-effects
	const playerBoardAfter = [...deathrattleInput.gameState.gameState.player.board];
	const opponentBoardAfter = [...deathrattleInput.gameState.gameState.opponent.board];
	const opponentIndexOfSpawnedEntities = opponentBoardAfter
		.filter((entity) => !opponentBoardBefore.includes(entity))
		.map((entity) => opponentBoardAfter.length - opponentBoardAfter.indexOf(entity) - 1);
	const playerIndexOfSpawnedEntities = playerBoardAfter
		.filter((entity) => !playerBoardBefore.includes(entity))
		.map((entity) => playerBoardAfter.length - playerBoardAfter.indexOf(entity) - 1);
	deathrattleInput.opponentDeadEntityIndexesFromRight = deathrattleInput.opponentDeadEntityIndexesFromRight.map(
		(previousIndex) => {
			opponentIndexOfSpawnedEntities.forEach((index) => {
				if (index < previousIndex) {
					previousIndex++;
				}
			});
			return previousIndex;
		},
	);
	deathrattleInput.playerDeadEntityIndexesFromRight = deathrattleInput.playerDeadEntityIndexesFromRight.map(
		(previousIndex) => {
			playerIndexOfSpawnedEntities.forEach((index) => {
				if (index < previousIndex) {
					previousIndex++;
				}
			});
			return previousIndex;
		},
	);

	if (processReborn) {
		processReborns(deathrattleInput);
	}

	const entitiesFromFeathermanes = processFeathermaneEffects(deathrattleInput);
	handlePostDeathrattleEffects(deathrattleInput, [...entitiesFromDeathrattles, ...entitiesFromFeathermanes]);
};

const handleAfterMinionsKillEffects = (deathrattleInput: DeathrattleInput) => {
	const processPlayerFirst = Math.random() > 0.5;
	const playerStates = processPlayerFirst
		? [deathrattleInput.gameState.gameState.player, deathrattleInput.gameState.gameState.opponent]
		: [deathrattleInput.gameState.gameState.opponent, deathrattleInput.gameState.gameState.player];
	const playerDeadEntities = processPlayerFirst
		? [deathrattleInput.playerDeadEntities, deathrattleInput.opponentDeadEntities]
		: [deathrattleInput.opponentDeadEntities, deathrattleInput.playerDeadEntities];
	const playerDeadEntityIndexesFromRight = processPlayerFirst
		? [deathrattleInput.playerDeadEntityIndexesFromRight, deathrattleInput.opponentDeadEntityIndexesFromRight]
		: [deathrattleInput.opponentDeadEntityIndexesFromRight, deathrattleInput.playerDeadEntityIndexesFromRight];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				handleAfterMinionKillsEffect(
					deadEntity,
					playerDeadEntityIndexesFromRight[i][j],
					playerStates[i].board,
					playerStates[i].player,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
			}
		}
	}
};

const handleWheneverMinionsDieEffects = (deathrattleInput: DeathrattleInput) => {
	// Wildfire Element is applied first, before the DR spawns
	const processPlayerFirst = Math.random() > 0.5;
	const playerStates = processPlayerFirst
		? [deathrattleInput.gameState.gameState.player, deathrattleInput.gameState.gameState.opponent]
		: [deathrattleInput.gameState.gameState.opponent, deathrattleInput.gameState.gameState.player];
	const playerDeadEntities = processPlayerFirst
		? [deathrattleInput.playerDeadEntities, deathrattleInput.opponentDeadEntities]
		: [deathrattleInput.opponentDeadEntities, deathrattleInput.playerDeadEntities];
	const playerDeadEntityIndexesFromRight = processPlayerFirst
		? [deathrattleInput.playerDeadEntityIndexesFromRight, deathrattleInput.opponentDeadEntityIndexesFromRight]
		: [deathrattleInput.opponentDeadEntityIndexesFromRight, deathrattleInput.playerDeadEntityIndexesFromRight];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				applyWheneverMinionDiesEffect(
					deadEntity,
					playerDeadEntityIndexesFromRight[i][j],
					playerStates[i].board,
					playerStates[i].player,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
			}
		}
	}
};

const handleAfterMinionsDieEffects = (deathrattleInput: DeathrattleInput) => {
	const processPlayerFirst = Math.random() > 0.5;
	const playerStates = processPlayerFirst
		? [deathrattleInput.gameState.gameState.player, deathrattleInput.gameState.gameState.opponent]
		: [deathrattleInput.gameState.gameState.opponent, deathrattleInput.gameState.gameState.player];
	const playerDeadEntities = processPlayerFirst
		? [deathrattleInput.playerDeadEntities, deathrattleInput.opponentDeadEntities]
		: [deathrattleInput.opponentDeadEntities, deathrattleInput.playerDeadEntities];
	const playerDeadEntityIndexesFromRight = processPlayerFirst
		? [deathrattleInput.playerDeadEntityIndexesFromRight, deathrattleInput.opponentDeadEntityIndexesFromRight]
		: [deathrattleInput.opponentDeadEntityIndexesFromRight, deathrattleInput.playerDeadEntityIndexesFromRight];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				applyAfterMinionDiesEffect(
					deadEntity,
					playerDeadEntityIndexesFromRight[i][j],
					playerStates[i].board,
					playerStates[i].player,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
			}
		}
	}
};

const processDeathrattles = (deathrattleInput: DeathrattleInput, processAvenge = true): BoardEntity[] => {
	const entitiesFromDeathrattles: BoardEntity[] = [];
	// Deathrattles are handled left to right
	// Then for each minion, natural deathrattles are processed first, then enchantments
	// http://replays.firestoneapp.com/?reviewId=ec5428bf-a599-4f4c-bea9-8acad5075cb8&turn=11&action=1
	// http://replays.firestoneapp.com/?reviewId=f32e734a-d5a2-4fa4-ad10-94019969cdd7&turn=6&action=22
	// http://replays.firestoneapp.com/?reviewId=ea9503c9-2795-49f0-866b-9ea856cec7df&turn=11&action=3
	// http://replays.firestoneapp.com/?reviewId=1ff37e17-704c-4a73-8c78-377c52b6cb42&turn=13&action=1 is a trap: the enchantment is on the first
	// minion, but the DR is on the second one.
	const processPlayerFirst = Math.random() > 0.5;
	const playerStates = processPlayerFirst
		? [deathrattleInput.gameState.gameState.player, deathrattleInput.gameState.gameState.opponent]
		: [deathrattleInput.gameState.gameState.opponent, deathrattleInput.gameState.gameState.player];
	const playerDeadEntities = processPlayerFirst
		? [deathrattleInput.playerDeadEntities, deathrattleInput.opponentDeadEntities]
		: [deathrattleInput.opponentDeadEntities, deathrattleInput.playerDeadEntities];
	const playerDeadEntityIndexesFromRight = processPlayerFirst
		? [deathrattleInput.playerDeadEntityIndexesFromRight, deathrattleInput.opponentDeadEntityIndexesFromRight]
		: [deathrattleInput.opponentDeadEntityIndexesFromRight, deathrattleInput.playerDeadEntityIndexesFromRight];
	// Process one player first, then the other
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		// Issue: we should process all deathrattles first, then all avenge. If multiple minions die at the same time,
		// the current implementation processes the first minion completely (DR + avenge), then the second one
		if (deadEntities.length >= 0) {
			// Entities are processed left to right
			// TODO: in fact, the processing order is summoning order, so maybe we can just use the entityId
			// to determine the order? https://x.com/LoewenMitchell/status/1750792974383173676?s=20
			// "It should be summoned order (which is most cases would be left to right but mid-combat that could change)."
			// This doesn't actually work: http://replays.firestoneapp.com/?reviewId=ec5428bf-a599-4f4c-bea9-8acad5075cb8&turn=11&action=6
			// deadEntities.sort((a, b) => a.entityId - b.entityId);
			// So we would need to find another proxy for the order
			const spawns = processDeathrattleForMinions(
				deadEntities,
				playerDeadEntityIndexesFromRight[i],
				playerStates[i],
				playerStates[1 - i],
				deathrattleInput,
				processAvenge,
			);
			entitiesFromDeathrattles.push(...spawns);
			// for (let j = 0; j < deadEntities.length; j++) {
			// 	const deadEntity = deadEntities[j];
			// 	const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
			// 	const deadEntityPlayerState = playerStates[i];
			// 	const otherPlayerState = playerStates[1 - i];
			// 	const spawns = processDeathrattleForMinion(
			// 		deadEntity,
			// 		indexFromRight,
			// 		deadEntities,
			// 		deadEntityPlayerState,
			// 		otherPlayerState,
			// 		deathrattleInput.gameState,
			// 		processAvenge,
			// 	);
			// 	entitiesFromDeathrattles.push(...spawns);
			// }
		}
	}
	return entitiesFromDeathrattles;
};

const processFeathermaneEffects = (deathrattleInput: DeathrattleInput, processAvenge = true): BoardEntity[] => {
	const entitiesFromDeathrattles: BoardEntity[] = [];
	const processPlayerFirst = Math.random() > 0.5;
	const playerStates = processPlayerFirst
		? [deathrattleInput.gameState.gameState.player, deathrattleInput.gameState.gameState.opponent]
		: [deathrattleInput.gameState.gameState.opponent, deathrattleInput.gameState.gameState.player];
	const playerDeadEntities = processPlayerFirst
		? [deathrattleInput.playerDeadEntities, deathrattleInput.opponentDeadEntities]
		: [deathrattleInput.opponentDeadEntities, deathrattleInput.playerDeadEntities];
	const playerDeadEntityIndexesFromRight = processPlayerFirst
		? [deathrattleInput.playerDeadEntityIndexesFromRight, deathrattleInput.opponentDeadEntityIndexesFromRight]
		: [deathrattleInput.opponentDeadEntityIndexesFromRight, deathrattleInput.playerDeadEntityIndexesFromRight];
	// Process one player first, then the other
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			// Entities are processed left to right
			// TODO: in fact, the processing order is summoning order, so maybe we can just use the entityId
			// to determine the order? https://x.com/LoewenMitchell/status/1750792974383173676?s=20
			// "It should be summoned order (which is most cases would be left to right but mid-combat that could change)."
			// This doesn't actually work: http://replays.firestoneapp.com/?reviewId=ec5428bf-a599-4f4c-bea9-8acad5075cb8&turn=11&action=6
			// deadEntities.sort((a, b) => a.entityId - b.entityId);
			// So we would need to find another proxy for the order
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				const deadEntityPlayerState = playerStates[i];
				const otherPlayerState = playerStates[1 - i];
				const spawns = processFeathermaneForMinion(
					deadEntity,
					indexFromRight,
					deadEntities,
					deadEntityPlayerState,
					otherPlayerState,
					deathrattleInput.gameState,
					processAvenge,
				);
				entitiesFromDeathrattles.push(...spawns);
			}
		}
	}
	return entitiesFromDeathrattles;
};

const processFeathermaneForMinion = (
	deadEntity: BoardEntity,
	indexFromRight: number,
	deadEntities: BoardEntity[],
	deadEntityPlayerState: PlayerState,
	otherPlayerState: PlayerState,
	gameState: FullGameState,
	processAvenge = true,
) => {
	const maxSpawns = 7 - deadEntityPlayerState.board.length;
	const allSpawns = [];

	// Feathermane
	if (
		hasCorrectTribe(deadEntity, deadEntityPlayerState.player, Race.BEAST, gameState.anomalies, gameState.allCards)
	) {
		const feathermanes =
			deadEntityPlayerState.player.hand
				?.filter((e) => !e.locked)
				.filter(
					(e) =>
						e.cardId === CardIds.FreeFlyingFeathermane_BG27_014 ||
						e.cardId === CardIds.FreeFlyingFeathermane_BG27_014_G,
				) ?? [];
		for (const feathermaneSpawn of feathermanes) {
			if (allSpawns.length >= maxSpawns) {
				break;
			}
			feathermaneSpawn.locked = true;
			const spawns = spawnEntities(
				feathermaneSpawn.cardId,
				1,
				deadEntityPlayerState.board,
				deadEntityPlayerState.player,
				otherPlayerState.board,
				otherPlayerState.player,
				gameState,
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
			allSpawns.push(...spawns);
		}
	}

	performEntitySpawns(
		allSpawns,
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		deadEntity,
		indexFromRight,
		otherPlayerState.board,
		otherPlayerState.player,
		gameState,
	);
	return allSpawns;
};

const processDeathrattleForMinions = (
	deadEntities: BoardEntity[],
	playerDeadEntityIndexesFromRight: number[],
	deadEntityPlayerState: PlayerState,
	otherPlayerState: PlayerState,
	input: DeathrattleInput,
	processAvenge = true,
) => {
	const entitiesFromDeathrattles: BoardEntity[] = [];

	// Natural deathrattles & enchantments
	for (let j = 0; j < deadEntities.length; j++) {
		const deadEntity = deadEntities[j];
		const indexFromRight = playerDeadEntityIndexesFromRight[j];
		const drEntities = handleNaturalDeathrattle(
			deadEntity,
			indexFromRight,
			deadEntities,
			deadEntityPlayerState,
			otherPlayerState,
			input.gameState,
		);

		entitiesFromDeathrattles.push(...drEntities);
	}

	// Avenge
	let avengeEntities = [];
	if (processAvenge) {
		for (let j = 0; j < deadEntities.length; j++) {
			const deadEntity = deadEntities[j];
			const indexFromRight = playerDeadEntityIndexesFromRight[j];
			avengeEntities = applyAvengeEffects(
				deadEntity,
				indexFromRight,
				deadEntityPlayerState.board,
				deadEntityPlayerState.player,
				otherPlayerState.board,
				otherPlayerState.player,
				input.gameState,
				entitiesFromDeathrattles,
			);
		}
	}

	const allAfterDeathEntities = [];
	for (let j = 0; j < deadEntities.length; j++) {
		const deadEntity = deadEntities[j];
		const indexFromRight = playerDeadEntityIndexesFromRight[j];
		const afterDeathEntities = applyAfterDeathEffects(
			deadEntity,
			indexFromRight,
			deadEntityPlayerState.board,
			deadEntityPlayerState.player,
			otherPlayerState.board,
			otherPlayerState.player,
			input.gameState,
		);
		allAfterDeathEntities.push(...afterDeathEntities);
	}

	return [...entitiesFromDeathrattles, ...avengeEntities, ...allAfterDeathEntities];
};

export const processDeathrattleForMinion = (
	deadEntity: BoardEntity,
	indexFromRight: number,
	deadEntities: BoardEntity[],
	deadEntityPlayerState: PlayerState,
	otherPlayerState: PlayerState,
	gameState: FullGameState,
	processAvenge = true,
) => {
	const drEntities = handleNaturalDeathrattle(
		deadEntity,
		indexFromRight,
		deadEntities,
		deadEntityPlayerState,
		otherPlayerState,
		gameState,
	);
	// Avenge trigger before reborn
	// http://replays.firestoneapp.com/?reviewId=5bb20eb8-e0ca-47ab-adc7-13134716d568&turn=7&action=6
	let avengeEntities = [];
	let afterDeathEntities = [];
	if (processAvenge) {
		avengeEntities = applyAvengeEffects(
			deadEntity,
			indexFromRight,
			deadEntityPlayerState.board,
			deadEntityPlayerState.player,
			otherPlayerState.board,
			otherPlayerState.player,
			gameState,
			[...drEntities],
		);

		// TODO: Feathermane should be applied after the Reborn effects have all been processed
		// Secrets should be processed here ("at Avenge speed")
		afterDeathEntities = applyAfterDeathEffects(
			deadEntity,
			indexFromRight,
			deadEntityPlayerState.board,
			deadEntityPlayerState.player,
			otherPlayerState.board,
			otherPlayerState.player,
			gameState,
		);
	}
	return [...drEntities, ...avengeEntities, ...afterDeathEntities];
};

const handleNaturalDeathrattle = (
	deadEntity: BoardEntity,
	indexFromRight: number,
	deadEntities: BoardEntity[],
	deadEntityPlayerState: PlayerState,
	otherPlayerState: PlayerState,
	gameState: FullGameState,
): readonly BoardEntity[] => {
	const modifiedIndexFromRight = Math.min(deadEntityPlayerState.board.length, indexFromRight);
	// const allSpawns = [];
	// const spawnsToSpawn = [];
	for (const dr of deadEntity.rememberedDeathrattles ?? []) {
		const entityToProcess: BoardEntity = {
			...deadEntity,
			originalCardId: deadEntity.cardId,
			rememberedDeathrattles: undefined,
			deathrattleRepeats: dr.repeats ?? 1,
			scriptDataNum1: dr.tagScriptDataNum1,
			scriptDataNum2: dr.tagScriptDataNum2,
			cardId: dr.cardId,
			pendingAttackBuffs: [],
			// For Corrupted Bristler
			enchantments: deadEntity.enchantments.filter((e) => e.cardId?.startsWith(CardIds.BloodGem)),
			memory:
				dr.memory == null
					? null
					: Array.isArray(dr.memory)
					? dr.memory.map((mem) => ({ ...mem }))
					: { ...dr.memory },
		};
		const spawns = handleNaturalDeathrattle(
			entityToProcess,
			indexFromRight,
			deadEntities,
			deadEntityPlayerState,
			otherPlayerState,
			gameState,
		);
		// The spawns have already been processed in the "handleNaturalDeathrattle" method
		// spawnsToSpawn.push(...spawns);
		// allSpawns.push(...spawns);
	}

	const entitiesFromNativeDeathrattle: readonly BoardEntity[] = spawnEntitiesFromDeathrattle(
		deadEntity,
		modifiedIndexFromRight,
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		otherPlayerState.board,
		otherPlayerState.player,
		deadEntities,
		gameState,
	);

	return entitiesFromNativeDeathrattle;
};

const processReborns = (deathrattleInput: DeathrattleInput) => {
	// const entitiesFromReborn: BoardEntity[] = [];
	const processPlayerFirst = Math.random() > 0.5;
	const playerStates = processPlayerFirst
		? [deathrattleInput.gameState.gameState.player, deathrattleInput.gameState.gameState.opponent]
		: [deathrattleInput.gameState.gameState.opponent, deathrattleInput.gameState.gameState.player];
	const playerDeadEntities = processPlayerFirst
		? [deathrattleInput.playerDeadEntities, deathrattleInput.opponentDeadEntities]
		: [deathrattleInput.opponentDeadEntities, deathrattleInput.playerDeadEntities];
	const playerDeadEntityIndexesFromRight = processPlayerFirst
		? [deathrattleInput.playerDeadEntityIndexesFromRight, deathrattleInput.opponentDeadEntityIndexesFromRight]
		: [deathrattleInput.opponentDeadEntityIndexesFromRight, deathrattleInput.playerDeadEntityIndexesFromRight];
	// Process one player first, then the other
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				const deadEntityPlayerState = playerStates[i];
				const otherPlayerState = playerStates[1 - i];
				handleRebornForEntity(
					deadEntityPlayerState.board,
					deadEntityPlayerState.player,
					deadEntity,
					indexFromRight,
					otherPlayerState.board,
					otherPlayerState.player,
					deathrattleInput.gameState,
				);
			}
		}
	}
};

const handlePostDeathrattleEffects = (deathrattleInput: DeathrattleInput, entitiesFromDeathrattles: BoardEntity[]) => {
	const processPlayerFirst = Math.random() > 0.5;
	const playerStates = processPlayerFirst
		? [deathrattleInput.gameState.gameState.player, deathrattleInput.gameState.gameState.opponent]
		: [deathrattleInput.gameState.gameState.opponent, deathrattleInput.gameState.gameState.player];
	const playerDeadEntities = processPlayerFirst
		? [deathrattleInput.playerDeadEntities, deathrattleInput.opponentDeadEntities]
		: [deathrattleInput.opponentDeadEntities, deathrattleInput.playerDeadEntities];
	const playerDeadEntityIndexesFromRight = processPlayerFirst
		? [deathrattleInput.playerDeadEntityIndexesFromRight, deathrattleInput.opponentDeadEntityIndexesFromRight]
		: [deathrattleInput.opponentDeadEntityIndexesFromRight, deathrattleInput.playerDeadEntityIndexesFromRight];
	// Process one player first, then the other
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		const deadEntityPlayerState = playerStates[i];
		const otherPlayerState = playerStates[1 - i];
		if (deadEntities.length >= 0) {
			// Process from right to left, so that we can set the hasAttacked attribute properly
			// If two minions die at the same time, both of which having attacked, but the third in line having not,
			// processing them from left to right means the first (leftmost) one will check its right neighbor, which
			// is the minion that hasn't attacked
			for (let j = deadEntities.length - 1; j >= 0; j--) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				handlePostDeathrattleEffect(
					deadEntity,
					indexFromRight,
					deadEntities,
					deadEntityPlayerState,
					otherPlayerState,
					deathrattleInput.gameState,
					entitiesFromDeathrattles,
					deadEntityPlayerState.player.friendly,
					deathrattleInput,
				);
			}
		}
	}
};

export const handleDeathrattles = (deathrattleInput: DeathrattleInput) => {
	orchestrateMinionDeathEffects(deathrattleInput, false, false);
};

const handlePostDeathrattleEffect = (
	deadEntity: BoardEntity,
	indexFromRight: number,
	deadEntities: BoardEntity[],
	deadEntityPlayerState: PlayerState,
	otherPlayerState: PlayerState,
	gameState: FullGameState,
	spawnedEntities: BoardEntity[],
	isPlayer: boolean,
	deathrattleInput: DeathrattleInput,
) => {
	// This doesn't work if the entity that was to the right died.
	const entityRightToSpawns =
		indexFromRight === 0 ? null : deadEntityPlayerState.board[deadEntityPlayerState.board.length - indexFromRight];
	// To handle minions attack tokens
	// See http://replays.firestoneapp.com/?reviewId=0583d6a4-6ed0-4b20-894e-4ceb560894fe&turn=6&action=11
	// When a minion dies, the spawn are either elligible to attack next turn or not
	// If the minion right to the spawned minion has already attacked, then the spawned
	// minion cannot attack
	spawnedEntities.forEach((entity) => {
		entity.hasAttacked = deadEntity.hasAttacked > 1 ? 1 : entityRightToSpawns?.hasAttacked ?? undefined;
	});

	if (deadEntityPlayerState.player.questRewards?.includes(CardIds.RitualDagger_BG24_Reward_113)) {
		const ogDeadEntity = gameState.sharedState.deaths.find((entity) => entity.entityId === deadEntity.entityId);
		if (ogDeadEntity) {
			ogDeadEntity.attack += 4;
			ogDeadEntity.health += 4;
		}
	}

	// ISSUE: when we do this, we change the minion's stats before processing deathrattle effects, which can mess
	// up the simulation in some cases (like Nightbane, Ignited)
	// FIX: we do it in postDeathrattleEfects, not when removing minions from the board
	if (deadEntityPlayerState.player.globalInfo.HauntedCarapaceAttackBonus > 0) {
		deadEntity.attack = Math.max(
			0,
			deadEntity.attack - deadEntityPlayerState.player.globalInfo.HauntedCarapaceAttackBonus,
		);
	}
	if (deadEntityPlayerState.player.globalInfo.HauntedCarapaceHealthBonus > 0) {
		deadEntity.health = Math.max(
			1,
			deadEntity.health - deadEntityPlayerState.player.globalInfo.HauntedCarapaceHealthBonus,
		);
	}
	if (
		hasCorrectTribe(deadEntity, deadEntityPlayerState.player, Race.UNDEAD, gameState.anomalies, gameState.allCards)
	) {
		if (deadEntityPlayerState.player.globalInfo.UndeadAttackBonus > 0) {
			deadEntity.attack = Math.max(
				0,
				deadEntity.attack - deadEntityPlayerState.player.globalInfo.UndeadAttackBonus,
			);
		}
	}
	if (
		hasCorrectTribe(deadEntity, deadEntityPlayerState.player, Race.BEAST, gameState.anomalies, gameState.allCards)
	) {
		if (deadEntityPlayerState.player.globalInfo.GoldrinnBuffAtk > 0) {
			deadEntity.attack = Math.max(
				0,
				deadEntity.attack - deadEntityPlayerState.player.globalInfo.GoldrinnBuffAtk,
			);
		}
	}
};

interface DeathrattleInput {
	gameState: FullGameState;
	playerDeadEntities: BoardEntity[];
	playerDeadEntityIndexesFromRight: number[];
	opponentDeadEntities: BoardEntity[];
	opponentDeadEntityIndexesFromRight: number[];
}
