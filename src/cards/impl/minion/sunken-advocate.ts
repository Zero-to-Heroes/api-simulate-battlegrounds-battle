import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const SunkenAdvocate: RallyCard = {
	cardIds: [CardIds.SunkenAdvocate_BG34_930, CardIds.SunkenAdvocate_BG34_930_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.SunkenAdvocate_BG34_930_G ? 2 : 1;
		const targets = input.attackingBoard.filter(
			(e) =>
				e !== input.attacker &&
				hasCorrectTribe(e, input.attackingHero, Race.NAGA, input.gameState.anomalies, input.gameState.allCards),
		);
		const buff = minion.scriptDataNum1 || 1 * mult;
		for (const target of targets) {
			modifyStats(target, input.attacker, buff, 0, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
