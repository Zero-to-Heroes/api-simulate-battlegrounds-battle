import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';

export const handleSpawnEffects = (
	board: readonly BoardEntity[],
	spawned: readonly BoardEntity[],
	cards: AllCardsService,
): readonly BoardEntity[] => {
	return board.map(entity => handleSpawn(entity, spawned, cards));
};

export const handleSpawn = (
	entity: BoardEntity,
	spawned: readonly BoardEntity[],
	cards: AllCardsService,
): BoardEntity => {
	switch (entity.cardId) {
		case CardIds.Collectible.Neutral.MurlocTidecaller:
			const result = {
				...entity,
				attack: entity.attack + spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MURLOC').length,
			};
			console.log(
				'buffing murloc tidecaller',
				// entity,
				// spawned,
				// spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MURLOC').length,
				result,
			);
			return result;
	}
	return entity;
};
