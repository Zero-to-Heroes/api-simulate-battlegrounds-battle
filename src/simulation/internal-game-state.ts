import { AllCardsService, Race } from '@firestone-hs/reference-data';
import { CardsData } from '../cards/cards-data';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export interface InternalGameState {
	allCards: AllCardsService;
	cardsData: CardsData;
	spectator: Spectator;
	sharedState: SharedState;
	currentTurn: number;
	validTribes: readonly Race[];
	anomalies: readonly string[];
}
