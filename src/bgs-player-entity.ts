export interface BgsPlayerEntity {
	readonly cardId: string;
	readonly nonGhostCardId?: string;
	readonly hpLeft: number;
	readonly tavernTier: number;
	readonly heroPowerId: string;
	readonly heroPowerUsed: boolean;
	cardsInHand: number;
}
