import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard, DefaultChargesCard } from '../../card.interface';

export const ShadowConstruct: AvengeCard & DefaultChargesCard = {
	cardIds: [CardIds.ShadowyConstruct_BG25_HERO_103_Buddy, CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G],
	baseAvengeValue: (cardId: string) => 1,
	defaultCharges: (entity: BoardEntity) => (entity.cardId === CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G ? 2 : 1),
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		if (minion.abiityChargesLeft <= 0) {
			return null;
		}
		minion.abiityChargesLeft--;
		modifyStats(
			minion,
			minion,
			input.deadEntity.attack,
			input.deadEntity.maxHealth,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
