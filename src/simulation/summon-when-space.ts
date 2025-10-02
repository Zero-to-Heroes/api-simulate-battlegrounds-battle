import { Race } from '@firestone-hs/reference-data';
import { BgsHeroPower, BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateTaunt } from '../keywords/taunt';
import { CardIds } from '../services/card-ids';
import { pickRandomHighestAttack, pickRandomHighestHealth } from '../services/utils';
import { buildSingleBoardEntity, copyEntity, hasCorrectTribe } from '../utils';
import { removeAurasFromSelf } from './add-minion-to-board';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';

export const handleSummonsWhenSpace = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): boolean => {
	let shouldRecomputeCurrentAttacker = false;
	if (Math.random() < 0.5) {
		shouldRecomputeCurrentAttacker =
			handleSummonsWhenSpaceForPlayer(
				playerEntity,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
			) || shouldRecomputeCurrentAttacker;
		shouldRecomputeCurrentAttacker =
			handleSummonsWhenSpaceForPlayer(
				opponentEntity,
				opponentBoard,
				opponentEntity,
				playerBoard,
				playerEntity,
				gameState,
			) || shouldRecomputeCurrentAttacker;
	} else {
		shouldRecomputeCurrentAttacker = handleSummonsWhenSpaceForPlayer(
			opponentEntity,
			opponentBoard,
			opponentEntity,
			playerBoard,
			playerEntity,
			gameState,
		);
		shouldRecomputeCurrentAttacker =
			handleSummonsWhenSpaceForPlayer(
				playerEntity,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
			) || shouldRecomputeCurrentAttacker;
	}
	return shouldRecomputeCurrentAttacker;
};

