import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { isCorrectTribe } from '../utils';
import { dealDamageToMinion } from './attack';
import { addCardsInHand } from './cards-in-hand';
import { FullGameState } from './internal-game-state';
import { modifyAttack, modifyHealth, onStatsUpdate } from './stats';

export const applyOnAttackBuffs = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// Ripsnarl Captain
	if (isCorrectTribe(gameState.allCards.getCard(attacker.cardId).races, Race.PIRATE)) {
		const ripsnarls = attackingBoard.filter((e) => e.cardId === CardIds.RipsnarlCaptain_BGS_056);
		const ripsnarlsTB = attackingBoard.filter(
			(entity) => entity.cardId === CardIds.RipsnarlCaptain_TB_BaconUps_139,
		);
		ripsnarls.forEach((captain) => {
			modifyAttack(attacker, 3, attackingBoard, attackingBoardHero, gameState);
			gameState.spectator.registerPowerTarget(captain, attacker, attackingBoard, attackingBoardHero, otherHero);
		});
		ripsnarlsTB.forEach((captain) => {
			modifyAttack(attacker, 6, attackingBoard, attackingBoardHero, gameState);
			gameState.spectator.registerPowerTarget(captain, attacker, attackingBoard, attackingBoardHero, otherHero);
		});
	}

	// Dread Admiral Eliza
	if (isCorrectTribe(gameState.allCards.getCard(attacker.cardId).races, Race.PIRATE)) {
		const elizas = attackingBoard.filter(
			(e) =>
				e.cardId === CardIds.DreadAdmiralEliza_BGS_047 || e.cardId === CardIds.AdmiralElizaGoreblade_BG27_555,
		);
		const elizasTB = attackingBoard.filter(
			(e) =>
				e.cardId === CardIds.DreadAdmiralEliza_TB_BaconUps_134 ||
				e.cardId === CardIds.AdmiralElizaGoreblade_BG27_555_G,
		);

		elizas.forEach((eliza) => {
			attackingBoard.forEach((entity) => {
				modifyAttack(entity, 3, attackingBoard, attackingBoardHero, gameState);
				modifyHealth(entity, 1, attackingBoard, attackingBoardHero, gameState);
				onStatsUpdate(entity, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(eliza, entity, attackingBoard, attackingBoardHero, otherHero);
			});
		});
		elizasTB.forEach((eliza) => {
			attackingBoard.forEach((entity) => {
				modifyAttack(entity, 6, attackingBoard, attackingBoardHero, gameState);
				modifyHealth(entity, 2, attackingBoard, attackingBoardHero, gameState);
				onStatsUpdate(entity, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(eliza, entity, attackingBoard, attackingBoardHero, otherHero);
			});
		});
	}

	// Roaring Rallier
	if (isCorrectTribe(gameState.allCards.getCard(attacker.cardId).races, Race.DRAGON)) {
		attackingBoard
			.filter(
				(e) => e.cardId === CardIds.RoaringRallier_BG29_816 || e.cardId === CardIds.RoaringRallier_BG29_816_G,
			)
			.forEach((rallier) => {
				const stats = rallier.cardId === CardIds.RoaringRallier_BG29_816_G ? 4 : 2;
				modifyAttack(attacker, stats, attackingBoard, attackingBoardHero, gameState);
				modifyHealth(attacker, stats, attackingBoard, attackingBoardHero, gameState);
				onStatsUpdate(attacker, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					rallier,
					attacker,
					attackingBoard,
					attackingBoardHero,
					otherHero,
				);
			});
	}

	if (attacker.cardId === CardIds.GlyphGuardian_BGS_045) {
		// For now the utility method only works additively, so we hack around it
		modifyAttack(attacker, 2 * attacker.attack - attacker.attack, attackingBoard, attackingBoardHero, gameState);
	} else if (attacker.cardId === CardIds.GlyphGuardian_TB_BaconUps_115) {
		modifyAttack(attacker, 3 * attacker.attack - attacker.attack, attackingBoard, attackingBoardHero, gameState);
	} else if (
		attacker.cardId === CardIds.GlimGuardian_BG29_888 ||
		attacker.cardId === CardIds.GlimGuardian_BG29_888_G
	) {
		const multiplier = attacker.cardId === CardIds.GlimGuardian_BG29_888_G ? 2 : 1;
		modifyAttack(attacker, 2 * multiplier, attackingBoard, attackingBoardHero, gameState);
		modifyHealth(attacker, 1 * multiplier, attackingBoard, attackingBoardHero, gameState);
		onStatsUpdate(attacker, attackingBoard, attackingBoardHero, gameState);
		gameState.spectator.registerPowerTarget(attacker, attacker, attackingBoard, attackingBoardHero, otherHero);
	} else if (
		attacker.cardId === CardIds.VanessaVancleef_BG24_708 ||
		attacker.cardId === CardIds.VanessaVancleef_BG24_708_G
	) {
		attackingBoard
			.filter((e) => isCorrectTribe(gameState.allCards.getCard(e.cardId).races, Race.PIRATE))
			.forEach((e) => {
				modifyAttack(
					e,
					attacker.cardId === CardIds.VanessaVancleef_BG24_708_G ? 4 : 2,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
				modifyHealth(
					e,
					attacker.cardId === CardIds.VanessaVancleef_BG24_708_G ? 4 : 2,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
				gameState.spectator.registerPowerTarget(attacker, e, attackingBoard, attackingBoardHero, otherHero);
			});
	} else if (
		attacker.cardId === CardIds.WhirlingLassOMatic_BG28_635 ||
		attacker.cardId === CardIds.WhirlingLassOMatic_BG28_635_G
	) {
		const numberOfCardsToAdd = attacker.cardId === CardIds.WhirlingLassOMatic_BG28_635_G ? 2 : 1;
		const cardsToAdd = Array.from({ length: numberOfCardsToAdd }).map(() => null);
		addCardsInHand(attackingBoardHero, attackingBoard, cardsToAdd, gameState);
	} else if (attacker.cardId === CardIds.Rampager_BG29_809 || attacker.cardId === CardIds.Rampager_BG29_809_G) {
		const loops = attacker.cardId === CardIds.Rampager_BG29_809_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			// Don't include new spawns
			for (const entity of [...attackingBoard]) {
				if (entity.entityId === attacker.entityId) {
					continue;
				}
				dealDamageToMinion(
					entity,
					attackingBoard,
					attackingBoardHero,
					attacker,
					1,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
			}
		}
	} else if (attacker.cardId === CardIds.HatefulHag_BG29_120 || attacker.cardId === CardIds.HatefulHag_BG29_120_G) {
		const loops = attacker.cardId === CardIds.HatefulHag_BG29_120_G ? 2 : 1;
		const attackerIndex = attackingBoard.indexOf(attacker);
		for (let i = 1; i <= loops; i++) {
			const target = attackingBoard[attackerIndex + i];
			if (!!target) {
				target.reborn = true;
				gameState.spectator.registerPowerTarget(
					attacker,
					target,
					attackingBoard,
					attackingBoardHero,
					otherHero,
				);
			}
		}
	}

	const eclipsion = attackingBoard.find(
		(e) =>
			[
				CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy,
				CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy_G,
			].includes(e.cardId as CardIds) && e.abiityChargesLeft > 0,
	);
	if (!!eclipsion) {
		attacker.immuneWhenAttackCharges = 1;
		eclipsion.abiityChargesLeft--;
	}
};
