import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const CampfireShadow: OnAttackCard = {
	cardIds: [TempCardIds.CampfireShadow, TempCardIds.CampfireShadow_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.CampfireShadow_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const target = pickRandom(input.defendingBoard).cardId;
			addCardsInHand(input.attackingHero, input.attackingBoard, [target], input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
