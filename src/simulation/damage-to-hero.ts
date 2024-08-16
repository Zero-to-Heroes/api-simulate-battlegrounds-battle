import { BgsPlayerEntity } from 'src/bgs-player-entity';
import { BoardEntity } from 'src/board-entity';
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
