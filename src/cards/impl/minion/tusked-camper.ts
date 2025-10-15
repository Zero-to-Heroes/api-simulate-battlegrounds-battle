import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const TuskedCamper: RallyCard = {
	cardIds: [CardIds.TuskedCamper_BG33_886, CardIds.TuskedCamper_BG33_886_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.TuskedCamper_BG33_886_G ? 2 : 1;
		playBloodGemsOn(
			input.attacker,
			input.attacker,
			1 * mult,
			input.attackingBoard,
			input.attackingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
