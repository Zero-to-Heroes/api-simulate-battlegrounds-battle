export interface BgsPlayerEntity {
	readonly cardId: string;
	readonly nonGhostCardId?: string;
	readonly hpLeft: number;
	readonly tavernTier: number;
	readonly heroPowerId: string;
	readonly heroPowerUsed: boolean;
	readonly heroPowerInfo?: number;
	entityId?: number;
	questRewards?: readonly string[];
	cardsInHand?: number;
	avengeCurrent?: number;
	avengeDefault?: number;

	deadEyeDamageDone?: number;
}
