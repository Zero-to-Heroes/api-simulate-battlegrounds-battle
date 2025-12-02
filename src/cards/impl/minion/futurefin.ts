import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Futurefin: EndOfTurnCard = {
	cardIds: [CardIds.Futurefin_BG34_145, CardIds.Futurefin_BG34_145_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.Futurefin_BG34_145_G ? 2 : 1;
		const target = input.hero.hand.filter((e) => !!e.maxHealth && !!e.cardId)[0];
		if (!!target) {
			modifyStats(
				target,
				minion,
				minion.attack * mult,
				minion.health * mult,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
