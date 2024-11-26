import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnStealthUpdated } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { FullGameState } from '../simulation/internal-game-state';

export const updateStealth = (
	entity: BoardEntity,
	newValue: boolean,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const previousValue = entity.stealth;
	entity.stealth = newValue;

	for (const boardEntity of board) {
		const onStealthUpdatedImpl = cardMappings[boardEntity.cardId];
		if (hasOnStealthUpdated(onStealthUpdatedImpl)) {
			onStealthUpdatedImpl.onStealthUpdated(boardEntity, entity, previousValue, {
				board: board,
				hero: hero,
				otherHero: otherHero,
				gameState: gameState,
			});
		}
	}
};

export interface OnStealthUpdatedInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}
