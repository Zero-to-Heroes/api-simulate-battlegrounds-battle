import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { addStatsToBoard } from '../utils';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyAttack, modifyHealth, onStatsUpdate } from './stats';

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
	entitiesThatWereReborn.forEach((e) => (e.rebornFromEntityId = deadEntity.entityId));
	const entityRightToSpawns =
		deadMinionIndexFromRight === 0
			? null
			: boardWithKilledMinion[boardWithKilledMinion.length - deadMinionIndexFromRight];
	entitiesThatWereReborn.forEach((entity) => {
		entity.hasAttacked = deadEntity.hasAttacked > 1 ? 1 : entityRightToSpawns?.hasAttacked ?? 0;
	});

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
			modifyAttack(e, arfus + goldenArfus, boardWithKilledMinion, boardWithKilledMinionHero, gameState);
			onStatsUpdate(e, boardWithKilledMinion, boardWithKilledMinionHero, gameState);
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
					boardWithKilledMinionHero,
					multiplier * 1,
					multiplier * 3,
					gameState,
					Race[Race.UNDEAD],
				);
			});
		boardWithKilledMinion
			.filter((e) => e.cardId === CardIds.JellyBelly_BG25_005 || e.cardId === CardIds.JellyBelly_BG25_005_G)
			.forEach((e) => {
				const multiplier = e.cardId === CardIds.JellyBelly_BG25_005_G ? 2 : 1;
				modifyAttack(e, multiplier * 3, boardWithKilledMinion, boardWithKilledMinionHero, gameState);
				modifyHealth(e, multiplier * 3, boardWithKilledMinion, boardWithKilledMinionHero, gameState);
				onStatsUpdate(e, boardWithKilledMinion, boardWithKilledMinionHero, gameState);
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
