import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const LokholarFrostforgeer: EndOfTurnCard = {
	cardIds: [CardIds.LokholarFrostforger_BG32_844, CardIds.LokholarFrostforger_BG32_844_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.LokholarFrostforger_BG32_844_G ? 1 : 2;
		for (let i = 0; i < mult; i++) {
			const targets = input.board.filter((e) => e.entityId !== minion.entityId);
			for (const target of targets) {
				modifyStats(target, minion, 3, 2, input.board, input.hero, input.gameState);
			}
		}
	},
};
