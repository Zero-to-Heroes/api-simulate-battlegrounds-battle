import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ConveyorConstruct: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.ConveyorConstruct, TempCardIds.ConveyorConstruct_G],
	deathrattleSpawn: (entity: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = entity.cardId === TempCardIds.ConveyorConstruct_G ? 2 : 1;
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
