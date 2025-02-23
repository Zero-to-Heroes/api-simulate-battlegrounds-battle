import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const AdmiralElizaGoreblade: OnAttackCard = {
	cardIds: [CardIds.AdmiralElizaGoreblade_BG27_555, CardIds.AdmiralElizaGoreblade_BG27_555_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (
			hasCorrectTribe(
				input.attacker,
				input.attackingHero,
				Race.PIRATE,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			const mult = minion.cardId === CardIds.AdmiralElizaGoreblade_BG27_555_G ? 2 : 1;
			input.attackingBoard.forEach((entity) => {
				modifyStats(entity, 3 * mult, 1 * mult, input.attackingBoard, input.attackingHero, input.gameState);
				input.gameState.spectator.registerPowerTarget(
					minion,
					entity,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
				);
			});
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
