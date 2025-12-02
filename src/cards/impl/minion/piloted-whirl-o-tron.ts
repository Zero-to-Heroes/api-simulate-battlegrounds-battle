import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { rememberDeathrattles } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasEntityMechanic } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const PilotedWhirlOTron: StartOfCombatCard = {
	cardIds: [
		CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy,
		CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy_G,
		CardIds.TimewarpedWhirlOTron_BG34_Giant_599,
		CardIds.TimewarpedWhirlOTron_BG34_Giant_599_G,
	],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult =
			minion.cardId === CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy_G ||
			minion.cardId === CardIds.TimewarpedWhirlOTron_BG34_Giant_599_G
				? 2
				: 1;
		const targets = input.playerBoard
			.filter(
				(e) =>
					!PilotedWhirlOTron.cardIds.includes(e.cardId) &&
					hasEntityMechanic(e, GameTag.DEATHRATTLE, input.gameState.allCards),
			)
			.slice(0, 2);
		for (let i = 0; i < mult; i++) {
			rememberDeathrattles(
				minion,
				targets,
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
		}
		return true;
	},
};
