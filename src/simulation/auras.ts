import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';

// Check if aura is already applied, and if not re-apply it
export const applyAuras = (
	board: readonly BoardEntity[],
	data: CardsData,
	cards: AllCardsService,
): readonly BoardEntity[] => {
	// There is a precondition earlier that if the board is empty we don't go in this method
	console.log('ready to apply auras', board);
	for (let i = 0; i < board.length; i++) {
		if (data.auraOrigins.indexOf(board[i].cardId) !== -1) {
			const enchantmentId = data.auraEnchantments.find(aura => aura[0] === board[i].cardId)[1];
			console.log('applying aura', enchantmentId, board);
			board = applyAura(board, i, enchantmentId, cards);
			console.log('applied aura', enchantmentId, board);
		}
	}
	return board;
};

export const removeAuras = (board: readonly BoardEntity[], data: CardsData): readonly BoardEntity[] => {
	// There is a precondition earlier that if the board is empty we don't go in this method
	return board.map(entity => removeAurasFrom(entity, data));
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

const applyAura = (
	board: readonly BoardEntity[],
	i: number,
	enchantmentId: string,
	cards: AllCardsService,
): readonly BoardEntity[] => {
	switch (board[i].cardId) {
		case CardIds.Collectible.Neutral.DireWolfAlpha:
		case CardIds.NonCollectible.Neutral.DireWolfAlphaTavernBrawl:
			return applyDireWolfAura(board, i, enchantmentId);
		case CardIds.Collectible.Warlock.Siegebreaker:
		case CardIds.NonCollectible.Warlock.SiegebreakerTavernBrawl:
			return applySiegebreakerAura(board, i, enchantmentId, cards);
		case CardIds.Collectible.Warlock.Malganis:
		case CardIds.NonCollectible.Warlock.MalganisTavernBrawl:
			return applyMalGanisAura(board, i, enchantmentId, cards);
		case CardIds.Collectible.Neutral.MurlocWarleader:
		case CardIds.NonCollectible.Neutral.MurlocWarleaderTavernBrawl:
			return applyMurlocWarleaderAura(board, i, enchantmentId, cards);
	}
};

const removeAura = (entity: BoardEntity, enchantmentId: string): BoardEntity => {
	switch (enchantmentId) {
		case CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantment:
		case CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantmentTavernBrawl:
			return removeDireWolfAura(entity, enchantmentId);
		case CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantment:
		case CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentTavernBrawl:
			return removeSiegebreakerAura(entity, enchantmentId);
		case CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantment:
		case CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantmentTavernBrawl:
			return removeMalGanisAura(entity, enchantmentId);
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantment:
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentTavernBrawl:
			return removeMurlocWarleaderAura(entity, enchantmentId);
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
			attack:
				boardCopy[i - 1].attack +
				(enchantmentId === CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantment ? 1 : 2),
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
			attack:
				boardCopy[i + 1].attack +
				(enchantmentId === CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantment ? 1 : 2),
			enchantments: [
				...boardCopy[i + 1].enchantments,
				{ cardId: enchantmentId, originEntityId: board[i].entityId },
			],
		} as BoardEntity;
	}
	return boardCopy;
};

const applySiegebreakerAura = (
	board: readonly BoardEntity[],
	index: number,
	enchantmentId: string,
	cards: AllCardsService,
): readonly BoardEntity[] => {
	const originEntity = board[index];
	const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || cards.getCard(entity.cardId).race !== 'DEMON') {
			// console.log('not applying aura', entity.cardId, cards.getCard(entity.cardId), i, index);
			newBoard.push(entity);
			continue;
		}

		if (
			!entity.enchantments.some(
				aura => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId,
			)
		) {
			const newEntity = {
				...entity,
				attack:
					entity.attack +
					(enchantmentId === CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantment ? 1 : 2),
				enchantments: [
					...entity.enchantments,
					{ cardId: enchantmentId, originEntityId: originEntity.entityId },
				],
			} as BoardEntity;
			newBoard.push(newEntity);
		}
	}
	return newBoard;
};

