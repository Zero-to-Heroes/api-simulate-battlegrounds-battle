export interface BoardEntity {
	entityId: number;
	cardId: string;
	attack: number;
	health: number;

	maxHealth?: number;
	avengeCurrent?: number;
	avengeDefault?: number;
	frenzyApplied?: boolean;
	definitelyDead?: boolean;
	taunt?: boolean;
	divineShield?: boolean;
	poisonous?: boolean;
	reborn?: boolean;
	cleave?: boolean;
	windfury?: boolean;
	megaWindfury?: boolean;
	stealth?: boolean;
	enchantments?: { cardId: string; originEntityId?: number; timing: number; repeats?: number }[];
	// We only store the card id, because we want all the attack and other data to be computed at runtime, based on the
	// current stats of the Fish
	rememberedDeathrattles?: { cardId: string; timing: number; repeats: number }[];

	friendly?: boolean;
	cantAttack?: boolean;
	attacksPerformed?: number;
	immuneWhenAttackCharges?: number;
	attackImmediately?: boolean;
	// Used only to handle murkeye aura?
	previousAttack?: number;
	lastAffectedByEntity?: BoardEntity;
	attacking?: boolean;
}
