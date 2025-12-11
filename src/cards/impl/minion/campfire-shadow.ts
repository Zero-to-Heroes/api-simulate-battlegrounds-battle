import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const CampfireShadow: RallyCard = {
	cardIds: [CardIds.CampfireShadow_BG33_113, CardIds.CampfireShadow_BG33_113_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.CampfireShadow_BG33_113_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const target = pickRandom(input.defendingBoard)?.cardId;
			if (!!target) {
				addCardsInHand(input.attackingHero, input.attackingBoard, [target], input.gameState);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
