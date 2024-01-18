import { BoardEntity } from '../board-entity';
import { applyAvengeEffects } from './avenge';
import { applyAfterDeathEffects } from './death-effects';
import { applyMinionDeathEffect, handleDeathrattleEffects } from './deathrattle-effects';
import { spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { handleRebornForEntity } from './reborn';
import { performEntitySpawns } from './spawns';

export const orchestrateMinionDeathEffects = (deathrattleInput: DeathrattleInput) => {
	handleDeathrattles(deathrattleInput);
	handleReborn(deathrattleInput);
	handleAvenge(deathrattleInput);
	handleAfterDeathEffects(deathrattleInput);
};

const handleAfterDeathEffects = (deathrattleInput: DeathrattleInput) => {
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
	// const spawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				applyAfterDeathEffects(
					deadEntity,
					modifiedIndexFromRight,
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

const handleAvenge = (deathrattleInput: DeathrattleInput) => {
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
	// const spawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				applyAvengeEffects(
					deadEntity,
					modifiedIndexFromRight,
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

const handleReborn = (deathrattleInput: DeathrattleInput) => {
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
	// const spawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				handleRebornForEntity(
					playerStates[i].board,
					playerStates[i].player,
					deadEntity,
					modifiedIndexFromRight,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
				// spawnedEntities.push(...entitiesFromNativeDeathrattle);
			}
		}
	}
	// return spawnedEntities;
};

export const handleDeathrattles = (deathrattleInput: DeathrattleInput) => {
	handlePreDeathrattleEffects(deathrattleInput);
	const drEntities = handleNaturalDeathrattles(deathrattleInput);
	const enchEntities = handleEnchantmentsDeathrattles(deathrattleInput);
	handlePostDeathrattleEffects(deathrattleInput, [...drEntities, ...enchEntities]);
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

const handleNaturalDeathrattles = (deathrattleInput: DeathrattleInput) => {
	// Natural Deathrattles
	// First main DR, then enchantments:
	// - http://replays.firestoneapp.com/?reviewId=ea9503c9-2795-49f0-866b-9ea856cec7df&turn=11&action=2
	// - http://replays.firestoneapp.com/?reviewId=f32e734a-d5a2-4fa4-ad10-94019969cdd7&turn=6&action=22 (the trickster doesn't buff th
	// spawned crab)
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
	const spawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				const entitiesFromNativeDeathrattle: readonly BoardEntity[] = spawnEntitiesFromDeathrattle(
					deadEntity,
					playerStates[i].board,
					playerStates[i].player,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deadEntities,
					deathrattleInput.gameState,
				);
				performEntitySpawns(
					entitiesFromNativeDeathrattle,
					playerStates[i].board,
					playerStates[i].player,
					deadEntity,
					modifiedIndexFromRight,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
				// In case of leapfrogger, we want to first spawn the minions, then apply the frog effect
				handleDeathrattleEffects(
					playerStates[i].board,
					playerStates[i].player,
					deadEntity,
					modifiedIndexFromRight,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
				spawnedEntities.push(...entitiesFromNativeDeathrattle);
			}
		}
	}
	return spawnedEntities;
};

const handleEnchantmentsDeathrattles = (deathrattleInput: DeathrattleInput) => {
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
	const spawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < 2; i++) {
		const deadEntities = playerDeadEntities[i];
		if (deadEntities.length >= 0) {
			for (let j = 0; j < deadEntities.length; j++) {
				const deadEntity = deadEntities[j];
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				const modifiedIndexFromRight = Math.min(playerStates[i].board.length, indexFromRight);
				const entitiesFromEnchantments: readonly BoardEntity[] = spawnEntitiesFromEnchantments(
					deadEntity,
					playerStates[i].board,
					playerStates[i].player,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
				performEntitySpawns(
					entitiesFromEnchantments,
					playerStates[i].board,
					playerStates[i].player,
					deadEntity,
					modifiedIndexFromRight,
					playerStates[1 - i].board,
					playerStates[1 - i].player,
					deathrattleInput.gameState,
				);
				spawnedEntities.push(...entitiesFromEnchantments);
			}
		}
	}
	return spawnedEntities;
};

const handlePostDeathrattleEffects = (deathrattleInput: DeathrattleInput, spawnedEntities: BoardEntity[]) => {
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
				const indexFromRight = playerDeadEntityIndexesFromRight[i][j];
				// This doesn't work if the entity that was to the right died.
				const entityRightToSpawns =
					indexFromRight === 0 ? null : playerStates[i].board[playerStates[i].board.length - indexFromRight];
				// To handle minions attack tokens
				// See http://replays.firestoneapp.com/?reviewId=0583d6a4-6ed0-4b20-894e-4ceb560894fe&turn=6&action=11
				// When a minion dies, the spawn are either elligible to attack next turn or not
				// If the minion right to the spawned minion has already attacked, then the spawned
				// minion cannot attack
				spawnedEntities.forEach((entity) => {
					entity.hasAttacked = deadEntity.hasAttacked > 1 ? 1 : entityRightToSpawns?.hasAttacked ?? 0;
				});

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
							playerDeadEntities: i === 0 ? [entityToProcess] : [],
							playerDeadEntityIndexesFromRight: i === 0 ? [indexFromRight] : [],
							opponentDeadEntities: i === 1 ? [entityToProcess] : [],
							opponentDeadEntityIndexesFromRight: i === 1 ? [indexFromRight] : [],
						});
					}
				}
			}
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
