import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard, isGolden } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const WaveOfGold: SpellCard = {
	cardIds: [TempCardIds.WaveOfGold],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		addStatsToBoard(input.source, input.board, input.hero, 3, 2, input.gameState);
		const goldenMinions = input.board.filter((e) => isGolden(e.cardId, input.gameState.allCards)).length;
		for (let i = 0; i < goldenMinions; i++) {
			modifyStats(input.source, input.source, 3, 2, input.board, input.hero, input.gameState);
		}
	},
};
