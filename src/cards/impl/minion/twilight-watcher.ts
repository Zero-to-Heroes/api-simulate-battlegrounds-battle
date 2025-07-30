import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const TwilightWatcher: OnAttackCard = {
	cardIds: [TempCardIds.TwilightWatcher, TempCardIds.TwilightWatcher_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (
			!hasCorrectTribe(
				minion,
				input.attackingHero,
				Race.DRAGON,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.TwilightWatcher_G ? 2 : 1;
		const candidates = input.attackingBoard.filter((e) =>
			hasCorrectTribe(e, input.attackingHero, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of candidates) {
			modifyStats(target, minion, 1 * mult, 3 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
