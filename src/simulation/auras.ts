import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';

// Check if aura is already applied, and if not re-apply it
export const applyAuras = (board: readonly BoardEntity[], data: CardsData): readonly BoardEntity[] => {
	// There is a precondition earlier that if the board is empty we don't go in this method
	for (let i = 0; i < board.length; i++) {
		if (data.auraOrigins.indexOf(board[i].cardId) !== -1) {
			const enchantmentId = data.auraEnchantments.find(aura => aura[0] === board[i].cardId)[1];
			board = applyAura(board, i, enchantmentId);
		}
	}
	return board;
};

export const removeAuras = (board: readonly BoardEntity[], data: CardsData): readonly BoardEntity[] => {
	// There is a precondition earlier that if the board is empty we don't go in this method
	return board.map(entity => removeAurasFrom(entity, data));
};

const applyAura = (board: readonly BoardEntity[], i: number, enchantmentId: string): readonly BoardEntity[] => {
	switch (board[i].cardId) {
		case 'EX1_162':
		case 'TB_BaconUps_088':
			return applyDireWolfAura(board, i, enchantmentId);
	}
};

const removeAurasFrom = (entity: BoardEntity, data: CardsData): BoardEntity => {
	let newEntity = entity;
	for (const enchantment of entity.enchantments) {
		console.log('removing aura from', enchantment, entity.enchantments, entity);
		newEntity = removeAura(entity, enchantment.cardId);
		console.log(' aura removed', enchantment, newEntity.enchantments, newEntity);
	}
	return newEntity;
};

const removeAura = (entity: BoardEntity, enchantmentId: string): BoardEntity => {
	switch (enchantmentId) {
		case 'EX1_162e':
		case 'TB_BaconUps_088e':
			return removeDireWolfAura(entity, enchantmentId);
	}
	return entity;
};

const applyDireWolfAura = (board: readonly BoardEntity[], i: number, enchantmentId: string): readonly BoardEntity[] => {
	const boardCopy = [...board];
	if (
		i > 0 &&
		!board[i - 1].enchantments.some(
			aura => aura.cardId === enchantmentId && aura.originEntityId === board[i].entityId,
		)
	) {
		boardCopy[i - 1] = {
			...boardCopy[i - 1],
			attack: boardCopy[i - 1].attack + (enchantmentId === 'EX1_162e' ? 1 : 2),
			enchantments: [
				...boardCopy[i - 1].enchantments,
				{ cardId: enchantmentId, originEntityId: board[i].entityId },
			],
		} as BoardEntity;
	}

	if (
		i < board.length - 1 &&
		!board[i + 1].enchantments.some(
			aura => aura.cardId === enchantmentId && aura.originEntityId === board[i].entityId,
		)
	) {
		boardCopy[i + 1] = {
			...boardCopy[i + 1],
			attack: boardCopy[i + 1].attack + (enchantmentId === 'EX1_162e' ? 1 : 2),
			enchantments: [
				...boardCopy[i + 1].enchantments,
				{ cardId: enchantmentId, originEntityId: board[i].entityId },
			],
		} as BoardEntity;
	}
	return boardCopy;
};

const removeDireWolfAura = (entity: BoardEntity, enchantmentId: string): BoardEntity => {
	const numberOfBuffs = entity.enchantments.filter(e => e.cardId === enchantmentId).length;
	return {
		...entity,
		attack: entity.attack - numberOfBuffs * (enchantmentId === 'EX1_162e' ? 1 : 2),
		enchantments: entity.enchantments.filter(aura => aura.cardId !== enchantmentId),
	} as BoardEntity;
};
