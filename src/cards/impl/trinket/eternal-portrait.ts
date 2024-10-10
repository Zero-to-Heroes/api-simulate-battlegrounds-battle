import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const EternalPortrait = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const candidates = input.playerBoard
			.filter((e) => e.cardId === CardIds.EternalKnight_BG25_008 || e.cardId === CardIds.EternalKnight_BG25_008_G)
			.filter((e) => !e.taunt || !e.reborn);
		if (candidates?.length) {
			candidates.forEach((knight) => {
				knight.taunt = true;
				knight.reborn = true;
				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					knight,
					input.playerBoard,
					null,
					null,
				);
			});
			return true;
		}
	},
};
