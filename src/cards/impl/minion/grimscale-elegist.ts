import { CardIds, CardType } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const GrimscaleElegist: EndOfTurnCard = {
	cardIds: [CardIds.GrimscaleElegist_BG32_331, CardIds.GrimscaleElegist_BG32_331_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.GrimscaleElegist_BG32_331 ? 1 : 2;

		const boardTarget = pickRandom(input.board);
		modifyStats(boardTarget, minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);

		const handTarget = pickRandom(
			input.hero.hand.filter(
				(c) => input.gameState.allCards.getCard(c.cardId).type?.toUpperCase() === CardType[CardType.MINION],
			),
		);
		if (handTarget) {
			handTarget.attack += 1 * mult;
			handTarget.health += 1 * mult;
		}
	},
};
