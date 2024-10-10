import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { rememberDeathrattles } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const PilotedWhirlOTron = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		rememberDeathrattles(
			minion,
			input.playerBoard.filter(
				(e) =>
					e.cardId !== CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy &&
					e.cardId !== CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy_G,
			),
			input.gameState.cardsData,
			input.gameState.allCards,
			input.gameState.sharedState,
		);
		input.gameState.spectator.registerPowerTarget(
			minion,
			minion,
			input.playerBoard,
			input.playerEntity,
			input.opponentEntity,
		);
		return true;
	},
};
