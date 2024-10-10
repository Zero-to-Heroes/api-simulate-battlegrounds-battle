import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';

export interface SoCInput {
	playerEntity: BgsPlayerEntity;
	playerBoard: BoardEntity[];
	opponentEntity: BgsPlayerEntity;
	opponentBoard: BoardEntity[];
	currentAttacker: number;
	playerBoardBefore?: BoardEntity[];
	opponentBoardBefore?: BoardEntity[];
	gameState: FullGameState;
	playerIsFriendly: boolean;
}
