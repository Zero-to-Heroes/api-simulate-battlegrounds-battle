import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnOtherSpawnedCard } from '../../card.interface';

export const TimewarpedEmbalmer: OnOtherSpawnedCard = {
	cardIds: [CardIds.TimewarpedEmbalmer_BG34_Giant_332, CardIds.TimewarpedEmbalmer_BG34_Giant_332_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		// Not implemented yet
	},
};
