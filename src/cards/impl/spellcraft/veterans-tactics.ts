import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';
import { hasKeyword, validBonusKeywords } from '../../cards-data';

export const VeteransTactics: TavernSpellCard = {
	cardIds: [
		CardIds.AzsharanVeteran_VeteransTacticsToken_BG34_407t,
		CardIds.AzsharanVeteran_VeteransTacticsToken_BG34_407_Gt,
	],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		let totalKeywords = 0;
		for (const bonusKeyword of validBonusKeywords) {
			if (input.board.some((e) => hasKeyword(e, bonusKeyword))) {
				totalKeywords++;
			}
		}
		const loops = totalKeywords;
		const mult = spellCardId === CardIds.AzsharanVeteran_VeteransTacticsToken_BG34_407_Gt ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			addStatsToBoard(input.source, input.board, input.hero, 2 * mult, 1 * mult, input.gameState);
		}
	},
};
