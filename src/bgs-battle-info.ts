import { Race } from '@firestone-hs/reference-data';
import { BgsBattleOptions } from './bgs-battle-options';
import { BgsBoardInfo } from './bgs-board-info';

/** Entity reference for debug state (entityId, or cardId+attack+health for spawned minions). */
export interface BgsDebugStateEntity {
	readonly entityId?: number;
	readonly cardId?: string;
	readonly attack?: number;
	readonly health?: number;
}

/** Debug state for bug reproduction: forces attack order and random effects from the real game. */
export interface BgsDebugState {
	readonly forcedCurrentAttacker: number;
	readonly forcedFaceOffBase: Array<{
		readonly attacker: BgsDebugStateEntity;
		readonly defender: BgsDebugStateEntity;
	}>;
	/** Forced random picks keyed by source entity (e.g. Warghoul) -> target (e.g. neighbour). */
	readonly forcedRandomPicks?: readonly { source: BgsDebugStateEntity; target: BgsDebugStateEntity }[];
	/** @deprecated Use forcedRandomPicks. Kept for backward compat with old bug reports. */
	readonly forcedTimewarpedWarghoulTargets?: readonly BgsDebugStateEntity[];
}

export interface BgsBattleInfo {
	readonly playerBoard: BgsBoardInfo;
	readonly playerTeammateBoard?: BgsBoardInfo;
	readonly opponentBoard: BgsBoardInfo;
	readonly opponentTeammateBoard?: BgsBoardInfo;
	readonly options: BgsBattleOptions;
	readonly gameState: BgsGameState;
	readonly heroHasDied?: boolean;
	/** When present, simulator uses this to force attack sequence (e.g. from bug report). */
	readonly debugState?: BgsDebugState;
}

export interface BgsGameState {
	readonly currentTurn: number;
	readonly validTribes?: readonly Race[];
	readonly anomalies?: readonly string[];
}
