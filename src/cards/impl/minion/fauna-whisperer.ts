import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';
import { selectMinions } from '../hero-power/wax-warband';

export const FaunaWhisperer: EndOfTurnCard = {
	cardIds: [CardIds.FaunaWhisperer_BG32_837, CardIds.FaunaWhisperer_BG32_837_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const index = input.board.indexOf(minion);
		if (index === 0) {
			return;
		}

		let targets: readonly BoardEntity[] = [];
		if (minion.cardId === CardIds.FaunaWhisperer_BG32_837_G) {
			targets = getNeighbours(input.board, minion);
		} else {
			// Get minion to the left of it
			targets = [input.board[index - 1]];
		}

		for (const target of targets) {
			const targetRaces = (input.gameState.allCards.getCard(target.cardId).races ?? []).map((r) => Race[r]);
			const spellTargets = selectMinions(input.board, targetRaces, input.gameState.allCards);
			for (const spellTarget of spellTargets) {
				modifyStats(spellTarget, minion, 2, 2, input.board, input.hero, input.gameState);
			}
		}
	},
};
