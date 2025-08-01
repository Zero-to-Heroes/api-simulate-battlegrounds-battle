import { CardIds, GameTag, hasMechanic } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const BloodsnoutWarlord: OnAttackCard = {
	cardIds: [CardIds.BloodsnoutWarlord_BG33_884, CardIds.BloodsnoutWarlord_BG33_884_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasMechanic(input.gameState.allCards.getCard(input.attacker.cardId), GameTag.BACON_RALLY)) {
			const mult = minion.cardId === CardIds.BloodsnoutWarlord_BG33_884_G ? 2 : 1;
			for (const target of input.attackingBoard) {
				playBloodGemsOn(minion, target, 2 * mult, input.attackingBoard, input.attackingHero, input.gameState);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
