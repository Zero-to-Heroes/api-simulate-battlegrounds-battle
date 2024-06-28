import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom } from '../services/utils';
import { isCorrectTribe } from '../utils';
import { dealDamageToMinion, getNeighbours } from './attack';
import { addCardsInHand } from './cards-in-hand';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

// Whenever it attacks
export const applyOnAttackEffects = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// Damage happens before the entity is buffed, e.g. before an attack buff from Roaring Rallier
	if (
		attacker.cardId === CardIds.ObsidianRavager_BG27_017 ||
		attacker.cardId === CardIds.ObsidianRavager_BG27_017_G
	) {
		const neighbours = getNeighbours(defendingBoard, defendingEntity);
		const targets = attacker.cardId === CardIds.ObsidianRavager_BG27_017_G ? neighbours : [pickRandom(neighbours)];
		targets.forEach((target) => {
			gameState.spectator.registerPowerTarget(
				attacker,
				target,
				defendingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
			// damageDoneByAttacker +=
			dealDamageToMinion(
				target,
				defendingBoard,
				defendingBoardHero,
				attacker,
				attacker.attack,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
		});
	}

	// Ripsnarl Captain
	if (isCorrectTribe(gameState.allCards.getCard(attacker.cardId).races, Race.PIRATE)) {
		const ripsnarls = attackingBoard.filter((e) => e.cardId === CardIds.RipsnarlCaptain_BGS_056);
		const ripsnarlsTB = attackingBoard.filter(
			(entity) => entity.cardId === CardIds.RipsnarlCaptain_TB_BaconUps_139,
		);
		ripsnarls.forEach((captain) => {
			modifyStats(attacker, 3, 0, attackingBoard, attackingBoardHero, gameState);
			gameState.spectator.registerPowerTarget(
				captain,
				attacker,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
		});
		ripsnarlsTB.forEach((captain) => {
			modifyStats(attacker, 6, 0, attackingBoard, attackingBoardHero, gameState);
			gameState.spectator.registerPowerTarget(
				captain,
				attacker,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
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
				modifyStats(entity, 3, 1, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					eliza,
					entity,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
			});
		});
		elizasTB.forEach((eliza) => {
			attackingBoard.forEach((entity) => {
				modifyStats(entity, 6, 2, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					eliza,
					entity,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
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
				const stats = rallier.cardId === CardIds.RoaringRallier_BG29_816_G ? 2 : 1;
				modifyStats(attacker, 3 * stats, stats, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					rallier,
					attacker,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
			});
	}

	if (attacker.cardId === CardIds.GlyphGuardian_BGS_045) {
		// For now the utility method only works additively, so we hack around it
		modifyStats(attacker, 2 * attacker.attack - attacker.attack, 0, attackingBoard, attackingBoardHero, gameState);
	} else if (attacker.cardId === CardIds.GlyphGuardian_TB_BaconUps_115) {
		modifyStats(attacker, 3 * attacker.attack - attacker.attack, 0, attackingBoard, attackingBoardHero, gameState);
	} else if (
		attacker.cardId === CardIds.GlimGuardian_BG29_888 ||
		attacker.cardId === CardIds.GlimGuardian_BG29_888_G
	) {
		const multiplier = attacker.cardId === CardIds.GlimGuardian_BG29_888_G ? 2 : 1;
		modifyStats(attacker, 2 * multiplier, 1 * multiplier, attackingBoard, attackingBoardHero, gameState);
		gameState.spectator.registerPowerTarget(
			attacker,
			attacker,
			attackingBoard,
			attackingBoardHero,
			defendingBoardHero,
		);
	} else if (
		attacker.cardId === CardIds.VanessaVancleef_BG24_708 ||
		attacker.cardId === CardIds.VanessaVancleef_BG24_708_G
	) {
		attackingBoard
			.filter((e) => isCorrectTribe(gameState.allCards.getCard(e.cardId).races, Race.PIRATE))
			.forEach((e) => {
				modifyStats(
					e,
					attacker.cardId === CardIds.VanessaVancleef_BG24_708_G ? 4 : 2,
					attacker.cardId === CardIds.VanessaVancleef_BG24_708_G ? 4 : 2,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
				gameState.spectator.registerPowerTarget(
					attacker,
					e,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
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
				const isSameSide = entity.friendly === attacker.friendly;
				const board = isSameSide ? attackingBoard : defendingBoard;
				const hero = isSameSide ? attackingBoardHero : defendingBoardHero;
				dealDamageToMinion(
					entity,
					board,
					hero,
					attacker,
					1,
					isSameSide ? defendingBoard : attackingBoard,
					isSameSide ? defendingBoardHero : attackingBoardHero,
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
					defendingBoardHero,
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
	// Only once per minion
	if (!!eclipsion && attacker.immuneWhenAttackCharges == null) {
		attacker.immuneWhenAttackCharges = 1;
		// If we have 2 eclipsions, the first minion that attacks eats both charges
		attackingBoard
			.filter((e) =>
				[
					CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy,
					CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy_G,
				].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				e.abiityChargesLeft--;
			});
	}
};
