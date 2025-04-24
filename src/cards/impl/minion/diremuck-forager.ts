import { CardIds, CardType } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const DiremuckForager = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const potentialTargets = input.playerEntity.hand
			.filter((e) => !!e.cardId)
			.filter((e) => input.gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION])
			.filter((e) => !e.locked);
		if (potentialTargets.length > 0) {
			const target = pickRandom(potentialTargets);
			// When it's the opponent, the game state already contains all the buffs
			// It can happen that, for the opponent, a card is first added to their hand (eg with Embrace Your Rage)
			// and then summoned by Diremuck. In that case, the stats need to be buffed
			// Update 29.2 18/04/2024: this is no longer the case, and the minions passed in the initial state should
			// reflect the values they have in hand
			// if (target?.friendly || !target?.inInitialState) {
			const diremuckBuff = minion.cardId === CardIds.DiremuckForager_BG27_556_G ? 4 : 2;
			modifyStats(
				target,
				minion,
				diremuckBuff,
				diremuckBuff,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
			// }
			if (input.playerBoard.length < 7) {
				target.locked = true;
				const newMinions = spawnEntities(
					target.cardId,
					1,
					input.playerBoard,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
					minion.friendly,
					false,
					false,
					true,
					{ ...target } as BoardEntity,
				);
				for (const s of newMinions) {
					s.onCanceledSummon = () => (target.locked = false);
				}
				performEntitySpawns(
					newMinions,
					input.playerBoard,
					input.playerEntity,
					minion,
					input.playerBoard.length - (input.playerBoard.indexOf(minion) + 1),
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
			}
		}
		return true;
	},
};
