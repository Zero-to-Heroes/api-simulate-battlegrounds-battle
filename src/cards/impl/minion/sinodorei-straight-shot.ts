import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { updateTaunt } from '../../../keywords/taunt';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const SindoreiStraightShot: OnAttackCard = {
	cardIds: [CardIds.SindoreiStraightShot_BG25_016, CardIds.SindoreiStraightShot_BG25_016_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
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
