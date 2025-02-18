import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Roach: EndOfTurnCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_RoachToken_BG31_HERO_811t3, CardIds.Roach_BG31_HERO_811t3_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.Roach_BG31_HERO_811t3_G ? 2 : 1;
		modifyStats(minion, 0, input.hero.tavernTier * mult, input.board, input.hero, input.gameState);
	},
};
