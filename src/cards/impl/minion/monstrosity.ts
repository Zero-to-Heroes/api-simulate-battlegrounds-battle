import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard } from '../../card.interface';

export const Monstrosity: AvengeCard = {
	cardIds: [CardIds.Monstrosity_BG20_HERO_282_Buddy, CardIds.Monstrosity_BG20_HERO_282_Buddy_G],
	baseAvengeValue: (cardId: string) => 1,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy_G ? 2 : 1;
		modifyStats(minion, minion, input.deadEntity.attack * mult, 0, input.board, input.hero, input.gameState);
	},
};
