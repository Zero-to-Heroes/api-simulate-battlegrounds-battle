import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const LokholarFrostforgeer: EndOfTurnCard = {
	cardIds: [TempCardIds.LokholarFrostforgeer, TempCardIds.LokholarFrostforgeer_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.LokholarFrostforgeer_G ? 1 : 2;
		for (let i = 0; i < mult; i++) {
			const targets = input.board.filter((e) => e.entityId !== minion.entityId);
			for (const target of targets) {
				modifyStats(target, minion, 2, 2, input.board, input.hero, input.gameState);
			}
		}
	},
};
