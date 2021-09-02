/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { afterStatsUpdate, hasCorrectTribe, isCorrectTribe, modifyAttack } from '../utils';

export const handleSpawnEffects = (board: BoardEntity[], spawned: readonly BoardEntity[], cards: AllCardsService): void => {
	for (const entity of board) {
		handleSpawn(entity, board, spawned, cards);
	}
};

export const handleSpawn = (
	entity: BoardEntity,
	friendlyBoard: BoardEntity[],
	spawned: readonly BoardEntity[],
	allCards: AllCardsService,
): void => {
	switch (entity.cardId) {
		case CardIds.Collectible.Neutral.MurlocTidecallerLegacy:
			modifyAttack(
				entity,
				spawned.filter((spawn) => isCorrectTribe(allCards.getCard(spawn.cardId).race, Race.MURLOC)).length,
				friendlyBoard,
				allCards,
			);
			afterStatsUpdate(entity, friendlyBoard, allCards);
			return;
		case CardIds.NonCollectible.Neutral.MurlocTidecallerBattlegrounds:
			modifyAttack(
				entity,
				2 * spawned.filter((spawn) => isCorrectTribe(allCards.getCard(spawn.cardId).race, Race.MURLOC)).length,
				friendlyBoard,
				allCards,
			);
			afterStatsUpdate(entity, friendlyBoard, allCards);
			return;
		case CardIds.Collectible.Paladin.CobaltGuardian:
		case CardIds.NonCollectible.Neutral.DeflectOBot:
			if (spawned.filter((spawn) => hasCorrectTribe(spawn, Race.MECH, allCards)).length > 0) {
				entity.attack = entity.attack + 2;
				entity.divineShield = true;
			}
			return;
		case CardIds.NonCollectible.Neutral.DeflectOBotBattlegrounds:
			if (spawned.filter((spawn) => isCorrectTribe(allCards.getCard(spawn.cardId).race, Race.MECH)).length > 0) {
				entity.attack = entity.attack + 4;
				entity.divineShield = true;
			}
			return;
	}
	// return entity;
};
