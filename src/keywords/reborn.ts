import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnRebornUpdated } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { FullGameState } from '../simulation/internal-game-state';

export const updateReborn = (
	entity: BoardEntity,
	newValue: boolean,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const previousValue = entity.reborn;
	entity.reborn = newValue;

	for (const boardEntity of board) {
		const onRebornUpdatedImpl = cardMappings[boardEntity.cardId];
		if (hasOnRebornUpdated(onRebornUpdatedImpl)) {
			onRebornUpdatedImpl.onRebornUpdated(boardEntity, entity, previousValue, {
				board: board,
				hero: hero,
				otherHero: otherHero,
				gameState: gameState,
			});
		}
	}
};

export interface OnRebornUpdatedInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}
