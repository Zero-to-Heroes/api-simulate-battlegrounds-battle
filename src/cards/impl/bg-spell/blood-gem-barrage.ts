import { CardIds } from '../../../services/card-ids';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const BloodGemBarrage: TavernSpellCard = {
	cardIds: [CardIds.BloodGemBarrage_BG34_689],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		// Do nothing in combat
	},
};
