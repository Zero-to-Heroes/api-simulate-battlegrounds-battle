import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const Niuzao: OnAttackCard = {
	cardIds: [CardIds.Niuzao_BG27_822, CardIds.Niuzao_BG27_822_G],
	onAnyMinionAttack: (
		minion: BoardEntity,
		input: OnAttackInput,
	): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const multiplier = minion.cardId === CardIds.Niuzao_BG27_822_G ? 2 : 1;
		let dmgDoneByAttacker = 0;
		for (let i = 0; i < multiplier; i++) {
			const target = pickRandom(input.defendingBoard.filter((e) => e.entityId != input.defendingEntity.entityId));
			if (target) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.defendingBoard,
					input.attackingHero,
					input.defendingHero,
				);
				dmgDoneByAttacker += dealDamageToMinion(
					target,
					input.defendingBoard,
					input.defendingHero,
					minion,
					minion.attack,
					input.attackingBoard,
					input.attackingHero,
					input.gameState,
				);
			}
		}
		return { dmgDoneByAttacker, dmgDoneByDefender: 0 };
	},
};
