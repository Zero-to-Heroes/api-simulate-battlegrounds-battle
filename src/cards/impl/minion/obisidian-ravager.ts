import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion, getNeighbours } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { setEntityStats } from '../../../simulation/stats';
import { DefaultChargesCard, RallyCard } from '../../card.interface';

export const ObsidianRavager: RallyCard = {
	cardIds: [CardIds.ObsidianRavager_BG27_017, CardIds.ObsidianRavager_BG27_017_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const neighbours = getNeighbours(input.defendingBoard, input.defendingEntity);
		const targets =
			input.attacker.cardId === CardIds.ObsidianRavager_BG27_017_G ? neighbours : [pickRandom(neighbours)];
		[input.defendingEntity, ...targets].forEach((target) => {
			input.gameState.spectator.registerPowerTarget(
				input.attacker,
				target,
				input.defendingBoard,
				input.attackingHero,
				input.defendingHero,
			);
			dealDamageToMinion(
				target,
				input.defendingBoard,
				input.defendingHero,
				input.attacker,
				input.attacker.attack,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
		});
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
