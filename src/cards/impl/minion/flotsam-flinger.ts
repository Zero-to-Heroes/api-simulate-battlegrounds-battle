import { BoardEntity } from '../../../board-entity';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const FlotsamFlinger: EndOfTurnCard = {
	cardIds: [TempCardIds.FlotsamFlinger, TempCardIds.FlotsamFlinger_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.FlotsamFlinger_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const targets = input.board.filter((e) => e.tavernTier <= 3);
			for (const target of targets) {
				triggerBattlecry(input.board, input.hero, target, input.board, input.hero, input.gameState);
			}
		}
	},
};
