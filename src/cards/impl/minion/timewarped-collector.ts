import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { isGolden } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const TimewarpedCollector: RallyCard = {
	cardIds: [CardIds.TimewarpedCollector_BG34_Giant_680, CardIds.TimewarpedCollector_BG34_Giant_680_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const goldenMinions = input.attackingBoard.filter((e) => isGolden(e.cardId, input.gameState.allCards));
		if (goldenMinions.length >= 4) {
			updateDivineShield(
				minion,
				input.attackingBoard,
				input.attackingHero,
				input.defendingHero,
				true,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
