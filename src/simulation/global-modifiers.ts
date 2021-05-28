/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { isCorrectTribe } from '../utils';

export const applyGlobalModifiers = (board1: BoardEntity[], board2: BoardEntity[], data: CardsData, cards: AllCardsService): void => {
	const totalMurlocs =
		board1.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length +
		board2.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length;
	for (const entity of board1) {
		mapEntity(entity, totalMurlocs);
	}
	for (const entity of board2) {
		mapEntity(entity, totalMurlocs);
	}
};

export const removeGlobalModifiers = (board1: BoardEntity[], board2: BoardEntity[], cards: AllCardsService): void => {
	const totalMurlocs =
		board1.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length +
		board2.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length;
	for (const entity of board1) {
		removeGlobalModifiersForEntity(entity, totalMurlocs);
	}
	for (const entity of board2) {
		removeGlobalModifiersForEntity(entity, totalMurlocs);
	}
};

const removeGlobalModifiersForEntity = (entity: BoardEntity, totalMurlocs: number): void => {
	if (entity.previousAttack) {
		entity.attack = entity.previousAttack;
	}
	// First time the board state is received, the murkeye buff is applied so we have to remove it
	else if (
		[CardIds.Collectible.Neutral.OldMurkEyeLegacy, CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds].indexOf(entity.cardId) !== -1
	) {
		// Only "other" murlocs
		entity.attack -= (totalMurlocs - 1) * (entity.cardId === CardIds.Collectible.Neutral.OldMurkEyeLegacy ? 1 : 2);
	}
	entity.previousAttack = undefined;
	entity.attacking = undefined;
	entity.lastAffectedByEntity = undefined;
};

const mapEntity = (entity: BoardEntity, totalMurlocs: number): void => {
	if (
		[CardIds.Collectible.Neutral.OldMurkEyeLegacy, CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds].indexOf(entity.cardId) !== -1
	) {
		applyMurkeyeBuff(entity, totalMurlocs);
	}
};

const applyMurkeyeBuff = (entity: BoardEntity, totalMurlocs: number): void => {
	entity.previousAttack = entity.attack;
	// Only "other" murlocs
	entity.attack += (totalMurlocs - 1) * (entity.cardId === CardIds.Collectible.Neutral.OldMurkEyeLegacy ? 1 : 2);
};
