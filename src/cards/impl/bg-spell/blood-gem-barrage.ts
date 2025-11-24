import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const BloodGemBarrage: SpellCard = {
	cardIds: [TempCardIds.BloodGemBarrage],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		// Do nothing in combat
	},
};
