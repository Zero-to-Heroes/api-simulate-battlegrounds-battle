import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { updateTaunt } from '../../../keywords/taunt';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const SindoreiStraightShot: RallyCard = {
	cardIds: [CardIds.SindoreiStraightShot_BG25_016, CardIds.SindoreiStraightShot_BG25_016_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (!input.defendingEntity) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		updateTaunt(
			input.defendingEntity,
			false,
			input.defendingBoard,
			input.defendingHero,
			input.attackingHero,
			input.gameState,
		);
		updateReborn(
			input.defendingEntity,
			false,
			input.defendingBoard,
			input.defendingHero,
			input.attackingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
