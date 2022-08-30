export interface BgsPlayerEntity {
	readonly cardId: string;
	readonly nonGhostCardId?: string;
	readonly hpLeft: number;
	readonly tavernTier: number;
	readonly heroPowerId: string;
	readonly heroPowerUsed: boolean;
	readonly questReward?: string;
	readonly heroPowerInfo?: number;
	readonly entityId?: number;
	cardsInHand?: number;
	avengeCurrent?: number;
	avengeDefault?: number;

	deadEyeDamageDone?: number;
}
