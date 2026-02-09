import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { AvengeCard } from '../../card.interface';

export const EternalTycoon: AvengeCard = {
	cardIds: [CardIds.EternalTycoon_BG34_403, CardIds.EternalTycoon_BG34_403_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const cardId =
			minion.cardId === CardIds.EternalTycoon_BG34_403_G
				? CardIds.EternalKnight_BG25_008_G
				: CardIds.EternalKnight_BG25_008;
		const spawns = spawnEntities(
			cardId,
			1,
			input.board,
			input.hero,
			input.otherBoard,
			input.otherHero,
			input.gameState,
			input.deadEntity.friendly,
		);
		spawns.forEach((e) => {
			e.attackImmediately = true;
		});
		return spawns;
	},
};
