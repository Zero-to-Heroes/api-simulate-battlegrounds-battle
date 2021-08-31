/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { addCardsInHand } from './deathrattle-effects';
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
		entityWithFrenzy.cardId === CardIds.NonCollectible.Neutral.BristlebackKnight ||
		entityWithFrenzy.cardId === CardIds.NonCollectible.Neutral.BristlebackKnightBattlegrounds
	) {
		entityWithFrenzy.divineShield = true;
	} else if (
		entityWithFrenzy.cardId === CardIds.NonCollectible.Neutral.Roadboar ||
		entityWithFrenzy.cardId === CardIds.NonCollectible.Neutral.RoadboarBattlegrounds
	) {
		addCardsInHand(
			entityWithFrenzyBoardHero,
			entityWithFrenzy.cardId === CardIds.NonCollectible.Neutral.RoadboarBattlegrounds ? 2 : 1,
			entityWithFrenzyBoard,
			allCards,
		);
	}
};
