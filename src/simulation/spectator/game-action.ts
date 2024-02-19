import { BoardEntity } from '../../board-entity';
import { BoardSecret } from '../../board-secret';

export interface GameAction {
	type:
		| 'damage'
		| 'attack'
		| 'spawn'
		| 'minion-death'
		| 'power-target'
		| 'start-of-combat'
		| 'player-attack'
		| 'opponent-attack';
	playerBoard: readonly BoardEntity[];
	playerHand: readonly BoardEntity[];
	playerSecrets: readonly BoardSecret[];
	opponentBoard: readonly BoardEntity[];
	opponentHand: readonly BoardEntity[];
	opponentSecrets: readonly BoardSecret[];
	playerRewardCardId: string;
	playerRewardData: number;
	opponentRewardCardId: string;
	opponentRewardData: number;
	sourceEntityId?: number;
	/** @deprecated */
	targetEntityId?: number;
	targetEntityIds?: number[];

	damages?: Damage[];
	spawns?: readonly BoardEntity[];
	deaths?: readonly BoardEntity[];
	deadMinionsPositionsOnBoard?: readonly number[];
}

export interface Damage {
	readonly sourceEntityId?: number;
	readonly targetEntityId?: number;
	readonly damage?: number;
}
