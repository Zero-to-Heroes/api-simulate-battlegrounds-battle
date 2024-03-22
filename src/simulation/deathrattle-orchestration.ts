import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { applyAvengeEffects } from './avenge';
import { applyAfterDeathEffects } from './death-effects';
import { applyMinionDeathEffect, handleDeathrattleEffects } from './deathrattle-effects';
import { spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattle-spawns';
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
	// Not sure about this
	handlePreDeathrattleEffects(deathrattleInput);

	const entitiesFromDeathrattles = processDeathrattles(deathrattleInput, processAvenge);
	if (processReborn) {
		processReborns(deathrattleInput);
	}

	handlePostDeathrattleEffects(deathrattleInput, entitiesFromDeathrattles);
};

const handlePreDeathrattleEffects = (deathrattleInput: DeathrattleInput) => {
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
				applyMinionDeathEffect(
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
				const spawns = processDeathrattleForMinion(
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
	const enchEntities = handleEnchantmentsDeathrattle(
		deadEntity,
		indexFromRight,
		deadEntities,
		deadEntityPlayerState,
		otherPlayerState,
		gameState,
	);
	// Avenge trigger before reborn
	// http://replays.firestoneapp.com/?reviewId=5bb20eb8-e0ca-47ab-adc7-13134716d568&turn=7&action=6
	if (processAvenge) {
		applyAvengeEffects(
			deadEntity,
			indexFromRight,
			deadEntityPlayerState.board,
			deadEntityPlayerState.player,
			otherPlayerState.board,
			otherPlayerState.player,
			gameState,
		);
	}

	// TODO: Feathermane should be applied after the Reborn effects have all been processed
	// Secrets should be processed here ("at Avenge speed")
	const afterDeathEntities = applyAfterDeathEffects(
		deadEntity,
		indexFromRight,
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		otherPlayerState.board,
		otherPlayerState.player,
		gameState,
	);
	return [...drEntities, ...enchEntities, ...afterDeathEntities];
};

const handleNaturalDeathrattle = (
	deadEntity: BoardEntity,
	indexFromRight: number,
	deadEntities: BoardEntity[],
	deadEntityPlayerState: PlayerState,
	otherPlayerState: PlayerState,
	gameState: FullGameState,
) => {
	const modifiedIndexFromRight = Math.min(deadEntityPlayerState.board.length, indexFromRight);
	const entitiesFromNativeDeathrattle: readonly BoardEntity[] = spawnEntitiesFromDeathrattle(
		deadEntity,
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		otherPlayerState.board,
		otherPlayerState.player,
		deadEntities,
		gameState,
	);
	performEntitySpawns(
		entitiesFromNativeDeathrattle,
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		deadEntity,
		modifiedIndexFromRight,
		otherPlayerState.board,
		otherPlayerState.player,
		gameState,
	);
	// In case of leapfrogger, we want to first spawn the minions, then apply the frog effect
	handleDeathrattleEffects(
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		deadEntity,
		modifiedIndexFromRight,
		otherPlayerState.board,
		otherPlayerState.player,
		gameState,
	);
	return entitiesFromNativeDeathrattle;
};

const handleEnchantmentsDeathrattle = (
	deadEntity: BoardEntity,
	indexFromRight: number,
	deadEntities: BoardEntity[],
	deadEntityPlayerState: PlayerState,
	otherPlayerState: PlayerState,
	gameState: FullGameState,
) => {
	const modifiedIndexFromRight = Math.min(deadEntityPlayerState.board.length, indexFromRight);
	const entitiesFromEnchantments: readonly BoardEntity[] = spawnEntitiesFromEnchantments(
		deadEntity,
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		otherPlayerState.board,
		otherPlayerState.player,
		gameState,
	);
	performEntitySpawns(
		entitiesFromEnchantments,
		deadEntityPlayerState.board,
		deadEntityPlayerState.player,
		deadEntity,
		modifiedIndexFromRight,
		otherPlayerState.board,
		otherPlayerState.player,
		gameState,
	);
	return entitiesFromEnchantments;
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
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				const deadEntityPlayerState = playerStates[i];
				const otherPlayerState = playerStates[1 - i];
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
		entity.hasAttacked = deadEntity.hasAttacked > 1 ? 1 : entityRightToSpawns?.hasAttacked ?? 0;
	});

	if (
		deadEntityPlayerState.player.questRewards?.includes(CardIds.RitualDagger_BG24_Reward_113) ||
		deadEntityPlayerState.player.questRewards?.includes(CardIds.RitualDagger_BG24_Reward_113_ALT)
	) {
		const ogDeadEntity = gameState.sharedState.deaths.find((entity) => entity.entityId === deadEntity.entityId);
		if (ogDeadEntity) {
			ogDeadEntity.attack += 4;
			ogDeadEntity.health += 4;
		}
	}

	// eslint-disable-next-line prettier/prettier
	if (deadEntity.rememberedDeathrattles?.length) {
		for (const deathrattle of deadEntity.rememberedDeathrattles) {
			const entityToProcess: BoardEntity = {
				...deadEntity,
				rememberedDeathrattles: undefined,
				cardId: deathrattle.cardId,
				enchantments: [
					{
						cardId: deathrattle.cardId,
						originEntityId: deadEntity.entityId,
						repeats: deathrattle.repeats ?? 1,
						timing: deathrattle.timing,
					},
				],
			};
			handleDeathrattles({
				...deathrattleInput,
				playerDeadEntities: isPlayer ? [entityToProcess] : [],
				playerDeadEntityIndexesFromRight: isPlayer ? [indexFromRight] : [],
				opponentDeadEntities: !isPlayer ? [entityToProcess] : [],
				opponentDeadEntityIndexesFromRight: !isPlayer ? [indexFromRight] : [],
			});
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
