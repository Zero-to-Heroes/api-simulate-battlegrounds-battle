import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const EscapeEruption: SpellCard = {
	cardIds: [
		CardIds.VolcanicVisitor_EscapeEruptionToken_BG30_117t,
		CardIds.VolcanicVisitor_EscapeEruptionToken_BG30_117_Gt,
	],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.VolcanicVisitor_EscapeEruptionToken_BG30_117t ? 1 : 2;
		let attackBuff = 0;
		let healthBuff = 0;
		if (Math.random() < 0.5) {
			attackBuff = 3 * mult;
		} else {
			healthBuff = 3 * mult;
		}
		addStatsToBoard(input.source, input.board, input.hero, attackBuff, healthBuff, input.gameState);
	},
};
