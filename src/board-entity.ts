export interface BoardEntity {
	entityId: number;
	cardId: string;
	attack: number;
	health: number;

	taunt?: boolean;
	divineShield?: boolean;
	poisonous?: boolean;
	reborn?: boolean;
	cleave?: boolean;
	windfury?: boolean;
	megaWindfury?: boolean;
	enchantments?: { cardId: string; originEntityId: number }[];

	friendly?: boolean;
	cantAttack?: boolean;
	attacksPerformed?: number;
	attackImmediately?: boolean;
	previousAttack?: number;
	lastAffectedByEntity?: BoardEntity;
	attacking?: boolean;
}
