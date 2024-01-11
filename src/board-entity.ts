export interface BoardEntity {
	entityId: number;
	cardId: string;
	attack: number;
	health: number;

	maxHealth?: number;
	avengeCurrent?: number;
	avengeDefault?: number;
	frenzyChargesLeft?: number;
	definitelyDead?: boolean;
	taunt?: boolean;
	divineShield?: boolean;
	poisonous?: boolean;
	venomous?: boolean;
	reborn?: boolean;
	cleave?: boolean;
	windfury?: boolean;
	stealth?: boolean;
	enchantments?: { cardId: string; originEntityId?: number; timing: number; repeats?: number; value?: number }[];
	scriptDataNum1?: number;
	// For Build-An-Undead
	additionalCards?: readonly string[] | null;

	// We only store the card id, because we want all the attack and other data to be computed at runtime, based on the
	// current stats of the Fish
	rememberedDeathrattles?: { cardId: string; timing: number; repeats: number }[];
	damageMultiplier?: number;
	locked?: boolean;
	friendly?: boolean;
	cantAttack?: boolean;
	attacksPerformed?: number;
	immuneWhenAttackCharges?: number;
	attackImmediately?: boolean;
	// Used only to handle murkeye aura?
	previousAttack?: number;
	lastAffectedByEntity?: BoardEntity;
	attacking?: boolean;
	// Did it have divine shield at least once? (for Sinrunner Blanchy)
	hadDivineShield?: boolean;
	abiityChargesLeft?: number;

	onCanceledSummon?: () => void;
}
