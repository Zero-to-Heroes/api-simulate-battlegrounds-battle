import { BoardEntity } from './board-entity';

export const debugState = {
	active: false,
	forcedCurrentAttacker: null as number | null,
	forcedFaceOff: [] as { attacker: ForcedFaceOffEntity; defender: ForcedFaceOffEntity }[],
	forcedFaceOffBase: [] as { attacker: ForcedFaceOffEntity; defender: ForcedFaceOffEntity }[],
	/** Forced random picks: source -> target. Matched by source entity (like face-offs match by attacker). */
	forcedRandomPicks: [] as { source: ForcedFaceOffEntity; target: ForcedFaceOffEntity }[],
	isCorrectEntity: (proposedEntity: ForcedFaceOffEntity, actualEntity: BoardEntity): boolean => {
		if (proposedEntity.entityId) {
			return proposedEntity.entityId === actualEntity.entityId;
		} else if (proposedEntity.cardId) {
			return proposedEntity.cardId === actualEntity.cardId;
		}

		return proposedEntity.attack === actualEntity.attack && proposedEntity.health === actualEntity.health;
	},
	forcedRandomPicksBase: [] as { source: ForcedFaceOffEntity; target: ForcedFaceOffEntity }[],
	onBattleStart: () => {
		debugState.forcedFaceOff = [...debugState.forcedFaceOffBase];
		debugState.forcedRandomPicks = [...debugState.forcedRandomPicksBase];
	},
};

export interface ForcedFaceOffEntity {
	entityId?: number;
	cardId?: string;
	attack?: number;
	health?: number;
}
