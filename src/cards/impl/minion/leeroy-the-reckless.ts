import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleEffectCard } from '../../card.interface';

export const LeeroyTheReckless: DeathrattleEffectCard = {
	cardIds: [CardIds.LeeroyTheReckless_BG23_318, CardIds.LeeroyTheReckless_BG23_318_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		if (
			minion.lastAffectedByEntity
			// http://replays.firestoneapp.com/?reviewId=c6121cdd-5cb6-4321-807e-4ff644568a8c&turn=25&action=7
			// Update 02/05/2024: this is a bug, and friendly units should be killed
			// deadEntity.friendly !== deadEntity.lastAffectedByEntity.friendly
		) {
			minion.lastAffectedByEntity.definitelyDead = true;
		}
	},
};
