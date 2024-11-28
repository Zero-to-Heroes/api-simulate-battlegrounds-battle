import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleEffectCard } from '../../card.interface';

export const CruiseController: DeathrattleEffectCard = {
	cardIds: [CardIds.CruiseController_BG31_821, CardIds.CruiseController_BG31_821_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		input.boardWithDeadEntityHero.globalInfo.PirateAttackBonus +=
			minion.cardId === CardIds.CruiseController_BG31_821_G ? 10 : 5;
	},
};
