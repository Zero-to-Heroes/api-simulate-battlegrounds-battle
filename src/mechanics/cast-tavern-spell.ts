import {
	CastSpellInput,
	hasAfterTavernSpellCast,
	hasCastTavernSpell,
	hasOnTavernSpellCast,
} from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';

export const castTavernSpell = (spellCardId: string, input: CastSpellInput) => {
	const spellImpl = cardMappings[spellCardId];
	if (hasCastTavernSpell(spellImpl)) {
		spellImpl.castTavernSpell(spellCardId, input);
	}

	input.hero.globalInfo.SpellsCastThisGame++;

	onTavernSpellCast(spellCardId, input);
};

export const onTavernSpellCast = (spellCardId: string, input: CastSpellInput) => {
	// Added in case other minions react to spells being cast
	// I thought Charging Czarina would be in that case, but it specifically says "whenever *you* cast"
	// 2025-11-25: cards that simply says "cast" means "you cast". Otherwise, it will say "this casts".
	if (input.source === input.hero) {
		for (const boardEntity of input.board) {
			const onSpellCastImpl = cardMappings[boardEntity.cardId];
			if (hasOnTavernSpellCast(onSpellCastImpl)) {
				onSpellCastImpl.onTavernSpellCast(boardEntity, input);
			}
		}
	}

	// Not sure about the timing of "after spell cast", but at least make sure they trigger after the "whenever you cast" effects
	if (input.source === input.hero) {
		for (const boardEntity of input.board) {
			const afterSpellCastImpl = cardMappings[boardEntity.cardId];
			if (hasAfterTavernSpellCast(afterSpellCastImpl)) {
				afterSpellCastImpl.afterTavernSpellCast(boardEntity, input);
			}
		}
	}
};
