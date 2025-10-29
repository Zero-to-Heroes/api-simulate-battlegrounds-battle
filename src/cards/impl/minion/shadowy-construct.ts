import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard, DefaultChargesCard } from '../../card.interface';

export const ShadowyConstruct: AvengeCard & DefaultChargesCard = {
	cardIds: [CardIds.ShadowyConstruct_BG25_HERO_103_Buddy, CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G],
	baseAvengeValue: (cardId: string) => 1,
	defaultCharges: (entity: BoardEntity) => (entity.cardId === CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G ? 2 : 1),
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		if (minion.abiityChargesLeft <= 0) {
			return null;
		}
		minion.abiityChargesLeft--;
		// Can't be revived with this
		// 34.0 https://replays.firestoneapp.com/?reviewId=461e99c8-5a09-4956-9e8e-9ffe415fdb26&turn=13&action=0
		if (minion.health > 0 && !minion.definitelyDead) {
			modifyStats(
				minion,
				minion,
				input.deadEntity.maxAttack,
				input.deadEntity.maxHealth,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
