import { GameTag, hasMechanic } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const BloodsnoutWarlord: OnAttackCard = {
	cardIds: [TempCardIds.BloodsnoutWarlord, TempCardIds.BloodsnoutWarlord_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasMechanic(input.gameState.allCards.getCard(input.attacker.cardId), GameTag.RALLY)) {
			const mult = minion.cardId === TempCardIds.BloodsnoutWarlord_G ? 2 : 1;
			for (const target of input.attackingBoard) {
				playBloodGemsOn(minion, target, 2 * mult, input.attackingBoard, input.attackingHero, input.gameState);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
