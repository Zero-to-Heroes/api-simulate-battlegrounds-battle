import { BoardEntity } from './board-entity';

export const debugState = {
	active: false,
	forcedCurrentAttacker: null as number | null,
	forcedFaceOff: [] as { attacker: ForcedFaceOffEntity; defender: ForcedFaceOffEntity }[],
	forcedFaceOffBase: [] as { attacker: ForcedFaceOffEntity; defender: ForcedFaceOffEntity }[],
	// forcedRng: [] as { attacker: ForcedFaceOffEntity; defender: ForcedFaceOffEntity }[],
	// forcedRngBase: [] as { attacker: ForcedFaceOffEntity; defender: ForcedFaceOffEntity }[],
	isCorrectEntity: (proposedEntity: ForcedFaceOffEntity, actualEntity: BoardEntity): boolean => {
		if (proposedEntity.entityId) {
			return proposedEntity.entityId === actualEntity.entityId;
		}
		return proposedEntity.attack === actualEntity.attack && proposedEntity.health === actualEntity.health;
	},
	onBattleStart: () => {
		debugState.forcedFaceOff = [...debugState.forcedFaceOffBase];
		// debugState.forcedRng = [...debugState.forcedRngBase];
	},
};

export interface ForcedFaceOffEntity {
	entityId?: number;
	attack?: number;
	health?: number;
}
