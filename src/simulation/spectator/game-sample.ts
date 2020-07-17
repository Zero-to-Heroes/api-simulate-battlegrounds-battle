import { GameAction } from './game-action';

export interface GameSample {
	readonly actions: readonly GameAction[];
	readonly playerCardId: string;
	readonly playerHeroPowerCardId: string;
	readonly opponentCardId: string;
	readonly opponentHeroPowerCardId: string;
}
