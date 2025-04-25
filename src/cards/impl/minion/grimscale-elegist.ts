import { CardType } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const GrimscaleElegist: EndOfTurnCard = {
	cardIds: [TempCardIds.GrimscaleElegist, TempCardIds.GrimscaleElegist_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.GrimscaleElegist ? 1 : 2;

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
