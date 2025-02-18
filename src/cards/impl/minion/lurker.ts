import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard } from '../../card.interface';

export const Lurker: AvengeCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_LurkerToken_BG31_HERO_811t7, CardIds.Lurker_BG31_HERO_811t7_G],
	baseAvengeValue: (cardId: string) => 2,
	avenge: (minion: BoardEntity, input: AvengeInput): void => {
		const mult = minion.cardId === CardIds.Lurker_BG31_HERO_811t7_G ? 2 : 1;
		modifyStats(minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);
	},
};
