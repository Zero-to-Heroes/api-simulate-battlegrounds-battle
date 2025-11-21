import { CardIds } from '../../../services/card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const Meditation: SpellCard = {
	cardIds: [
		CardIds.TranquilMeditative_MeditationToken_BG32_835t,
		CardIds.TranquilMeditative_MeditationToken_BG32_835_Gt,
	],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.TranquilMeditative_MeditationToken_BG32_835t ? 1 : 2;
		input.hero.globalInfo.TavernSpellHealthBuff += 1 * mult;
		input.hero.globalInfo.TavernSpellAttackBuff += 1 * mult;
	},
};
