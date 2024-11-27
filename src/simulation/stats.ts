import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnStatsChanged } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { addStatsToBoard, hasCorrectTribe } from '../utils';
import { applyAurasToSelf } from './add-minion-to-board';
import { getNeighbours } from './attack';
import { FullGameState, PlayerState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';
import { Spectator } from './spectator/spectator';

export const setEntityStats = (
	entity: BoardEntity,
	attack: number | null,
	health: number | null,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (attack !== null) {
		entity.attack = attack;
		entity.maxAttack = attack;
	}
	if (health !== null) {
		entity.health = health;
		entity.maxHealth = health;
	}
	applyAurasToSelf(entity, board, boardHero, gameState);
};

export const modifyStats = (
	entity: BoardEntity,
	attackAmount: number,
	healthAmount: number,
	friendlyBoard: BoardEntity[],
	friendlyBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
	spectator: Spectator = null,
): void => {
	if (attackAmount === 0 && healthAmount === 0) {
		return;
	}

	if (entity.cardId === CardIds.LocPrince_BG29_889 || entity.cardId === CardIds.LocPrince_BG29_889_G) {
		const buff = entity.cardId === CardIds.LocPrince_BG29_889_G ? 2 : 1;
		attackAmount += 3 * buff;
		healthAmount += 2 * buff;
	}

	const otherBoardHero: BgsPlayerEntity =
		gameState.gameState.player.player === friendlyBoardHero
			? gameState.gameState.opponent.player
			: gameState.gameState.player.player;

	const neighbours = getNeighbours(friendlyBoard, entity);
	const poetMultipliers = hasCorrectTribe(entity, friendlyBoardHero, Race.DRAGON, gameState.allCards)
		? neighbours.filter((e) => e.cardId === CardIds.PersistentPoet_BG29_813_G).length * 2 || 1
		: 1;
	const tarecgosaMultiplier = entity.cardId === CardIds.Tarecgosa_BG21_015_G ? 2 : 1;

	const realAttackAmount = attackAmount * poetMultipliers * tarecgosaMultiplier;
	const realHealthAmount = healthAmount * poetMultipliers * tarecgosaMultiplier;

	entity.attack = Math.max(0, entity.attack + realAttackAmount);
	entity.previousAttack = entity.attack;
	entity.pendingAttackBuffs = entity.pendingAttackBuffs || [];
	entity.pendingAttackBuffs.push(realAttackAmount);
	entity.health += realHealthAmount;

	if (realAttackAmount > 0) {
		entity.maxAttack += realAttackAmount;

		if (hasCorrectTribe(entity, friendlyBoardHero, Race.DRAGON, gameState.allCards)) {
			const whelpSmugglers = friendlyBoard.filter(
				(e) => e.cardId === CardIds.WhelpSmuggler_BG21_013 || e.cardId === CardIds.WhelpSmuggler_BG21_013_G,
			);
			whelpSmugglers.forEach((smuggler) => {
				const buff = smuggler.cardId === CardIds.WhelpSmuggler_BG21_013_G ? 2 : 1;
				modifyStats(entity, 0, buff, friendlyBoard, friendlyBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					smuggler,
					entity,
					friendlyBoard,
					friendlyBoardHero,
					otherBoardHero,
				);
			});

			if (entity.cardId !== CardIds.Stormbringer_BG26_966 && entity.cardId !== CardIds.Stormbringer_BG26_966_G) {
				const stormbringers = friendlyBoard.filter(
					(e) => e.cardId === CardIds.Stormbringer_BG26_966 || e.cardId === CardIds.Stormbringer_BG26_966_G,
				);
				stormbringers.forEach((stormbringer) => {
					const multiplier = stormbringer.cardId === CardIds.Stormbringer_BG26_966_G ? 2 : 1;
					// This is never called?
					(e) => {
						e.attack += multiplier * realAttackAmount;
						gameState.spectator.registerPowerTarget(
							stormbringer,
							entity,
							friendlyBoard,
							friendlyBoardHero,
							otherBoardHero,
						);
					};
				});
			}
		}

		// Sinestra
		friendlyBoard
			.filter(
				(e) =>
					e.cardId === CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy ||
					e.cardId === CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G,
			)
			.forEach((sinestra) => {
				const buff = sinestra.cardId === CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G ? 2 : 1;
				entity.health += buff;
				gameState.spectator.registerPowerTarget(
					sinestra,
					entity,
					friendlyBoard,
					friendlyBoardHero,
					otherBoardHero,
				);
			});

		// TODO: what happens if the Hunter is killed during the attack?
		if (
			[CardIds.HunterOfGatherers_BG25_027, CardIds.HunterOfGatherers_BG25_027_G].includes(
				entity.cardId as CardIds,
			)
		) {
			addStatsToBoard(
				entity,
				friendlyBoard,
				friendlyBoardHero,
				0,
				entity.cardId === CardIds.HunterOfGatherers_BG25_027_G ? 4 : 2,
				gameState,
			);
		} else if (
			entity.cardId === CardIds.DefiantShipwright_BG21_018 ||
			entity.cardId === CardIds.DefiantShipwright_BG21_018_G
		) {
			const stat = entity.cardId === CardIds.DefiantShipwright_BG21_018_G ? 2 : 1;
			entity.health += stat;
		}
	}

	if (realHealthAmount > 0) {
		entity.maxHealth += realHealthAmount;
		const titanicGuardians = friendlyBoard
			.filter((e) => e.entityId !== entity.entityId)
			.filter(
				(e) =>
					e.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy ||
					e.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy_G,
			);
		titanicGuardians.forEach((guardian) => {
			const buff =
				(guardian.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy_G ? 2 : 1) * realHealthAmount;
			if (buff > 0) {
				guardian.health += buff;
				guardian.maxHealth += buff;
			}
		});
	}

	if (
		entity.cardId === CardIds.Menagerist_AmalgamToken ||
		entity.cardId === CardIds.Cuddlgam_TB_BaconShop_HP_033t_SKIN_A ||
		entity.cardId === CardIds.Cuddlgam_TB_BaconShop_HP_033t_SKIN_A_G ||
		entity.cardId === CardIds.AbominableAmalgam_TB_BaconShop_HP_033t_SKIN_D ||
		entity.cardId === CardIds.AbominableAmalgam_TB_BaconShop_HP_033t_SKIN_D_G
	) {
		const mishmashes = friendlyBoard.filter(
			(e) =>
				e.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy ||
				e.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G,
		);
		mishmashes.forEach((mishmash) => {
			modifyStats(
				mishmash,
				(mishmash.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realAttackAmount,
				(mishmash.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realHealthAmount,
				friendlyBoard,
				friendlyBoardHero,
				gameState,
			);
		});
	}

	onStatsUpdate(entity, realAttackAmount, realHealthAmount, friendlyBoard, friendlyBoardHero, gameState);
};

const onStatsUpdate = (
	entity: BoardEntity,
	realAttackAmount: number,
	realHealthAmount: number,
	friendlyBoard: BoardEntity[],
	friendlyHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	onStatUpdateMinions(entity, realAttackAmount, realHealthAmount, friendlyBoard, friendlyHero, gameState);
	onStatUpdateQuests(entity, friendlyBoard, friendlyHero, gameState);
};

export const applyAfterStatsUpdate = (gameState: FullGameState) => {
	for (const entity of gameState.gameState.player.board) {
		applyAfterStatsUpdateForEntity(entity, gameState.gameState.player, gameState.gameState.opponent, gameState);
	}
	for (const entity of gameState.gameState.opponent.board) {
		applyAfterStatsUpdateForEntity(entity, gameState.gameState.opponent, gameState.gameState.player, gameState);
	}
};

const applyAfterStatsUpdateForEntity = (
	entity: BoardEntity,
	playerState: PlayerState,
	opponentState: PlayerState,
	gameState: FullGameState,
): void => {
	// Attack buffs
	// Actually this was a bug, and the stats update happen at the same time
	// Keeping the structure here in case it's useful in the future
	// for (const attackBuff of entity.pendingAttackBuffs) {
	// 	if (isCorrectTribe(gameState.allCards.getCard(entity.cardId).races, Race.DRAGON)) {
	// 		const whelpSmugglers = playerState.board.filter(
	// 			(e) => e.cardId === CardIds.WhelpSmuggler_BG21_013 || e.cardId === CardIds.WhelpSmuggler_BG21_013_G,
	// 		);
	// 		whelpSmugglers.forEach((smuggler) => {
	// 			const buff = smuggler.cardId === CardIds.WhelpSmuggler_BG21_013_G ? 2 : 1;
	// 			modifyHealth(entity, buff, playerState.board, playerState.player, gameState);
	// 			gameState.spectator.registerPowerTarget(
	// 				smuggler,
	// 				entity,
	// 				playerState.board,
	// 				playerState.player,
	// 				opponentState.player,
	// 			);
	// 		});

	// 		if (entity.cardId !== CardIds.Stormbringer_BG26_966 && entity.cardId !== CardIds.Stormbringer_BG26_966_G) {
	// 			const stormbringers = playerState.board.filter(
	// 				(e) => e.cardId === CardIds.Stormbringer_BG26_966 || e.cardId === CardIds.Stormbringer_BG26_966_G,
	// 			);
	// 			stormbringers.forEach((stormbringer) => {
	// 				const multiplier = stormbringer.cardId === CardIds.Stormbringer_BG26_966_G ? 2 : 1;
	// 				(e) => {
	// 					modifyAttack(e, multiplier * attackBuff, playerState.board, playerState.player, gameState);
	// 					gameState.spectator.registerPowerTarget(
	// 						stormbringer,
	// 						entity,
	// 						playerState.board,
	// 						playerState.player,
	// 						opponentState.player,
	// 					);
	// 				};
	// 			});
	// 		}
	// 	}

	// 	// TODO: what happens if the Hunter is killed during the attack?
	// 	if (
	// 		[CardIds.HunterOfGatherers_BG25_027, CardIds.HunterOfGatherers_BG25_027_G].includes(
	// 			entity.cardId as CardIds,
	// 		)
	// 	) {
	// 		addStatsToBoard(
	// 			entity,
	// 			playerState.board,
	// 			playerState.player,
	// 			0,
	// 			entity.cardId === CardIds.HunterOfGatherers_BG25_027_G ? 2 : 1,
	// 			gameState,
	// 		);
	// 	}
	// }
	entity.pendingAttackBuffs = [];
};

const onStatUpdateQuests = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const quests = hero.questEntities ?? [];
	if (!quests.length) {
		return;
	}

	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.FindTheMurderWeapon:
				onQuestProgressUpdated(hero, quest, board, gameState);
				break;
			case CardIds.PressureTheAuthorities:
				const totalAttack = board.map((e) => e.attack).reduce((a, b) => a + b, 0);
				if (totalAttack >= 35) {
					onQuestProgressUpdated(hero, quest, board, gameState);
				}
				break;
		}
	}
};

