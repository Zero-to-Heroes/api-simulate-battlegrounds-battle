import { AllCardsService, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export interface FullGameState {
	allCards: AllCardsService;
	cardsData: CardsData;
	spectator: Spectator;
	sharedState: SharedState;
	currentTurn: number;
	validTribes: readonly Race[];
	anomalies: readonly string[];
	gameState: GameState;
}

export interface GameState {
	player: PlayerState;
	opponent: PlayerState;
}

export interface PlayerState {
	board: BoardEntity[];
	player: BgsPlayerEntity;
}
