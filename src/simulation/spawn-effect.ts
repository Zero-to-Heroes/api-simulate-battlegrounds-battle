/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
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
		case CardIds.NonCollectible.Neutral.DeflectOBot:
			if (spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MECH').length > 0) {
				// console.log('mech spawned, granting DS and +1 attack');
				entity.attack = entity.attack + 1;
				entity.divineShield = true;
			}
			return;
		case CardIds.NonCollectible.Neutral.DeflectOBotTavernBrawl:
			if (spawned.filter(spawn => cards.getCard(spawn.cardId).race === 'MECH').length > 0) {
				entity.attack = entity.attack + 2;
				entity.divineShield = true;
			}
			return;
	}
	// return entity;
};
