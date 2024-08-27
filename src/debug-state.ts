import { BoardEntity } from './board-entity';

export const debugState = {
	active: false,
	forcedCurrentAttacker: null as number | null,
	forcedFaceOff: [
		{ attacker: { entityId: 7605 }, defender: { entityId: 9919 } },
		{ attacker: { entityId: 9914 }, defender: { entityId: 7607 } },
		{ attacker: { entityId: 7607 }, defender: { entityId: 9922 } },
		{ attacker: { entityId: 9916 }, defender: { entityId: 7617 } },
		{ attacker: { attack: 20, hp: 13 }, defender: { entityId: 9922 } },
		{ attacker: { entityId: 9917 }, defender: { entityId: 7618 } },
		{ attacker: { attack: 22, hp: 14 }, defender: { entityId: 9922 } },
		{ attacker: { attack: 26, hp: 17 }, defender: { entityId: 7619 } },
		{ attacker: { entityId: 8795 }, defender: { entityId: 9926 } },
		{ attacker: { attack: 48, hp: 35 }, defender: { entityId: 7625 } },
		{ attacker: { entityId: 8795 }, defender: { entityId: 9927 } },
		{ attacker: { attack: 48, hp: 28 }, defender: { entityId: 8795 } },
		{ attacker: { attack: 35, hp: 35 }, defender: { attack: 48, hp: 12 } },
	],
	isCorrectEntity: (proposedEntity: ForcedFaceOffEntity, actualEntity: BoardEntity): boolean => {
		if (proposedEntity.entityId) {
			return proposedEntity.entityId === actualEntity.entityId;
		}
		return proposedEntity.attack === actualEntity.attack && proposedEntity.health === actualEntity.health;
	},
};

export interface ForcedFaceOffEntity {
	entityId?: number;
	attack?: number;
	health?: number;
}
