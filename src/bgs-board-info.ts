import { BgsPlayerEntity } from './bgs-player-entity';
import { BoardEntity } from './board-entity';
import { BoardSecret } from './board-secret';

export interface BgsBoardInfo {
	readonly player: BgsPlayerEntity;
	readonly board: BoardEntity[];
	readonly secrets?: BoardSecret[];
}
