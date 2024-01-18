/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { addCardsInHand, updateDivineShield } from '../utils';
import { FullGameState } from './internal-game-state';

export const applyFrenzy = (
	entityWithFrenzy: BoardEntity,
	entityWithFrenzyBoard: BoardEntity[],
	entityWithFrenzyBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (
		entityWithFrenzy.cardId === CardIds.BristlebackKnight_BG20_204 ||
		entityWithFrenzy.cardId === CardIds.BristlebackKnight_BG20_204_G
	) {
		if (!entityWithFrenzy.divineShield) {
			updateDivineShield(entityWithFrenzy, entityWithFrenzyBoard, true, gameState.allCards);
		}
	} else if (
		entityWithFrenzy.cardId === CardIds.Roadboar_BG20_101 ||
		entityWithFrenzy.cardId === CardIds.Roadboar_BG20_101_G
	) {
		const cardsToAdd = Array(entityWithFrenzy.cardId === CardIds.Roadboar_BG20_101_G ? 2 : 1).fill(
			CardIds.BloodGem,
		);
		addCardsInHand(entityWithFrenzyBoardHero, entityWithFrenzyBoard, cardsToAdd, gameState);
	}
};
