import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { addStatsToBoard } from '../../../utils';
import { OnOtherSpawnedCard } from '../../card.interface';

export const BabyYshaarj: OnOtherSpawnedCard = {
	cardIds: [CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy, CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const spawnedTavernTier = input.gameState.cardsData.getTavernLevel(input.spawned.cardId);
		const ownTavernTier = input.hero.tavernTier;
		if (spawnedTavernTier != ownTavernTier) {
			return;
		}
		const mult = minion.cardId === CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 1 * mult, input.gameState);
	},
};
