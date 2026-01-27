import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToMinion } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedClefthoof: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedClefthoof_BG34_PreMadeChamp_090, CardIds.TimewarpedClefthoof_BG34_PreMadeChamp_090_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedClefthoof_BG34_PreMadeChamp_090_G ? 2 : 1;
		const candidates = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards),
		);
		for (let i = 0; i < 3 * mult; i++) {
			for (const candidate of candidates) {
				modifyStats(candidate, minion, 2, 2, input.board, input.hero, input.gameState);
				dealDamageToMinion(
					candidate,
					input.board,
					input.hero,
					minion,
					1,
					input.otherBoard,
					input.otherHero,
					input.gameState,
				);
			}
		}
	},
};
