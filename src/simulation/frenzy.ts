/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const applyFrenzy = (
	entityWithFrenzy: BoardEntity,
	entityWithFrenzyBoard: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (
		entityWithFrenzy.cardId === CardIds.NonCollectible.Neutral.BristlebackKnight ||
		entityWithFrenzy.cardId === CardIds.NonCollectible.Neutral.BristlebackKnightBattlegrounds
	) {
		entityWithFrenzy.divineShield = true;
	}
};
