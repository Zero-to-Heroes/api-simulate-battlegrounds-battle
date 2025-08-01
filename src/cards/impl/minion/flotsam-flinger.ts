import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const FlotsamFlinger: EndOfTurnCard = {
	cardIds: [CardIds.FlotsamFlinger_BG33_892, CardIds.FlotsamFlinger_BG33_892_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.FlotsamFlinger_BG33_892_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const targets = input.board.filter((e) => e.tavernTier <= 3);
			for (const target of targets) {
				triggerBattlecry(input.board, input.hero, target, input.board, input.hero, input.gameState);
			}
		}
	},
};
