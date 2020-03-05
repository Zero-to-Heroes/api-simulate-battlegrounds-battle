/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';

// Check if aura is already applied, and if not re-apply it
export const applyGlobalModifiers = (
	board1: readonly BoardEntity[],
	board2: readonly BoardEntity[],
	data: CardsData,
	cards: AllCardsService,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	const totalMurlocs =
		board1.map(entity => cards.getCard(entity.cardId).race).filter(race => race === 'MURLOC').length +
		board2.map(entity => cards.getCard(entity.cardId).race).filter(race => race === 'MURLOC').length;
	return [
		board1.map(entity => mapEntity(entity, totalMurlocs)),
		board2.map(entity => mapEntity(entity, totalMurlocs)),
	];
};

export const removeGlobalModifiers = (
	board1: readonly BoardEntity[],
	board2: readonly BoardEntity[],
	data: CardsData,
	cards: AllCardsService,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	return [
		board1.map(entity => {
			let newEntity = entity.previousAttack
				? { ...entity, previousAttack: undefined, attack: entity.previousAttack }
				: entity;
			newEntity = entity.attacking ? { ...entity, attacking: undefined } : entity;
			newEntity = entity.lastAffectedByEntity ? { ...entity, lastAffectedByEntity: undefined } : entity;
			return newEntity;
		}),
		board2.map(entity => {
			let newEntity = entity.previousAttack
				? { ...entity, previousAttack: undefined, attack: entity.previousAttack }
				: entity;
			newEntity = entity.attacking ? { ...entity, attacking: undefined } : entity;
			newEntity = entity.lastAffectedByEntity ? { ...entity, lastAffectedByEntity: undefined } : entity;
			return newEntity;
		}),
	];
};

const mapEntity = (entity: BoardEntity, totalMurlocs: number): BoardEntity => {
	return [CardIds.Collectible.Neutral.OldMurkEye, CardIds.NonCollectible.Neutral.OldMurkEyeTavernBrawl].indexOf(
		entity.cardId,
	) !== -1
		? applyMurkeyeBuff(entity, totalMurlocs)
		: entity;
};

const applyMurkeyeBuff = (entity: BoardEntity, totalMurlocs: number): BoardEntity => {
	return {
		...entity,
		previousAttack: entity.attack,
		attack: entity.attack + totalMurlocs * (entity.cardId === CardIds.Collectible.Neutral.OldMurkEye ? 1 : 2),
	};
};
