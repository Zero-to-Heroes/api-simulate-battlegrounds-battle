import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnTauntUpdated } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { FullGameState } from '../simulation/internal-game-state';

export const updateTaunt = (
	entity: BoardEntity,
	newValue: boolean,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const previousValue = entity.taunt;
	entity.taunt = newValue;

	for (const boardEntity of board) {
		const onTauntUpdatedImpl = cardMappings[boardEntity.cardId];
		if (hasOnTauntUpdated(onTauntUpdatedImpl)) {
			onTauntUpdatedImpl.onTauntUpdated(boardEntity, entity, previousValue, {
				board: board,
				hero: hero,
				otherHero: otherHero,
				gameState: gameState,
			});
		}
	}
};

export interface OnTauntUpdatedInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}
