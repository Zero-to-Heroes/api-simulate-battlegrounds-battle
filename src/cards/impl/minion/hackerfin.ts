import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard } from '../../card.interface';
import { hasKeyword, validBonusKeywords } from '../../cards-data';

export const Hackerfin: BattlecryCard = {
	cardIds: [CardIds.Hackerfin_BG31_148, CardIds.Hackerfin_BG31_148_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		for (const entity of input.board) {
			const mult = minion.cardId === CardIds.Hackerfin_BG31_148_G ? 2 : 1;
			let totalKeywords = 0;
			for (const bonusKeyword of validBonusKeywords) {
				if (hasKeyword(entity, bonusKeyword)) {
					totalKeywords++;
				}
			}
			modifyStats(
				minion,
				totalKeywords * mult * 2,
				totalKeywords * mult * 2,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
