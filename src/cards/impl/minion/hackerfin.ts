import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addStatsToBoard } from '../../../utils';
import { BattlecryCard } from '../../card.interface';
import { hasKeyword, validBonusKeywords } from '../../cards-data';

const baseAttackBuff = 3;
const baseHealthBuff = 3;

export const Hackerfin: BattlecryCard = {
	cardIds: [CardIds.Hackerfin_BG31_148, CardIds.Hackerfin_BG31_148_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.Hackerfin_BG31_148_G ? 2 : 1;
		let totalWarbandKeywords = 0;
		const keywordsToAttribute = [...validBonusKeywords];
		for (const entity of input.board) {
			for (const bonusKeyword of keywordsToAttribute) {
				if (hasKeyword(entity, bonusKeyword)) {
					totalWarbandKeywords++;
					keywordsToAttribute.splice(keywordsToAttribute.indexOf(bonusKeyword), 1);
				}
			}
		}
		const baseBuff = 1 + totalWarbandKeywords;
		addStatsToBoard(
			minion,
			input.board,
			input.hero,
			baseBuff * mult,
			baseBuff * mult,
			input.gameState,
			Race[Race.MURLOC],
		);
		return true;
	},
};
