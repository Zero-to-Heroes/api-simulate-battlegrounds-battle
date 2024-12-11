import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from './internal-game-state';

const REWIND_HERO_DAMAGE_CARDS = [
	CardIds.SoulRewinder_BG26_174,
	CardIds.SoulRewinder_BG26_174_G,
	CardIds.Archimonde_BG31_873,
	CardIds.Archimonde_BG31_873_G,
];

export const dealDamageToHero = (
	source: BoardEntity,
	hero: BgsPlayerEntity,
	board: BoardEntity[],
	damage: number,
	gameState: FullGameState,
) => {
	if (board.some((e) => REWIND_HERO_DAMAGE_CARDS.includes(e.cardId as CardIds))) {
		return;
	}
	hero.hpLeft = hero.hpLeft - damage;
};
