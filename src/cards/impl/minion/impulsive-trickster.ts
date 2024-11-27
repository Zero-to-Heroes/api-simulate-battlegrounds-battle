import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { grantRandomHealth } from '../../../utils';
import { DeathrattleEffectCard } from '../../card.interface';

export const ImpulsiveTrickster: DeathrattleEffectCard = {
	cardIds: [CardIds.ImpulsiveTrickster_BG21_006, CardIds.ImpulsiveTrickster_BG21_006_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const tricksterMultiplier = minion.cardId === CardIds.ImpulsiveTrickster_BG21_006_G ? 2 : 1;
		for (let j = 0; j < tricksterMultiplier; j++) {
			grantRandomHealth(
				minion,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				minion.maxHealth,
				input.gameState,
				true,
			);
		}
	},
};
