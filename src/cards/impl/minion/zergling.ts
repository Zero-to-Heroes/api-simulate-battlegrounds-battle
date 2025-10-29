import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { copyEntity } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const Zergling: StartOfCombatCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_ZerglingToken_BG31_HERO_811t2, CardIds.Zergling_BG31_HERO_811t2_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		let hasTriggered = false;
		const loops = minion.cardId === CardIds.Zergling_BG31_HERO_811t2_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			if (input.playerBoard.length < 7) {
				const copy = copyEntity(minion);
				removeAurasFromSelf(copy, input.playerBoard, input.playerEntity, input.gameState);
				const newMinions = spawnEntities(
					copy.cardId,
					1,
					input.playerBoard,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
					input.playerEntity.friendly,
					false,
					false,
					false,
					copy,
				);
				const indexFromRight = input.playerBoard.length - input.playerBoard.indexOf(minion) - 1;
				const spawns = performEntitySpawns(
					newMinions,
					input.playerBoard,
					input.playerEntity,
					input.playerEntity,
					indexFromRight,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				hasTriggered = true;
			}
		}
		// Doesn't recompute the first attacker:
		// https://replays.firestoneapp.com/?reviewId=3cdf06e9-192d-49be-b1f8-e47e46704b2b&turn=9&action=0
		// 34.0 It now does https://replays.firestoneapp.com/?reviewId=c85091fd-0f10-4ada-8f11-d6f918d66688&turn=7&action=0
		return { hasTriggered: hasTriggered, shouldRecomputeCurrentAttacker: true };
	},
};
