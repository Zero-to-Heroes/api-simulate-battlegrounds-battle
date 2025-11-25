import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const BloodGemBarrage: TavernSpellCard = {
	cardIds: [TempCardIds.BloodGemBarrage],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		// Do nothing in combat
	},
};
