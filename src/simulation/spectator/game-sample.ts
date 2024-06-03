import { GameAction } from './game-action';

export interface GameSample {
	readonly actions: readonly GameAction[];
	/*
	readonly playerCardId: string;
	readonly playerEntityId: number;
	readonly playerHeroPowerCardId: string;
	readonly playerHeroPowerUsed: boolean;
	readonly opponentCardId: string;
	readonly opponentEntityId: number;
	readonly opponentHeroPowerCardId: string;
	readonly opponentHeroPowerUsed: boolean;
	*/
}
