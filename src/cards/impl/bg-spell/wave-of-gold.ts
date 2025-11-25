import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard, isGolden } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const WaveOfGold: TavernSpellCard = {
	cardIds: [TempCardIds.WaveOfGold],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		addStatsToBoard(input.source, input.board, input.hero, 3, 2, input.gameState);
		const goldenMinions = input.board.filter((e) => isGolden(e.cardId, input.gameState.allCards));
		for (const target of goldenMinions) {
			modifyStats(target, input.source, 3, 2, input.board, input.hero, input.gameState);
		}
	},
};
