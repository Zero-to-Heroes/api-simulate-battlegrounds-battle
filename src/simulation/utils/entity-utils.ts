import { BoardEntity } from '../../board-entity';

export const canAttack = (entity: BoardEntity): boolean => {
	return entity.attack > 0 && !entity.cantAttack;
};
