import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
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
) => {
	handleSummonsWhenSpaceForPlayer(playerEntity, playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	handleSummonsWhenSpaceForPlayer(
		opponentEntity,
		opponentBoard,
		opponentEntity,
		playerBoard,
		playerEntity,
		gameState,
	);
};

// TODO: Twin Sky Lanterns wait for 2 spaces
const handleSummonsWhenSpaceForPlayer = (
	targetEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	if (targetEntity.rapidReanimationMinion) {
		handleRapidReanimationForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}
	if (targetEntity.questRewards?.includes(CardIds.StableAmalgamation_BG28_Reward_518)) {
		handleStableAmalgamationForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}
	if (targetEntity.secrets?.some((s) => s.cardId === CardIds.BoonOfBeetles_BG28_603)) {
		handleBoonOfBeetlesForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}
	if (targetEntity.heroPowerId === CardIds.Ozumat_Tentacular) {
		handleOzumatForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			targetEntity.friendly,
			gameState,
		);
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
			.filter((d) => hasCorrectTribe(d, playerEntity, Race.MECH, gameState.allCards))[0];
		if (!!candidate) {
			const spawn = copyEntity(candidate);
			removeAurasFromSelf(spawn, playerBoard, playerEntity, gameState);
			const target = spawnEntities(
				spawn.cardId,
				1,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState.allCards,
				gameState.cardsData,
				gameState.sharedState,
				gameState.spectator,
				playerEntity.friendly,
				true,
				false,
				false,
				spawn,
			);
			// FIXME: here it should try to match the position at which the original minions died
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
			trinket.scriptDataNum1 = 0;
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
	const spawnNumber = trinket.scriptDataNum1;
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
			gameState.allCards,
			gameState.cardsData,
			gameState.sharedState,
			gameState.spectator,
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
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	friendly: boolean,
	gameState: FullGameState,
): void => {
	if (playerBoard.length < 7 && playerEntity.heroPowerActivated === false) {
		const tentacularSize = +playerEntity.heroPowerInfo;
		const tentacular = spawnEntities(
			CardIds.Tentacular_OzumatsTentacleToken_BG23_HERO_201pt,
			1,
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			gameState.allCards,
			gameState.cardsData,
			gameState.sharedState,
			gameState.spectator,
			friendly,
			true,
			false,
			false,
		);
		tentacular[0].attack = tentacularSize;
		tentacular[0].health = tentacularSize;
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
		playerEntity.heroPowerActivated = true;
	}
};

const handleBoonOfBeetlesForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const secretEntity = playerEntity.secrets.find((entity) => entity.cardId === CardIds.BoonOfBeetles_BG28_603);
	if (secretEntity && secretEntity.scriptDataNum1 > 0) {
		while (secretEntity.scriptDataNum1 > 0) {
			const hasSummoned = handleSummon(
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				CardIds.BoonOfBeetles_BeetleToken_BG28_603t,
				0,
			);
			if (hasSummoned) {
				secretEntity.scriptDataNum1--;
			} else {
				// No room to summon, we stop here
				break;
			}
		}
	}
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
			);
			if (hasSummoned) {
				rewardEntity.scriptDataNum1--;
			} else {
				// No room to summon, we stop here
				break;
			}
		}
	}
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
		playerEntity.rapidReanimationMinion,
	);
	if (hasSummoned) {
		playerEntity.rapidReanimationMinion = null;
	}
};

const handleSummon = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
	cardId: string,
	indexFromRight: number,
	minion: BoardEntity = null,
): boolean => {
	if (playerBoard.length >= 7) {
		return false;
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
		false,
	);
	gameState.spectator.registerPowerTarget(playerEntity, newMinion, playerBoard, null, null);
	return spawned.length > 0;
};
