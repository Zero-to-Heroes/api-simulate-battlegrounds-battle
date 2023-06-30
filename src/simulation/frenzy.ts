/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { addCardsInHand, updateDivineShield } from '../utils';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const applyFrenzy = (
	entityWithFrenzy: BoardEntity,
	entityWithFrenzyBoard: BoardEntity[],
	entityWithFrenzyBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (
		entityWithFrenzy.cardId === CardIds.BristlebackKnight ||
		entityWithFrenzy.cardId === CardIds.BristlebackKnightBattlegrounds
	) {
		if (!entityWithFrenzy.divineShield) {
			updateDivineShield(entityWithFrenzy, entityWithFrenzyBoard, true, allCards);
		}
	} else if (
		entityWithFrenzy.cardId === CardIds.Roadboar_BG20_101 ||
		entityWithFrenzy.cardId === CardIds.Roadboar_BG20_101_G
	) {
		const cardsToAdd = Array(entityWithFrenzy.cardId === CardIds.Roadboar_BG20_101_G ? 2 : 1).fill(
			CardIds.BloodGem,
		);
		addCardsInHand(entityWithFrenzyBoardHero, entityWithFrenzyBoard, allCards, spectator, cardsToAdd);
	}
};
