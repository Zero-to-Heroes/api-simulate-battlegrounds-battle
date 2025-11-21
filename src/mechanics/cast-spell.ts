import { CastSpellInput, hasCastSpell } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';

export const castSpell = (spellCardId: string, input: CastSpellInput) => {
	const spellImpl = cardMappings[spellCardId];
	if (hasCastSpell(spellImpl)) {
		spellImpl.castSpell(spellCardId, input);
	}

	// Added in case other minions react to spells being cast
	// I thought Charging Czarina would be in that case, but it specifically says "whenever *you* cast"
};