const applyMalGanisAura = (
	board: readonly BoardEntity[],
	index: number,
	enchantmentId: string,
	cards: AllCardsService,
): readonly BoardEntity[] => {
	const originEntity = board[index];
	const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || cards.getCard(entity.cardId).race !== 'DEMON') {
			// console.log('not applying aura', entity.cardId, cards.getCard(entity.cardId), i, index);
			newBoard.push(entity);
			continue;
		}

		if (
			!entity.enchantments.some(
				aura => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId,
			)
		) {
			const newEntity = {
				...entity,
				attack:
					entity.attack +
					(enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantment ? 2 : 4),
				health:
					entity.health +
					(enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantment ? 2 : 4),
				enchantments: [
					...entity.enchantments,
					{ cardId: enchantmentId, originEntityId: originEntity.entityId },
				],
			} as BoardEntity;
			newBoard.push(newEntity);
		}
	}
	return newBoard;
};

const applyMurlocWarleaderAura = (
	board: readonly BoardEntity[],
	index: number,
	enchantmentId: string,
	cards: AllCardsService,
): readonly BoardEntity[] => {
	const originEntity = board[index];
	const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || cards.getCard(entity.cardId).race !== 'MURLOC') {
			// console.log('not applying aura', entity.cardId, cards.getCard(entity.cardId), i, index);
			newBoard.push(entity);
			continue;
		}

		if (
			!entity.enchantments.some(
				aura => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId,
			)
		) {
			const newEntity = {
				...entity,
				attack:
					entity.attack +
					(enchantmentId === CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantment ? 2 : 4),
				enchantments: [
					...entity.enchantments,
					{ cardId: enchantmentId, originEntityId: originEntity.entityId },
				],
			} as BoardEntity;
			newBoard.push(newEntity);
		}
	}
	return newBoard;
};

const removeDireWolfAura = (entity: BoardEntity, enchantmentId: string): BoardEntity => {
	const numberOfBuffs = entity.enchantments.filter(e => e.cardId === enchantmentId).length;
	return {
		...entity,
		attack: Math.max(
			0,
			entity.attack -
				numberOfBuffs *
					(enchantmentId === CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantment
						? 1
						: 2),
		),
		enchantments: entity.enchantments.filter(aura => aura.cardId !== enchantmentId),
	} as BoardEntity;
};

const removeSiegebreakerAura = (entity: BoardEntity, enchantmentId: string): BoardEntity => {
	const numberOfBuffs = entity.enchantments.filter(e => e.cardId === enchantmentId).length;
	return {
		...entity,
		attack: Math.max(
			0,
			entity.attack -
				numberOfBuffs *
					(enchantmentId === CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantment ? 1 : 2),
		),
		enchantments: entity.enchantments.filter(aura => aura.cardId !== enchantmentId),
	} as BoardEntity;
};

const removeMalGanisAura = (entity: BoardEntity, enchantmentId: string): BoardEntity => {
	const numberOfBuffs = entity.enchantments.filter(e => e.cardId === enchantmentId).length;
	return {
		...entity,
		attack: Math.max(
			0,
			entity.attack -
				numberOfBuffs *
					(enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantment ? 2 : 4),
		),
		health: Math.max(
			1,
			entity.health -
				numberOfBuffs *
					(enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantment ? 2 : 4),
		),
		enchantments: entity.enchantments.filter(aura => aura.cardId !== enchantmentId),
	} as BoardEntity;
};

const removeMurlocWarleaderAura = (entity: BoardEntity, enchantmentId: string): BoardEntity => {
	const numberOfBuffs = entity.enchantments.filter(e => e.cardId === enchantmentId).length;
	return {
		...entity,
		attack: Math.max(
			0,
			entity.attack -
				numberOfBuffs *
					(enchantmentId === CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantment ? 2 : 4),
		),
		enchantments: entity.enchantments.filter(aura => aura.cardId !== enchantmentId),
	} as BoardEntity;
};
