import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard, getMinionsOfDifferentTypes } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const MenagerieTableware: TavernSpellCard = {
	cardIds: [CardIds.MenagerieTableware_BG34_272],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const numberOfDifferentTypes = getMinionsOfDifferentTypes(input.board, input.hero, input.gameState).length;
		for (let i = 0; i < numberOfDifferentTypes + 1; i++) {
			addStatsToBoard(input.source, input.board, input.hero, 3, 3, input.gameState);
		}
	},
};
