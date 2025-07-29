import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasRebornEffect, hasRebornSelfEffect } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { addStatsToBoard } from '../utils';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';

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
					gameState,
					deadEntity.friendly,
					false,
					true,
					true,
					entityToSpawn,
					deadEntity,
			  )
			: [];
	if (!entitiesFromReborn.length) {
		return;
	}

	if (
		deadEntity.cardId === CardIds.WannabeGargoyle_BG30_109 ||
		deadEntity.cardId === CardIds.WannabeGargoyle_BG30_109_G
	) {
		entitiesFromReborn.forEach((e) => {
			const attack = deadEntity.maxAttack;
			const health = deadEntity.cardId === CardIds.WannabeGargoyle_BG30_109_G ? deadEntity.maxHealth : 1;
			e.attack = attack;
			e.health = health;
		});
	}

	for (const entity of entitiesFromReborn) {
		const rebornImpl = cardMappings[entity.cardId];
		if (hasRebornSelfEffect(rebornImpl)) {
			rebornImpl.rebornSelfEffect(entity, {
				rebornEntity: deadEntity,
				boardWithKilledMinion,
				boardWithKilledMinionHero,
				opponentBoard,
				opponentBoardHero,
				gameState,
			});
		}
	}

	for (const entity of boardWithKilledMinion) {
		const rebornImpl = cardMappings[entity.cardId];
		if (hasRebornEffect(rebornImpl)) {
			rebornImpl.rebornEffect(entity, {
				rebornEntity: deadEntity,
				boardWithKilledMinion,
				boardWithKilledMinionHero,
				opponentBoard,
				opponentBoardHero,
				gameState,
			});
		}
	}

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

	// Arfus
	boardWithKilledMinion
		.filter(
			(e) =>
				e.cardId === CardIds.Arfus_TB_BaconShop_HERO_22_Buddy ||
				e.cardId === CardIds.Arfus_TB_BaconShop_HERO_22_Buddy_G,
		)
		.forEach((arfus) => {
			const multiplier = arfus.cardId === CardIds.Arfus_TB_BaconShop_HERO_22_Buddy_G ? 2 : 1;
			const attackBonus = arfus.attack * multiplier;
			entitiesThatWereReborn
				.filter((e) => e.entityId !== arfus.entityId && e.rebornFromEntityId !== arfus.entityId)
				.forEach((e) => {
					modifyStats(e, arfus, attackBonus, 0, boardWithKilledMinion, boardWithKilledMinionHero, gameState);
				});
		});

	const numberOfTriggersForDeathwhisper = Math.min(entitiesThatWereReborn.length, 1);
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
				);
			});
		boardWithKilledMinion
			.filter((e) => e.cardId === CardIds.JellyBelly_BG25_005 || e.cardId === CardIds.JellyBelly_BG25_005_G)
			.forEach((e) => {
				const multiplier = e.cardId === CardIds.JellyBelly_BG25_005_G ? 2 : 1;
				modifyStats(
					e,
					e,
					multiplier * 1,
					multiplier * 2,
					boardWithKilledMinion,
					boardWithKilledMinionHero,
					gameState,
				);
			});
	}
};

export interface RebornEffectInput {
	readonly rebornEntity: BoardEntity;
	readonly boardWithKilledMinion: BoardEntity[];
	readonly boardWithKilledMinionHero: BgsPlayerEntity;
	readonly opponentBoard: BoardEntity[];
	readonly opponentBoardHero: BgsPlayerEntity;
	readonly gameState: FullGameState;
}
