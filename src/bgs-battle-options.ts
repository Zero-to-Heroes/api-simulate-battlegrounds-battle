import { Race } from '@firestone-hs/reference-data';

export interface BgsBattleOptions {
	readonly numberOfSimulations: number;
	readonly maxAcceptableDuration?: number;
	readonly intermediateResults?: number;
	/** @deprecated */
	readonly validTribes?: readonly Race[];
	readonly skipInfoLogs: boolean;
}
