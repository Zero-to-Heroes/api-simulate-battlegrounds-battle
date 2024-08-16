import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from './internal-game-state';

export const dealDamageToHero = (
	source: BoardEntity,
	hero: BgsPlayerEntity,
	board: BoardEntity[],
	damage: number,
	gameState: FullGameState,
) => {
	hero.hpLeft = hero.hpLeft - damage;
};
