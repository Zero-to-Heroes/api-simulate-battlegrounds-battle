import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ConveyorConstruct: DeathrattleSpawnCard = {
	cardIds: [CardIds.ConveyorConstruct_BG34_171, CardIds.ConveyorConstruct_BG34_171_G],
	deathrattleSpawn: (entity: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = entity.cardId === CardIds.ConveyorConstruct_BG34_171_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const cardToAdd = input.gameState.cardsData.getRandomMagneticVolumizer(
				input.boardWithDeadEntityHero,
				input.gameState.anomalies,
				input.boardWithDeadEntityHero.tavernTier ?? 1,
			);
			addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, [cardToAdd], input.gameState);
		}
		return [];
	},
};
