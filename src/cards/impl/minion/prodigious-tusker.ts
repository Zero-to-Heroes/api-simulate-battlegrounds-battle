import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { hasEntityMechanic } from '../../../utils';
import { OnWheneverAnotherMinionAttacksCard } from '../../card.interface';

export const ProdigiousTusker: OnWheneverAnotherMinionAttacksCard = {
	cardIds: [CardIds.ProdigiousTusker_BG33_430, CardIds.ProdigiousTusker_BG33_430_G],
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasEntityMechanic(input.attacker, GameTag.BACON_RALLY, input.gameState.allCards)) {
			const mult = minion.cardId === CardIds.ProdigiousTusker_BG33_430_G ? 2 : 1;
			playBloodGemsOn(minion, minion, 2 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
