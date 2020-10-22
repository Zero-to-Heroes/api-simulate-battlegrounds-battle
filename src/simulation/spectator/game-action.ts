import { BoardEntity } from '../../board-entity';

export interface GameAction {
	type: 'damage' | 'attack' | 'spawn' | 'minion-death' | 'power-target';
	playerBoard: readonly BoardEntity[];
	opponentBoard: readonly BoardEntity[];
	sourceEntityId?: number;
	targetEntityId?: number;

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
