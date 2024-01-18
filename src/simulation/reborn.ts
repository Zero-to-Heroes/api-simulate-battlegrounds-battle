import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { addStatsToBoard, afterStatsUpdate, modifyAttack, modifyHealth } from '../utils';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';

export const handleRebornForEntity = (
	boardWithKilledMinion: BoardEntity[],
	boardWithKilledMinionHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadMinionIndexFromRight: number,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const numberOfReborns = 1;
	let entityToSpawn: BoardEntity = null;
	// TODO: test
	if (
		deadEntity.cardId === CardIds.SinrunnerBlanchy_BG24_005 ||
		deadEntity.cardId === CardIds.SinrunnerBlanchy_BG24_005_G
	) {
		entityToSpawn = {
			...deadEntity,
			hasAttacked: 0,
			health: deadEntity.maxHealth,
			divineShield: deadEntity.hadDivineShield,
			reborn: false,
		};
	}
	const entitiesFromReborn: readonly BoardEntity[] =
		deadEntity.reborn && deadMinionIndexFromRight >= 0
			? spawnEntities(
					deadEntity.cardId,
					numberOfReborns,
					boardWithKilledMinion,
					boardWithKilledMinionHero,
					opponentBoard,
					opponentBoardHero,
					gameState.allCards,
					gameState.cardsData,
					gameState.sharedState,
					gameState.spectator,
					deadEntity.friendly,
					false,
					true,
					true,
					entityToSpawn,
					deadEntity,
			  )
			: [];
	const entitiesThatWereReborn = performEntitySpawns(
		entitiesFromReborn,
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		deadEntity,
		deadMinionIndexFromRight,
		opponentBoard,
		opponentBoardHero,
		gameState,
	);

	const arfus = boardWithKilledMinion
		.filter((e) => e.cardId === CardIds.Arfus_TB_BaconShop_HERO_22_Buddy)
		.map((e) => e.attack)
		.reduce((a, b) => a + b, 0);
	const goldenArfus = boardWithKilledMinion
		.filter((e) => e.cardId === CardIds.Arfus_TB_BaconShop_HERO_22_Buddy_G)
		.map((e) => 2 * e.attack)
		.reduce((a, b) => a + b, 0);
	if (arfus + goldenArfus > 0) {
		entitiesThatWereReborn.forEach((e) => {
			modifyAttack(e, arfus + goldenArfus, boardWithKilledMinion, gameState.allCards);
			afterStatsUpdate(e, boardWithKilledMinion, gameState.allCards);
		});
	}

	const numberOfTriggersForDeathwhisper = Math.min(entitiesFromReborn.length, 1);
	for (let i = 0; i < numberOfTriggersForDeathwhisper; i++) {
		boardWithKilledMinion
			.filter(
				(e) =>
					e.cardId === CardIds.SisterDeathwhisper_BG25_020 ||
					e.cardId === CardIds.SisterDeathwhisper_BG25_020_G,
			)
			.forEach((e) => {
				const multiplier = e.cardId === CardIds.SisterDeathwhisper_BG25_020_G ? 2 : 1;
				addStatsToBoard(
					e,
					boardWithKilledMinion,
					multiplier * 1,
					multiplier * 3,
					gameState.allCards,
					gameState.spectator,
					Race[Race.UNDEAD],
				);
			});
		boardWithKilledMinion
			.filter((e) => e.cardId === CardIds.JellyBelly_BG25_005 || e.cardId === CardIds.JellyBelly_BG25_005_G)
			.forEach((e) => {
				const multiplier = e.cardId === CardIds.JellyBelly_BG25_005_G ? 2 : 1;
				modifyAttack(e, multiplier * 3, boardWithKilledMinion, gameState.allCards);
				modifyHealth(e, multiplier * 3, boardWithKilledMinion, gameState.allCards);
				afterStatsUpdate(e, boardWithKilledMinion, gameState.allCards);
				gameState.spectator.registerPowerTarget(
					e,
					e,
					boardWithKilledMinion,
					boardWithKilledMinionHero,
					opponentBoardHero,
				);
			});
	}
};
