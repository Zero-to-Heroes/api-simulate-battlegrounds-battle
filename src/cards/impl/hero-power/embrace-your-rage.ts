import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const EmbraceYourRage: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	cardIds: [CardIds.EmbraceYourRage],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (EmbraceYourRage.cardIds.includes(heroPower.cardId) && heroPower.used) {
				const createdCardId = heroPower.info as string;
				if (!createdCardId?.length) {
					return false;
				}

				const spawns = spawnEntities(
					createdCardId,
					1,
					input.playerBoard,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState.allCards,
					input.gameState.cardsData,
					input.gameState.sharedState,
					input.gameState.spectator,
					input.playerEntity.friendly,
					false,
					false,
					false,
				);
				const indexFromRight = 0;
				const spawned = performEntitySpawns(
					spawns,
					input.playerBoard,
					input.playerEntity,
					input.playerEntity,
					indexFromRight,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				if (spawned?.length) {
					input.gameState.spectator.registerPowerTarget(
						input.playerEntity,
						spawns[0],
						input.playerBoard,
						input.playerEntity,
						input.opponentEntity,
					);
					addCardsInHand(input.playerEntity, input.playerBoard, spawns, input.gameState);
					input.gameState.spectator.registerPowerTarget(
						input.playerEntity,
						spawns[0],
						input.playerBoard,
						input.playerEntity,
						input.opponentEntity,
					);
					return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
				}
			}
		}
	},
};
