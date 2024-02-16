import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { addStatsToBoard, hasCorrectTribe, isCorrectTribe } from '../utils';
import { applyAurasToSelf } from './add-minion-to-board';
import { FullGameState } from './internal-game-state';
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
	}
	if (health !== null) {
		entity.health = health;
		entity.maxHealth = health;
	}
	applyAurasToSelf(entity, board, boardHero, gameState);
};

export const modifyAttack = (
	entity: BoardEntity,
	amount: number,
	friendlyBoard: BoardEntity[],
	friendlyBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
	spectator: Spectator = null,
): void => {
	if (amount === 0) {
		return;
	}

	const realAmount = entity.cardId === CardIds.Tarecgosa_BG21_015_G ? 2 * amount : amount;
	entity.attack = Math.max(0, entity.attack + realAmount);
	entity.previousAttack = entity.attack;
	if (isCorrectTribe(gameState.allCards.getCard(entity.cardId).races, Race.DRAGON)) {
		const whelpSmugglers = friendlyBoard.filter(
			(e) => e.cardId === CardIds.WhelpSmuggler_BG21_013 || e.cardId === CardIds.WhelpSmuggler_BG21_013_G,
		);
		whelpSmugglers.forEach((smuggler) => {
			const buff = smuggler.cardId === CardIds.WhelpSmuggler_BG21_013_G ? 2 : 1;
			modifyHealth(entity, buff, friendlyBoard, friendlyBoardHero, gameState);
		});

		if (entity.cardId !== CardIds.Stormbringer_BG26_966 && entity.cardId !== CardIds.Stormbringer_BG26_966_G) {
			const stormbringers = friendlyBoard.filter(
				(e) => e.cardId === CardIds.Stormbringer_BG26_966 || e.cardId === CardIds.Stormbringer_BG26_966_G,
			);
			stormbringers.forEach((stormbringer) => {
				const multiplier = stormbringer.cardId === CardIds.Stormbringer_BG26_966_G ? 2 : 1;
				(e) => modifyAttack(e, multiplier * amount, friendlyBoard, friendlyBoardHero, gameState);
			});
		}
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
			modifyAttack(
				mishmash,
				(mishmash.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realAmount,
				friendlyBoard,
				friendlyBoardHero,
				gameState,
			);
		});
	}

	if ([CardIds.HunterOfGatherers_BG25_027, CardIds.HunterOfGatherers_BG25_027_G].includes(entity.cardId as CardIds)) {
		addStatsToBoard(
			entity,
			friendlyBoard,
			friendlyBoardHero,
			0,
			entity.cardId === CardIds.HunterOfGatherers_BG25_027_G ? 2 : 1,
			gameState,
		);
	}
};

export const modifyHealth = (
	entity: BoardEntity,
	amount: number,
	friendlyBoard: BoardEntity[],
	friendlyBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const realAmount = entity.cardId === CardIds.Tarecgosa_BG21_015 ? 2 * amount : amount;
	entity.health += realAmount;
	if (realAmount > 0) {
		entity.maxHealth += realAmount;
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
			modifyHealth(
				mishmash,
				(mishmash.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realAmount,
				friendlyBoard,
				friendlyBoardHero,
				gameState,
			);
		});
	}

	const titanicGuardians = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter(
			(e) =>
				e.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy ||
				e.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy_G,
		);
	titanicGuardians.forEach((guardian) => {
		modifyHealth(
			guardian,
			(guardian.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy_G ? 2 : 1) * realAmount,
			friendlyBoard,
			friendlyBoardHero,
			gameState,
		);
	});
};

export const afterStatsUpdate = (
	entity: BoardEntity,
	friendlyBoard: BoardEntity[],
	friendlyHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	onStatUpdateMinions(entity, friendlyBoard, friendlyHero, gameState);
	onStatUpdateQuests(entity, friendlyBoard, friendlyHero, gameState);
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
	friendlyBoard: BoardEntity[],
	friendlyBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (hasCorrectTribe(entity, Race.ELEMENTAL, gameState.allCards)) {
		const masterOfRealities = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MasterOfRealities_BG21_036 || e.cardId === CardIds.MasterOfRealities_BG21_036_G,
		);
		masterOfRealities.forEach((master) => {
			modifyAttack(
				master,
				master.cardId === CardIds.MasterOfRealities_BG21_036_G ? 2 : 1,
				friendlyBoard,
				friendlyBoardHero,
				gameState,
			);
			modifyHealth(
				master,
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
		modifyAttack(
			tentacle,
			tentacle.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1,
			friendlyBoard,
			friendlyBoardHero,
			gameState,
		);
		modifyHealth(
			tentacle,
			tentacle.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1,
			friendlyBoard,
			friendlyBoardHero,
			gameState,
		);
	});
};
