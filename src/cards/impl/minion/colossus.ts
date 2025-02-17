import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion, getNeighbours } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const Colossus: OnAttackCard = {
	cardIds: [TempCardIds.Colossus, TempCardIds.Colossus_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		let dmgDoneByAttacker = 0;
		const neighbours = getNeighbours(input.defendingBoard, input.defendingEntity);
		const damage = minion.scriptDataNum1 || 1;
		for (const target of neighbours) {
			const dmg = dealDamageToMinion(
				target,
				input.defendingBoard,
				input.defendingHero,
				minion,
				damage,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
			dmgDoneByAttacker += dmg;
		}
		return { dmgDoneByAttacker, dmgDoneByDefender: 0 };
	},
};
