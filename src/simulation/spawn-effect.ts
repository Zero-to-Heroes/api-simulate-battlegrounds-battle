/* eslint-disable @typescript-eslint/no-use-before-define */
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
			return {
				...entity,
				attack: entity.attack + spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MURLOC').length,
			};
		case CardIds.NonCollectible.Neutral.MurlocTidecallerTavernBrawl:
			return {
				...entity,
				attack:
					entity.attack + 2 * spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MURLOC').length,
			};
		case CardIds.Collectible.Paladin.CobaltGuardian:
			return spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MECH').length > 0
				? {
						...entity,
						divineShield: true,
				  }
				: entity;
	}
	return entity;
};
