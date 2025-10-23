import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion, getNeighbours } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats, setEntityStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { DefaultChargesCard, RallyCard } from '../../card.interface';

export const RoaringRallier: RallyCard = {
	cardIds: [CardIds.RoaringRallier_BG29_816, CardIds.RoaringRallier_BG29_816_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (
			hasCorrectTribe(
				input.attacker,
				input.attackingHero,
				Race.DRAGON,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			if (minion !== input.attacker) {
				const stats = minion.cardId === CardIds.RoaringRallier_BG29_816_G ? 2 : 1;
				modifyStats(
					input.attacker,
					minion,
					3 * stats,
					1 * stats,
					input.attackingBoard,
					input.attackingHero,
					input.gameState,
				);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
