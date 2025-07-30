import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const SleepySupporter: OnAttackCard = {
	cardIds: [TempCardIds.SleepySupporter, TempCardIds.SleepySupporter_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.SleepySupporter_G ? 2 : 1;
		const candidates = input.attackingBoard.filter(
			(e) =>
				e !== minion &&
				hasCorrectTribe(
					e,
					input.attackingHero,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		);
		const target = pickRandom(candidates);
		if (!!target) {
			modifyStats(target, minion, 2 * mult, 3 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
