import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasAfterHeroDamaged } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { FullGameState } from './internal-game-state';

export const dealDamageToHero = (
	source: BoardEntity,
	hero: BgsPlayerEntity,
	board: BoardEntity[],
	damage: number,
	gameState: FullGameState,
) => {
	for (const entity of board) {
		const afterHeroDamagedImpl = cardMappings[entity.cardId];
		if (hasAfterHeroDamaged(afterHeroDamagedImpl)) {
			afterHeroDamagedImpl.afterHeroDamaged(entity, {
				damage: damage,
				board: board,
				hero: hero,
				gameState,
			});
		}
	}
};

export interface AfterHeroDamagedInput {
	damage: number;
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	gameState: FullGameState;
}