const onStatUpdateMinions = (
	entity: BoardEntity,
	attackAmount: number,
	healthAmount: number,
	friendlyBoard: BoardEntity[],
	friendlyBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (attackAmount > 0 || healthAmount > 0) {
		for (const boardEntity of friendlyBoard) {
			const onStatsChangedImpl = cardMappings[boardEntity.cardId];
			if (hasOnStatsChanged(onStatsChangedImpl)) {
				onStatsChangedImpl.onStatsChanged(boardEntity, {
					target: entity,
					attackAmount: attackAmount,
					healthAmount: healthAmount,
					board: friendlyBoard,
					hero: friendlyBoardHero,
					gameState: gameState,
				});
			}
		}
	}

	if (hasCorrectTribe(entity, friendlyBoardHero, Race.ELEMENTAL, gameState.allCards)) {
		const masterOfRealities = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MasterOfRealities_BG21_036 || e.cardId === CardIds.MasterOfRealities_BG21_036_G,
		);
		masterOfRealities.forEach((master) => {
			modifyStats(
				master,
				master.cardId === CardIds.MasterOfRealities_BG21_036_G ? 2 : 1,
				master.cardId === CardIds.MasterOfRealities_BG21_036_G ? 2 : 1,
				friendlyBoard,
				friendlyBoardHero,
				gameState,
			);
		});
	}
	const tentaclesOfCthun = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter(
			(e) =>
				e.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy ||
				e.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G,
		);
	tentaclesOfCthun.forEach((tentacle) => {
		tentacle.attack += tentacle.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1;
		tentacle.health += tentacle.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1;
	});
};

export interface OnStatsChangedInput {
	target: BoardEntity;
	attackAmount: number;
	healthAmount: number;
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	gameState: FullGameState;
}
