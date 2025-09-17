import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const ShinyRing: SpellCard = {
	cardIds: [CardIds.ShinyRing_BG28_168],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const attack = 1 + input.hero.globalInfo.TavernSpellAttackBuff;
		const health = 1 + input.hero.globalInfo.TavernSpellHealthBuff;
		addStatsToBoard(input.source, input.board, input.hero, attack, health, input.gameState);
	},
};
