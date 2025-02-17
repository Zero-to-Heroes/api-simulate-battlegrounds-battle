import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const Hydralisk: OnAttackCard = {
	cardIds: [TempCardIds.Hydralisk, TempCardIds.Hydralisk_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const mult = minion.cardId === TempCardIds.Hydralisk_G ? 2 : 1;
		const buff = input.attackingHero.tavernTier;
		modifyStats(minion, buff * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
