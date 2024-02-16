import { GameAction } from './game-action';

export interface GameSample {
	readonly actions: readonly GameAction[];
	readonly playerCardId: string;
	readonly playerHeroPowerCardId: string;
	readonly playerHeroPowerUsed: boolean;
	readonly playerRewardCardId: string;
	readonly playerRewardData: number;
	readonly opponentCardId: string;
	readonly opponentHeroPowerCardId: string;
	readonly opponentHeroPowerUsed: boolean;
	readonly opponentRewardCardId: string;
	readonly opponentRewardData: number;
}
