import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CruiseController: DeathrattleSpawnCard = {
	cardIds: [CardIds.CruiseController_BG31_821, CardIds.CruiseController_BG31_821_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		input.boardWithDeadEntityHero.globalInfo.PirateAttackBonus +=
			minion.cardId === CardIds.CruiseController_BG31_821_G ? 10 : 5;
		return [];
	},
};
