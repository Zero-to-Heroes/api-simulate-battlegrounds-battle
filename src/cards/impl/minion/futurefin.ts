import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Futurefin: EndOfTurnCard = {
	cardIds: [TempCardIds.Futurefin, TempCardIds.Futurefin_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.Futurefin_G ? 2 : 1;
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
