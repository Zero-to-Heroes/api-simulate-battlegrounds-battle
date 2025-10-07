import { BoardEntity } from '../../board-entity';

export const canAttack = (entity: BoardEntity): boolean => {
	// Lock and Load can cause a 0-attack entity to attack
	return (entity.attack > 0 || entity.attackImmediately) && !entity.cantAttack;
};
