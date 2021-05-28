/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { isCorrectTribe } from '../utils';
export const handleSpawnEffects = (board: BoardEntity[], spawned: readonly BoardEntity[], cards: AllCardsService): void => {
	for (const entity of board) {
		handleSpawn(entity, spawned, cards);
	}
	// return board.map(entity => handleSpawn(e/ntity, spawned, cards));
};

export const handleSpawn = (entity: BoardEntity, spawned: readonly BoardEntity[], cards: AllCardsService): void => {
	switch (entity.cardId) {
		case CardIds.Collectible.Neutral.MurlocTidecallerLegacy:
			entity.attack += spawned.filter((spawn) => isCorrectTribe(cards.getCard(spawn.cardId).race, Race.MURLOC)).length;
			return;
		case CardIds.NonCollectible.Neutral.MurlocTidecallerBattlegrounds:
			entity.attack += 2 * spawned.filter((spawn) => isCorrectTribe(cards.getCard(spawn.cardId).race, Race.MURLOC)).length;
			return;
		case CardIds.Collectible.Paladin.CobaltGuardian:
		case CardIds.NonCollectible.Neutral.DeflectOBot:
			if (spawned.filter((spawn) => isCorrectTribe(cards.getCard(spawn.cardId).race, Race.MECH)).length > 0) {
				entity.attack = entity.attack + 1;
				entity.divineShield = true;
			}
			return;
		case CardIds.NonCollectible.Neutral.DeflectOBotBattlegrounds:
			if (spawned.filter((spawn) => isCorrectTribe(cards.getCard(spawn.cardId).race, Race.MECH)).length > 0) {
				entity.attack = entity.attack + 2;
				entity.divineShield = true;
			}
			return;
	}
	// return entity;
};
