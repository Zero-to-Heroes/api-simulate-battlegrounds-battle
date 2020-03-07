/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';

export const handleSpawnEffects = (
	board: BoardEntity[],
	spawned: readonly BoardEntity[],
	cards: AllCardsService,
): void => {
	for (const entity of board) {
		handleSpawn(entity, spawned, cards);
	}
	// return board.map(entity => handleSpawn(e/ntity, spawned, cards));
};

export const handleSpawn = (entity: BoardEntity, spawned: readonly BoardEntity[], cards: AllCardsService): void => {
	switch (entity.cardId) {
		case CardIds.Collectible.Neutral.MurlocTidecaller:
			entity.attack += spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MURLOC').length;
			return;
		case CardIds.NonCollectible.Neutral.MurlocTidecallerTavernBrawl:
			entity.attack += 2 * spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MURLOC').length;
			return;
		case CardIds.Collectible.Paladin.CobaltGuardian:
			if (spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MECH').length > 0) {
				entity.divineShield = true;
			}
			return;
	}
	// return entity;
};
