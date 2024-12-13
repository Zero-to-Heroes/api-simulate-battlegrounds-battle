import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { setEntityStats } from '../../../simulation/stats';
import { DefaultChargesCard, OnAttackCard } from '../../card.interface';

export const TransmutedBramblewitch: OnAttackCard & DefaultChargesCard = {
	cardIds: [CardIds.TransmutedBramblewitch_BG27_013, CardIds.TransmutedBramblewitch_BG27_013_G],
	defaultCharges: (entity: BoardEntity) => (entity.cardId === CardIds.TransmutedBramblewitch_BG27_013_G ? 2 : 1),
	onAttack: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		if (minion.abiityChargesLeft > 0) {
			setEntityStats(input.defendingEntity, 3, 3, input.defendingBoard, input.defendingHero, input.gameState);
			minion.abiityChargesLeft--;
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
