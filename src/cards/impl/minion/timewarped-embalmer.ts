import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { DefaultChargesCard, OnOtherSpawnedCard } from '../../card.interface';

export const TimewarpedEmbalmer: OnOtherSpawnedCard & DefaultChargesCard = {
	cardIds: [CardIds.TimewarpedEmbalmer_BG34_Giant_332, CardIds.TimewarpedEmbalmer_BG34_Giant_332_G],
	defaultCharges: (entity: BoardEntity) => entity.scriptDataNum1 || 1,
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (minion.abiityChargesLeft > 0) {
			minion.abiityChargesLeft--;
			const target = input.spawned;
			updateReborn(target, true, input.board, input.hero, input.otherHero, input.gameState);
		}
	},
};
