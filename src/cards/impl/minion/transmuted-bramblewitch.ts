import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { setEntityStats } from '../../../simulation/stats';
import { DefaultChargesCard, RallyCard } from '../../card.interface';

export const TransmutedBramblewitch: RallyCard & DefaultChargesCard = {
	cardIds: [CardIds.TransmutedBramblewitch_BG27_013, CardIds.TransmutedBramblewitch_BG27_013_G],
	defaultCharges: (entity: BoardEntity) => (entity.cardId === CardIds.TransmutedBramblewitch_BG27_013_G ? 2 : 1),
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (!input.defendingEntity) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		if (minion.abiityChargesLeft > 0) {
			setEntityStats(input.defendingEntity, 3, 3, input.defendingBoard, input.defendingHero, input.gameState);
			minion.abiityChargesLeft--;
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
