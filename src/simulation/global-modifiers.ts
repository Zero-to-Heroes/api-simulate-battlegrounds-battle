/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';

// Check if aura is already applied, and if not re-apply it
export const applyGlobalModifiers = (
	board1: BoardEntity[],
	board2: BoardEntity[],
	data: CardsData,
	cards: AllCardsService,
): void => {
	// console.log('before applying global modifiers', board1, board2);
	const totalMurlocs =
		board1.map(entity => cards.getCard(entity.cardId).race).filter(race => race === 'MURLOC').length +
		board2.map(entity => cards.getCard(entity.cardId).race).filter(race => race === 'MURLOC').length;
	for (const entity of board1) {
		mapEntity(entity, totalMurlocs);
	}
	for (const entity of board2) {
		mapEntity(entity, totalMurlocs);
	}
	// const result: [readonly BoardEntity[], readonly BoardEntity[]] = [
	// 	board1.map(entity => mapEntity(entity, totalMurlocs)),
	// 	board2.map(entity => mapEntity(entity, totalMurlocs)),
	// ];
	// console.log('after applying global modifiers', board1, board2);
	// return result;
};

export const removeGlobalModifiers = (board1: BoardEntity[], board2: BoardEntity[]): void => {
	for (const entity of board1) {
		removeGlobalModifiersForEntity(entity);
	}
	for (const entity of board2) {
		removeGlobalModifiersForEntity(entity);
	}
	// console.log('before removing global modifiers', board1, board2);
	// const result: [readonly BoardEntity[], readonly BoardEntity[]] = [
	// 	board1.map(entity => {
	// 		let newEntity = entity.previousAttack
	// 			? { ...entity, previousAttack: undefined, attack: entity.previousAttack }
	// 			: entity;
	// 		newEntity = entity.attacking ? { ...entity, attacking: undefined } : entity;
	// 		newEntity = entity.lastAffectedByEntity ? { ...entity, lastAffectedByEntity: undefined } : entity;
	// 		return newEntity;
	// 	}),
	// 	board2.map(entity => {
	// 		let newEntity = entity.previousAttack
	// 			? { ...entity, previousAttack: undefined, attack: entity.previousAttack }
	// 			: entity;
	// 		newEntity = entity.attacking ? { ...entity, attacking: undefined } : entity;
	// 		newEntity = entity.lastAffectedByEntity ? { ...entity, lastAffectedByEntity: undefined } : entity;
	// 		return newEntity;
	// 	}),
	// ];
	// // console.log('after removing global modifiers', board1, board2);
	// return result;
};

const removeGlobalModifiersForEntity = (entity: BoardEntity): void => {
	if (entity.previousAttack) {
		entity.attack = entity.previousAttack;
	}
	entity.previousAttack = undefined;
	entity.attacking = undefined;
	entity.lastAffectedByEntity = undefined;
};

const mapEntity = (entity: BoardEntity, totalMurlocs: number): void => {
	if (
		[CardIds.Collectible.Neutral.OldMurkEye, CardIds.NonCollectible.Neutral.OldMurkEyeTavernBrawl].indexOf(
			entity.cardId,
		) !== -1
	) {
		applyMurkeyeBuff(entity, totalMurlocs);
	}
};

const applyMurkeyeBuff = (entity: BoardEntity, totalMurlocs: number): void => {
	entity.previousAttack = entity.attack;
	entity.attack += totalMurlocs * (entity.cardId === CardIds.Collectible.Neutral.OldMurkEye ? 1 : 2);
	// return {
	// 	...entity,
	// 	previousAttack: entity.attack,
	// 	attack: entity.attack + totalMurlocs * (entity.cardId === CardIds.Collectible.Neutral.OldMurkEye ? 1 : 2),
	// };
};
