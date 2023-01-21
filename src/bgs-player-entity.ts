export interface BgsPlayerEntity {
	readonly cardId: string;
	readonly nonGhostCardId?: string;
	readonly hpLeft: number;
	readonly tavernTier: number;
	readonly heroPowerId?: string | undefined | null;
	readonly heroPowerUsed: boolean;
	readonly heroPowerInfo?: number;
	entityId?: number;
	questRewards?: readonly string[];
	cardsInHand?: number;
	avengeCurrent?: number;
	avengeDefault?: number;
	globalInfo?: BgsPlayerGlobalInfo;

	deadEyeDamageDone?: number;
}

export interface BgsPlayerGlobalInfo {
	EternalKnightsDeadThisGame: number;
	UndeadAttackBonus: number;
}