// TODO: Twin Sky Lanterns wait for 2 spaces
const handleSummonsWhenSpaceForPlayer = (
	targetEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): boolean => {
	let shouldRecomputeCurrentAttacker = false;
	if (targetEntity.rapidReanimationMinion) {
		shouldRecomputeCurrentAttacker =
			handleRapidReanimationForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState) ||
			shouldRecomputeCurrentAttacker;
	}
	if (targetEntity.questRewards?.includes(CardIds.StableAmalgamation_BG28_Reward_518)) {
		shouldRecomputeCurrentAttacker =
			handleStableAmalgamationForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState) ||
			shouldRecomputeCurrentAttacker;
	}
	if (targetEntity.secrets?.some((s) => s.cardId === CardIds.BoonOfBeetles_BG28_603)) {
		shouldRecomputeCurrentAttacker =
			handleBoonOfBeetlesForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState) ||
			shouldRecomputeCurrentAttacker;
	}
	for (const heroPower of targetEntity.heroPowers) {
		if (heroPower.cardId === CardIds.Ozumat_Tentacular && heroPower.ready) {
			shouldRecomputeCurrentAttacker =
				handleOzumatForPlayer(
					heroPower,
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					targetEntity.friendly,
					gameState,
				) || shouldRecomputeCurrentAttacker;
		}
		// TODO: use one of these existing tag to make it unlocked
		else if (
			heroPower.cardId === CardIds.Drekthar_LeadTheFrostwolves &&
			gameState.currentTurn >= 7 &&
			!heroPower.activated
		) {
			shouldRecomputeCurrentAttacker =
				handleFrostwolfFervorForPlayer(
					heroPower,
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					targetEntity.friendly,
					gameState,
				) || shouldRecomputeCurrentAttacker;
		} else if (
			heroPower.cardId === CardIds.VanndarStormpike_LeadTheStormpikes &&
			gameState.currentTurn >= 7 &&
			!heroPower.activated
		) {
			shouldRecomputeCurrentAttacker =
				handleStormpikeStrengthForPlayer(
					heroPower,
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					targetEntity.friendly,
					gameState,
				) || shouldRecomputeCurrentAttacker;
		} else if (
			heroPower.cardId === CardIds.LockAndLoadToken_BG22_HERO_000p_Alt &&
			!heroPower.activated &&
			heroPower.ready
		) {
			shouldRecomputeCurrentAttacker =
				!!handleLockAndLoadForPlayer(
					heroPower,
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					targetEntity.friendly,
					gameState,
				) || shouldRecomputeCurrentAttacker;
		}
	}
	targetEntity.trinkets
		.filter(
			(t) =>
				t.cardId === CardIds.TwinSkyLanterns_BG30_MagicItem_822 ||
				t.cardId === CardIds.TwinSkyLanterns_TwinSkyLanternsToken_BG30_MagicItem_822t2,
		)
		.forEach((t) => {
			handleTwinSkyLanternsForPlayer(t, playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		});
	targetEntity.trinkets
		.filter((t) => t.cardId === CardIds.BoomController_BG30_MagicItem_440)
		.forEach((t) => {
			handleBoomControllerForPlayer(t, playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		});
	playerBoard
		.filter(
			(e) => e.cardId === CardIds.SharptoothSnapper_BG32_201 || e.cardId === CardIds.SharptoothSnapper_BG32_201_G,
		)
		.forEach((e) => {
			handleSharptoothSnapperForPlayer(e, playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		});
	return shouldRecomputeCurrentAttacker;
};

export const handleSharptoothSnapperForPlayer = (
	entity: BoardEntity,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	while (playerBoard.length < 7 && entity.abiityChargesLeft > 0) {
		const candidates = spawnEntities(
			CardIds.SharptoothSnapper_PiranhaToken_BG32_201t,
			1,
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			gameState,
			playerEntity.friendly,
			true,
		);
		candidates.forEach((t) => (t.attackImmediately = true));
		const actualSpawns = performEntitySpawns(
			candidates,
			playerBoard,
			playerEntity,
			playerEntity,
			playerBoard.length - 1 - playerBoard.indexOf(entity),
			opponentBoard,
			opponentEntity,
			gameState,
		);
		entity.abiityChargesLeft--;
	}
};

const handleBoomControllerForPlayer = (
	trinket: BoardTrinket,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (playerBoard.length < 7 && trinket.scriptDataNum1 > 0) {
		const candidate = gameState.sharedState.deaths
			.filter((d) => d.friendly === playerEntity.friendly)
			.filter((d) => hasCorrectTribe(d, playerEntity, Race.MECH, gameState.anomalies, gameState.allCards))[0];
		if (!!candidate) {
			const spawn = copyEntity(candidate);
			removeAurasFromSelf(spawn, playerBoard, playerEntity, gameState);
			const initialIndexFromLeft = candidate.indexFromLeftAtTimeOfDeath;
			const indexFromRight =
				initialIndexFromLeft == null
					? 0
					: Math.min(playerBoard.length, Math.max(0, playerBoard.length - initialIndexFromLeft));
			const target = spawnEntities(
				spawn.cardId,
				1,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				playerEntity.friendly,
				true,
				false,
				false,
				spawn,
			);
			// FIXME: here it should try to match the position at which the original minions died
			const actualSpawns = performEntitySpawns(
				target,
				playerBoard,
				playerEntity,
				playerEntity,
				indexFromRight,
				opponentBoard,
				opponentEntity,
				gameState,
			);
			actualSpawns.forEach((t) =>
				gameState.spectator.registerPowerTarget(playerEntity, t, playerBoard, playerEntity, opponentEntity),
			);
			trinket.scriptDataNum1 = 0;
			// It summons an exact copy
			// actualSpawns.forEach((entity) => {
			// 	switch (entity.cardId) {
			// 		case CardIds.AstralAutomaton_BG_TTN_401:
			// 		case CardIds.AstralAutomaton_BG_TTN_401_G:
			// 			const overstatMult = entity.cardId === CardIds.AstralAutomaton_BG_TTN_401 ? 1 : 2;
			// 			entity.attack = Math.max(1, entity.attack - 2 * overstatMult);
			// 			entity.health = Math.max(0, entity.health - overstatMult);
			// 			break;
			// 	}
			// });
		}
	}
};

const handleTwinSkyLanternsForPlayer = (
	trinket: BoardTrinket,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const spawnNumber = trinket.scriptDataNum1 ?? 0;
	const canTrigger = spawnNumber >= 1;
	if (playerBoard.length <= 7 - spawnNumber && trinket.rememberedMinion && canTrigger) {
		trinket.scriptDataNum1 = 0;
		const spawn = copyEntity(trinket.rememberedMinion);
		removeAurasFromSelf(spawn, playerBoard, playerEntity, gameState);
		const target = spawnEntities(
			spawn.cardId,
			spawnNumber,
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			gameState,
			playerEntity.friendly,
			true,
			false,
			false,
			spawn,
		);
		performEntitySpawns(
			target,
			playerBoard,
			playerEntity,
			playerEntity,
			0,
			opponentBoard,
			opponentEntity,
			gameState,
		);
		target.forEach((t) =>
			gameState.spectator.registerPowerTarget(playerEntity, t, playerBoard, playerEntity, opponentEntity),
		);
	}
};

const handleOzumatForPlayer = (
	heroPower: BgsHeroPower,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	friendly: boolean,
	gameState: FullGameState,
) => {
	if (playerBoard.length < 7 && heroPower.activated === false) {
		const tentacularSize = +heroPower.info;
		const tentacular = spawnEntities(
			CardIds.Tentacular_OzumatsTentacleToken_BG23_HERO_201pt,
			1,
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			gameState,
			friendly,
			true,
			false,
			false,
		);
		tentacular[0].attack = tentacularSize;
		tentacular[0].health = tentacularSize;
		tentacular[0].maxHealth = tentacularSize;
		tentacular[0].maxAttack = tentacularSize;
		const indexFromRight = 0;
		performEntitySpawns(
			tentacular,
			playerBoard,
			playerEntity,
			playerEntity,
			indexFromRight,
			opponentBoard,
			opponentEntity,
			gameState,
		);
		gameState.spectator.registerPowerTarget(playerEntity, tentacular[0], playerBoard, playerEntity, opponentEntity);
		heroPower.activated = true;
	}
	return false;
};

const handleFrostwolfFervorForPlayer = (
	heroPower: BgsHeroPower,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	friendly: boolean,
	gameState: FullGameState,
) => {
	if (playerBoard.length < 7) {
		heroPower.activated = true;
		const target = pickRandomHighestAttack(playerBoard);
		if (!!target) {
			const copy = copyEntity(target);
			const indexFromRight = 0;
			const newMinions = spawnEntities(
				copy.cardId,
				1,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				playerEntity.friendly,
				false,
				false,
				false,
				copy,
			);
			const spawns = performEntitySpawns(
				newMinions,
				playerBoard,
				playerEntity,
				playerEntity,
				indexFromRight,
				opponentBoard,
				opponentEntity,
				gameState,
			);
			gameState.spectator.registerPowerTarget(playerEntity, spawns[0], playerBoard, playerEntity, opponentEntity);
		}
	}
	return false;
};

const handleLockAndLoadForPlayer = (
	heroPower: BgsHeroPower,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	friendly: boolean,
	gameState: FullGameState,
) => {
	if (playerBoard.length < 7) {
		const summoned = heroPower.info as BoardEntity;
		heroPower.activated = true;
		if (!!summoned?.cardId) {
			const copy = copyEntity(summoned);
			copy.attackImmediately = true;
			const indexFromRight = 0;
			const newMinions = spawnEntities(
				copy.cardId,
				1,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				playerEntity.friendly,
				false,
				false,
				false,
				copy,
			);
			const spawns = performEntitySpawns(
				newMinions,
				playerBoard,
				playerEntity,
				playerEntity,
				indexFromRight,
				opponentBoard,
				opponentEntity,
				gameState,
			);
			gameState.spectator.registerPowerTarget(playerEntity, spawns[0], playerBoard, playerEntity, opponentEntity);
			// 33.6 https://replays.firestoneapp.com/?reviewId=441da83c-3e40-4630-b98f-caf1932e5be7&turn=11&action=0
			return true;
		}
	}
};

const handleStormpikeStrengthForPlayer = (
	heroPower: BgsHeroPower,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	friendly: boolean,
	gameState: FullGameState,
) => {
	if (playerBoard.length < 7) {
		heroPower.activated = true;
		const target = pickRandomHighestHealth(playerBoard);
		if (!!target) {
			const copy = copyEntity(target);
			const indexFromRight = 0;
			const newMinions = spawnEntities(
				copy.cardId,
				1,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				playerEntity.friendly,
				false,
				false,
				false,
				copy,
			);
			const spawns = performEntitySpawns(
				newMinions,
				playerBoard,
				playerEntity,
				playerEntity,
				indexFromRight,
				opponentBoard,
				opponentEntity,
				gameState,
			);
			gameState.spectator.registerPowerTarget(playerEntity, spawns[0], playerBoard, playerEntity, opponentEntity);
		}
	}
	return false;
};

const handleBoonOfBeetlesForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const secretEntity = playerEntity.secrets.find((entity) => entity.cardId === CardIds.BoonOfBeetles_BG28_603);
	if (secretEntity && secretEntity.triggersLeft > 0) {
		while (secretEntity.triggersLeft > 0) {
			const hasSummoned = handleSummon(
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				CardIds.BoonOfBeetles_BeetleToken_BG28_603t,
				0,
				true,
			);
			if (hasSummoned) {
				hasSummoned.forEach((entity) => {
					updateTaunt(entity, true, playerBoard, playerEntity, opponentEntity, gameState);
				});
				secretEntity.triggersLeft--;
			} else {
				// No room to summon, we stop here
				break;
			}
		}
	}
	return false;
};
const handleStableAmalgamationForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const rewardEntity = playerEntity.questRewardEntities.find(
		(entity) => entity.cardId === CardIds.StableAmalgamation_BG28_Reward_518,
	);
	if (rewardEntity && rewardEntity.scriptDataNum1 > 0) {
		while (rewardEntity.scriptDataNum1 > 0) {
			const hasSummoned = handleSummon(
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				CardIds.StableAmalgamation_TotallyNormalHorseToken_BG28_Reward_518t,
				0,
				true,
			);
			if (hasSummoned) {
				rewardEntity.scriptDataNum1--;
			} else {
				// No room to summon, we stop here
				break;
			}
		}
	}
	return false;
};

const handleRapidReanimationForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const indexFromRight =
		playerEntity.rapidReanimationIndexFromLeft === 0
			? Math.max(0, playerBoard.length - playerEntity.rapidReanimationIndexFromLeft)
			: playerEntity.rapidReanimationIndexFromRight;
	const hasSummoned = handleSummon(
		playerBoard,
		playerEntity,
		opponentBoard,
		opponentEntity,
		gameState,
		playerEntity.rapidReanimationMinion.cardId,
		indexFromRight,
		true, // (Goldrinn gets buffed, so it seems we reapply auras? This is a mess tbh)
		playerEntity.rapidReanimationMinion,
	);
	if (hasSummoned) {
		playerEntity.rapidReanimationMinion = null;
		// Hard-coding a correction for Ancestral Automaton
		// Shold not be necessary if we reapply auras
		// hasSummoned.forEach((entity) => {
		// 	switch (entity.cardId) {
		// 		case CardIds.AstralAutomaton_BG_TTN_401:
		// 		case CardIds.AstralAutomaton_BG_TTN_401_G:
		// 			const overstatMult = entity.cardId === CardIds.AstralAutomaton_BG_TTN_401 ? 1 : 2;
		// 			entity.attack = Math.max(1, entity.attack + 2 * overstatMult);
		// 			entity.health = Math.max(0, entity.health + 2 * overstatMult);
		// 			break;
		// 		case CardIds.EternalKnight_BG25_008:
		// 		case CardIds.EternalKnight_BG25_008_G:
		// 			const knightMult = entity.cardId === CardIds.EternalKnight_BG25_008 ? 1 : 2;
		// 			entity.attack = Math.max(1, entity.attack + 1 * knightMult);
		// 			entity.health = Math.max(0, entity.health + 1 * knightMult);
		// 			break;
		// 	}
		// });
	}
	return false;
};

const handleSummon = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
	cardId: string,
	indexFromRight: number,
	applyAuras: boolean,
	minion: BoardEntity = null,
): readonly BoardEntity[] => {
	if (playerBoard.length >= 7) {
		return null;
	}
	const newMinion = buildSingleBoardEntity(
		cardId,
		playerEntity,
		playerBoard,
		gameState.allCards,
		playerEntity.friendly,
		gameState.sharedState.currentEntityId++,
		false,
		gameState.cardsData,
		gameState.sharedState,
		minion,
		null,
	);
	// Don't reapply auras in this particular case? See https://x.com/ZerotoHeroes_HS/status/1737422727118487808?s=20
	const spawned = performEntitySpawns(
		[newMinion],
		playerBoard,
		playerEntity,
		playerEntity,
		indexFromRight,
		opponentBoard,
		opponentEntity,
		gameState,
		applyAuras,
	);
	gameState.spectator.registerPowerTarget(playerEntity, newMinion, playerBoard, null, null);
	return spawned;
};
