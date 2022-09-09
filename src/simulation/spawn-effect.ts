/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { afterStatsUpdate, hasCorrectTribe, isCorrectTribe, modifyAttack } from '../utils';
import { Spectator } from './spectator/spectator';

export const handleSpawnEffects = (
	board: BoardEntity[],
	spawned: readonly BoardEntity[],
	cards: AllCardsService,
	spectator: Spectator,
): void => {
	for (const entity of board) {
		handleSpawn(entity, board, spawned, cards, spectator);
	}
};

export const handleSpawn = (
	entity: BoardEntity,
	friendlyBoard: BoardEntity[],
	spawned: readonly BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	switch (entity.cardId) {
		case CardIds.MurlocTidecallerLegacy:
		case CardIds.MurlocTidecallerBattlegrounds:
			const multiplier = entity.cardId === CardIds.MurlocTidecallerBattlegrounds ? 2 : 1;
			const buffAmount =
				multiplier * spawned.filter((spawn) => isCorrectTribe(allCards.getCard(spawn.cardId).race, Race.MURLOC)).length;
			if (buffAmount > 0) {
				modifyAttack(entity, buffAmount, friendlyBoard, allCards);
				afterStatsUpdate(entity, friendlyBoard, allCards);
				spectator.registerPowerTarget(entity, entity, friendlyBoard);
			}
			return;
		case CardIds.Swampstriker:
		case CardIds.SwampstrikerBattlegrounds:
			const multiplier2 = entity.cardId === CardIds.SwampstrikerBattlegrounds ? 2 : 1;
			const buffAmount2 =
				multiplier2 * spawned.filter((spawn) => isCorrectTribe(allCards.getCard(spawn.cardId).race, Race.MURLOC)).length;
			if (buffAmount2 > 0) {
				modifyAttack(entity, buffAmount2, friendlyBoard, allCards);
				afterStatsUpdate(entity, friendlyBoard, allCards);
				spectator.registerPowerTarget(entity, entity, friendlyBoard);
			}
			return;
		case CardIds.CobaltGuardian:
		case CardIds.DeflectOBot:
			if (spawned.filter((spawn) => hasCorrectTribe(spawn, Race.MECH, allCards)).length > 0) {
				entity.divineShield = true;
				modifyAttack(entity, 2, friendlyBoard, allCards);
				afterStatsUpdate(entity, friendlyBoard, allCards);
				spectator.registerPowerTarget(entity, entity, friendlyBoard);
			}
			return;
		case CardIds.DeflectOBotBattlegrounds:
			if (spawned.filter((spawn) => isCorrectTribe(allCards.getCard(spawn.cardId).race, Race.MECH)).length > 0) {
				entity.divineShield = true;
				modifyAttack(entity, 4, friendlyBoard, allCards);
				afterStatsUpdate(entity, friendlyBoard, allCards);
				spectator.registerPowerTarget(entity, entity, friendlyBoard);
			}
			return;
	}
	// return entity;
};
