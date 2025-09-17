import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const LeeroyTheReckless: DeathrattleSpawnCard = {
	cardIds: [CardIds.LeeroyTheReckless_BG23_318, CardIds.LeeroyTheReckless_BG23_318_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		if (
			minion.lastAffectedByEntity
			// http://replays.firestoneapp.com/?reviewId=c6121cdd-5cb6-4321-807e-4ff644568a8c&turn=25&action=7
			// Update 02/05/2024: this is a bug, and friendly units should be killed
			// deadEntity.friendly !== deadEntity.lastAffectedByEntity.friendly
		) {
			minion.lastAffectedByEntity.definitelyDead = true;
		}
		return [];
	},
};
