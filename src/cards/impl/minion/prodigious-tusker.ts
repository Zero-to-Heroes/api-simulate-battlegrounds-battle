import { CardIds, GameTag, hasMechanic } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const ProdigiousTusker: OnAttackCard = {
	cardIds: [CardIds.ProdigiousTusker_BG33_430, CardIds.ProdigiousTusker_BG33_430_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasMechanic(input.gameState.allCards.getCard(input.attacker.cardId), GameTag.BACON_RALLY)) {
			const mult = minion.cardId === CardIds.ProdigiousTusker_BG33_430_G ? 2 : 1;
			playBloodGemsOn(minion, minion, 2 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
