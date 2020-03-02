export interface BoardEntity {
	entityId: number;
	cardId: string;
	attack: number;
	health: number;
	taunt: boolean;
	divineShield: boolean;
	// Because Lich King can give Reborn to a non-reborn minion
	reborn: boolean;
	cleave: boolean;
	enchantments: readonly { cardId: string; originEntityId: number }[];
	attacksPerformed: number;
}
