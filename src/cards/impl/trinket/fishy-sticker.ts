import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const FishySticker = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length < 7) {
			const spawnId =
				trinket.cardId === CardIds.FishySticker_BG30_MagicItem_821
					? CardIds.AvatarOfNzoth_FishOfNzothToken
					: CardIds.FishOfNzoth;
			const newMinions = spawnEntities(
				spawnId,
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
			);
			const spawns = performEntitySpawns(
				newMinions,
				input.playerBoard,
				input.playerEntity,
				input.playerEntity,
				0,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
		}
	},
};
