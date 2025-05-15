import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { AvengeInput } from '../../../simulation/avenge';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { AvengeCard } from '../../card.interface';

export const BeetleBand: AvengeCard = {
	cardIds: [CardIds.BeetleBand_BG32_MagicItem_860, CardIds.BeetleBand_BeetleBandToken_BG32_MagicItem_860t],
	baseAvengeValue: (cardId: string) => (cardId === CardIds.BeetleBand_BG32_MagicItem_860 ? 5 : 6),
	avenge: (trinket: BoardEntity, input: AvengeInput): readonly BoardEntity[] => {
		const number = trinket.cardId === CardIds.BeetleBand_BG32_MagicItem_860 ? 1 : 2;
		const spawns = spawnEntities(
			CardIds.BoonOfBeetles_BeetleToken_BG28_603t,
			number,
			input.board,
			input.hero,
			input.otherBoard,
			input.otherHero,
			input.gameState,
			input.hero.friendly,
			false,
		);
		spawns.forEach((spawn) => {
			updateTaunt(spawn, true, input.board, input.hero, input.otherHero, input.gameState);
			spawn.spawnIndexFromRight = 0;
		});

		// Because they spawn to the right, we handle them here instead of higher up
		// performEntitySpawns(
		// 	spawns,
		// 	input.board,
		// 	input.hero,
		// 	trinket,
		// 	0,
		// 	input.otherBoard,
		// 	input.otherHero,
		// 	input.gameState,
		// );
		return spawns;
	},
};
