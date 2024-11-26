import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnWindfuryUpdated } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { FullGameState } from '../simulation/internal-game-state';

export const updateWindfury = (
	entity: BoardEntity,
	newValue: boolean,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const previousValue = entity.windfury;
	entity.windfury = newValue;

	for (const boardEntity of board) {
		const onWindfuryUpdatedImpl = cardMappings[boardEntity.cardId];
		if (hasOnWindfuryUpdated(onWindfuryUpdatedImpl)) {
			onWindfuryUpdatedImpl.onWindfuryUpdated(boardEntity, entity, previousValue, {
				board: board,
				hero: hero,
				otherHero: otherHero,
				gameState: gameState,
			});
		}
	}
};

export interface OnWindfuryUpdatedInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}
