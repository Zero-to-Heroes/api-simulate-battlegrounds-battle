import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { getRandomMinionWithHighestHealth } from '../../../utils';

export const HoardingHatespawn = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const stats = minion.cardId === CardIds.HoardingHatespawn_BG29_872_G ? 20 : 10;
		const target = getRandomMinionWithHighestHealth(input.opponentBoard);
		if (!!target) {
			const previousAttack = target.attack;
			const previousHealth = target.health;
			target.attack = Math.max(0, target.attack - stats);
			target.health = Math.max(0, target.health - stats);
			target.maxHealth = Math.max(0, target.maxHealth - stats);
			modifyStats(
				minion,
				minion,
				previousAttack - target.attack,
				previousHealth - target.health,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
				false,
			);
			input.gameState.spectator.registerPowerTarget(
				minion,
				target,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}
		return true;
	},
};
