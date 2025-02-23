import { CardIds, CardType, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnDivineShieldUpdated } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { pickRandom } from '../services/utils';
import { addCardsInHand } from '../simulation/cards-in-hand';
import { FullGameState } from '../simulation/internal-game-state';
import { modifyStats } from '../simulation/stats';
import { grantRandomStats, hasCorrectTribe } from '../utils';

export const updateDivineShield = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	newValue: boolean,
	gameState: FullGameState,
): void => {
	// if ((entity.divineShield ?? false) === newValue) {
	// 	return;
	// }
	entity.hadDivineShield = newValue || entity.divineShield || entity.hadDivineShield;
	entity.divineShield = newValue;
	if (entity.divineShield) {
		const boardForDrake = board;
		const statsBonus =
			6 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043).length +
			12 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043_G).length;
		// Don't trigger all "on attack changed" effects, since it's an aura
		entity.attack += statsBonus;
	} else {
		// Also consider itself
		const boardForDrake = board;
		const statsBonus =
			6 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043).length +
			12 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043_G).length;
		entity.attack -= statsBonus;
	}

	// Lost divine shield
	if (entity.hadDivineShield && !entity.divineShield) {
		const adapter = hero.trinkets
			.filter((t) => t.cardId === CardIds.MechagonAdapter_BG30_MagicItem_910)
			.filter((t) => t.scriptDataNum1 > 0)[0];
		if (!!adapter && hasCorrectTribe(entity, hero, Race.MECH, gameState.anomalies, gameState.allCards)) {
			updateDivineShield(entity, board, hero, otherHero, true, gameState);
			adapter.scriptDataNum1--;
		}

		for (const boardEntity of board) {
			const onDivineShieldUpdatedImpl = cardMappings[boardEntity.cardId];
			if (hasOnDivineShieldUpdated(onDivineShieldUpdatedImpl)) {
				onDivineShieldUpdatedImpl.onDivineShieldUpdated(boardEntity, {
					board: board,
					hero: hero,
					otherHero: otherHero,
					gameState: gameState,
					target: entity,
					previousValue: entity.hadDivineShield,
				});
			}
		}

		for (let i = 0; i < board.length; i++) {
			if (board[i].cardId === CardIds.BolvarFireblood_ICC_858) {
				modifyStats(board[i], 2, 0, board, hero, gameState);
				gameState.spectator.registerPowerTarget(board[i], board[i], board, hero, otherHero);
			} else if (board[i].cardId === CardIds.BolvarFireblood_TB_BaconUps_047) {
				modifyStats(board[i], 4, 0, board, hero, gameState);
				gameState.spectator.registerPowerTarget(board[i], board[i], board, hero, otherHero);
			} else if (board[i].cardId === CardIds.DrakonidEnforcer_BGS_067) {
				modifyStats(board[i], 2, 2, board, hero, gameState);
				gameState.spectator.registerPowerTarget(board[i], board[i], board, hero, otherHero);
			} else if (board[i].cardId === CardIds.DrakonidEnforcer_TB_BaconUps_117) {
				modifyStats(board[i], 4, 4, board, hero, gameState);
				gameState.spectator.registerPowerTarget(board[i], board[i], board, hero, otherHero);
			} else if (
				board[i].entityId !== entity.entityId &&
				(board[i].cardId === CardIds.HolyMecherel_BG20_401 ||
					board[i].cardId === CardIds.HolyMecherel_BG20_401_G)
			) {
				updateDivineShield(board[i], board, hero, otherHero, true, gameState);
			} else if (board[i].cardId === CardIds.Gemsplitter_BG21_037) {
				addCardsInHand(hero, board, [CardIds.BloodGem], gameState);
			} else if (board[i].cardId === CardIds.Gemsplitter_BG21_037_G) {
				addCardsInHand(hero, board, [CardIds.BloodGem, CardIds.BloodGem], gameState);
			} else if (
				board[i].cardId === CardIds.CogworkCopter_BG24_008 ||
				board[i].cardId === CardIds.CogworkCopter_BG24_008_G
			) {
				// When it's the opponent, the game state already contains all the buffs
				if (board[i]?.friendly) {
					const buff = board[i].cardId === CardIds.CogworkCopter_BG24_008_G ? 2 : 1;
					grantRandomStats(
						board[i],
						hero.hand.filter(
							(e) =>
								gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
						),
						hero,
						buff,
						buff,
						null,
						true,
						gameState,
					);
				}
			}
		}
	}
};

export const grantRandomDivineShield = (
	source: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const elligibleEntities = board
		.filter((entity) => !entity.divineShield)
		.filter((entity) => entity.health > 0 && !entity.definitelyDead);
	if (elligibleEntities.length > 0) {
		const chosen = pickRandom(elligibleEntities);
		updateDivineShield(chosen, board, hero, otherHero, true, gameState);
		gameState.spectator.registerPowerTarget(source, chosen, board, null, null);
	}
};

export const grantDivineShieldToLeftmostMinions = (
	source: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	quantity: number,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	for (let i = 0; i < Math.min(quantity, board.length); i++) {
		updateDivineShield(board[i], board, hero, otherHero, true, gameState);
		gameState.spectator.registerPowerTarget(source, board[i], board, null, null);
	}
};

export interface OnDivineShieldUpdatedInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
	target: BoardEntity;
	previousValue: boolean;
}
