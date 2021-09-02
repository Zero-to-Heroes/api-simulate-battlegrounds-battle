import { BgsBattleOptions } from './bgs-battle-options';
import { BgsBoardInfo } from './bgs-board-info';

export interface BgsBattleInfo {
	readonly playerBoard: BgsBoardInfo;
	readonly opponentBoard: BgsBoardInfo;
	readonly options: BgsBattleOptions;
	readonly heroHasDied?: boolean;
}
