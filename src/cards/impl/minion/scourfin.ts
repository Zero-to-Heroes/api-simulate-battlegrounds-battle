import { CardType } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { grantRandomStats } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Scourfin: DeathrattleSpawnCard = {
	cardIds: [CardIds.Scourfin_BG26_360, CardIds.Scourfin_BG26_360_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.Scourfin_BG26_360_G ? 2 : 1;
		grantRandomStats(
			input.deadEntity,
			input.boardWithDeadEntityHero.hand.filter(
				(e) => input.gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
			),
			input.boardWithDeadEntityHero,
			5 * mult,
			5 * mult,
			null,
			true,
			input.gameState,
		);
		return [];
	},
};
