import { Race } from '@firestone-hs/reference-data';
import { BgsBattleOptions } from './bgs-battle-options';
import { BgsBoardInfo } from './bgs-board-info';

export interface BgsBattleInfo {
	readonly playerBoard: BgsBoardInfo;
	readonly opponentBoard: BgsBoardInfo;
	readonly options: BgsBattleOptions;
	readonly gameState: BgsGameState;
	readonly heroHasDied?: boolean;
}

export interface BgsGameState {
	readonly currentTurn: number;
	readonly validTribes?: readonly Race[];
	readonly anomalies?: readonly string[];
}
