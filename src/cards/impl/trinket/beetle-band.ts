import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { AvengeInput } from '../../../simulation/avenge';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const BeetleBand: AvengeCard = {
	cardIds: [TempCardIds.BeetleBand, TempCardIds.BeetleBand_Greater],
	baseAvengeValue: (cardId: string) => (cardId === TempCardIds.BeetleBand ? 5 : 6),
	avenge: (trinket: BoardEntity, input: AvengeInput): readonly BoardEntity[] => {
		const number = trinket.cardId === TempCardIds.BeetleBand ? 1 : 2;
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
		});
		return spawns;
	},
};
