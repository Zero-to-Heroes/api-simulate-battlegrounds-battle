/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { isCorrectTribe } from '../utils';

// Check if aura is already applied, and if not re-apply it
export const applyAuras = (board: BoardEntity[], numberOfDeathwingPresents: number, data: CardsData, cards: AllCardsService): void => {
	for (let i = 0; i < board.length; i++) {
		if (data.auraOrigins.indexOf(board[i].cardId) !== -1) {
			const enchantmentId = data.auraEnchantments.find((aura) => aura[0] === board[i].cardId)[1];
			applyAura(board, i, enchantmentId, cards);
		}
	}

	for (let i = 0; i < numberOfDeathwingPresents; i++) {
		applyDeathwingAura(board, CardIds.NonCollectible.Neutral.ALLWillBurn_AllWillBurnEnchantmentTavernBrawl);
	}
	// return board;
};

export const removeAuras = (board: BoardEntity[], data: CardsData): void => {
	for (const entity of board) {
		removeAurasFrom(entity, board, data);
	}
	// return board.map(entity => removeAurasFrom(entity, data));
};

const removeAurasFrom = (entity: BoardEntity, board: BoardEntity[], data: CardsData): void => {
	// let newEntity = entity;
	for (const enchantment of entity.enchantments) {
		removeAura(entity, enchantment.cardId, board);
	}
	// return newEntity;
};

const applyAura = (board: BoardEntity[], i: number, enchantmentId: string, cards: AllCardsService): void => {
	switch (board[i].cardId) {
		case CardIds.Collectible.Neutral.DireWolfAlpha:
		case CardIds.Collectible.Neutral.DireWolfAlphaCore:
		case CardIds.Collectible.Neutral.DireWolfAlphaVanilla:
		case CardIds.NonCollectible.Neutral.DireWolfAlphaTavernBrawl:
			applyDireWolfAura(board, i, enchantmentId);
			return;
		case CardIds.Collectible.Warlock.SiegebreakerLegacy:
		case CardIds.NonCollectible.Warlock.SiegebreakerTavernBrawl:
			applySiegebreakerAura(board, i, enchantmentId, cards);
			return;
		case CardIds.Collectible.Warlock.Malganis:
		case CardIds.NonCollectible.Warlock.MalganisTavernBrawl:
			applyMalGanisAura(board, i, enchantmentId, cards);
			return;
		case CardIds.Collectible.Neutral.MurlocWarleader:
		case CardIds.Collectible.Neutral.MurlocWarleaderVanilla:
		case CardIds.NonCollectible.Neutral.MurlocWarleaderTavernBrawl:
			applyMurlocWarleaderAura(board, i, enchantmentId, cards);
			return;
		case CardIds.Collectible.Neutral.SouthseaCaptain:
		case CardIds.Collectible.Neutral.SouthseaCaptainCore:
		case CardIds.Collectible.Neutral.SouthseaCaptainVanilla:
		case CardIds.NonCollectible.Neutral.SouthseaCaptainTavernBrawl:
			applySouthseaCaptainAura(board, i, enchantmentId, cards);
			return;
	}
};

const removeAura = (entity: BoardEntity, enchantmentId: string, board: BoardEntity[]): void => {
	switch (enchantmentId) {
		case CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantment:
		case CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantmentTavernBrawl:
			removeDireWolfAura(entity, enchantmentId);
			return;
		case CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantment:
		case CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentTavernBrawl:
			removeSiegebreakerAura(entity, enchantmentId);
			return;
		case CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantment:
		case CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantmentTavernBrawl:
			removeMalGanisAura(entity, enchantmentId);
			return;
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglLegacyEnchantment:
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglVanillaEnchantment:
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentTavernBrawl:
			removeMurlocWarleaderAura(entity, enchantmentId);
			return;
		case CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantment:
		case CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrVanillaEnchantment:
		case CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentTavernBrawl:
			removeSouthseaCaptainAura(entity, enchantmentId, board);
			return;
		case CardIds.NonCollectible.Neutral.ALLWillBurn_AllWillBurnEnchantmentTavernBrawl:
			removeDeathwingAura(entity, enchantmentId);
			return;
		// case CardIds.NonCollectible.Warrior.WhirlwindTempest_WhirlingEnchantment:
		// 	removeWhirlwindTempestAura(entity, enchantmentId);
		// 	return;
	}
};

const applyDireWolfAura = (board: BoardEntity[], i: number, enchantmentId: string): void => {
	if (i > 0 && !board[i - 1].enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === board[i].entityId)) {
		board[i - 1].attack +=
			enchantmentId === CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantmentTavernBrawl ? 2 : 1;
		board[i - 1].enchantments.push({ cardId: enchantmentId, originEntityId: board[i].entityId });
	}

	if (
		i < board.length - 1 &&
		!board[i + 1].enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === board[i].entityId)
	) {
		board[i + 1].attack +=
			enchantmentId === CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantmentTavernBrawl ? 2 : 1;
		board[i + 1].enchantments.push({ cardId: enchantmentId, originEntityId: board[i].entityId });
	}
	// return boardCopy;
};

const applyDeathwingAura = (board: BoardEntity[], enchantmentId: string): void => {
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId)) {
			entity.attack += 2;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: undefined });
		}
	}
};

const applySiegebreakerAura = (board: BoardEntity[], index: number, enchantmentId: string, cards: AllCardsService): void => {
	const originEntity = board[index];
	// const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.DEMON)) {
			// newBoard.push(entity);
			continue;
		}

		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
			entity.attack += enchantmentId === CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentTavernBrawl ? 2 : 1;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId });
		}
	}
};

const applyMalGanisAura = (board: BoardEntity[], index: number, enchantmentId: string, cards: AllCardsService): void => {
	const originEntity = board[index];
	// const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.DEMON)) {
			// newBoard.push(entity);
			continue;
		}

		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
			entity.attack += enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantmentTavernBrawl ? 4 : 2;
			entity.health += enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantmentTavernBrawl ? 4 : 2;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId });
		}
	}
	// return newBoard;
};

const removeDireWolfAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(
		0,
		entity.attack -
			numberOfBuffs *
				(enchantmentId === CardIds.NonCollectible.Neutral.DireWolfAlpha_StrengthOfThePackEnchantmentTavernBrawl ? 2 : 1),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const removeDeathwingAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(0, entity.attack - numberOfBuffs * 2);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const removeSiegebreakerAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(
		0,
		entity.attack -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentTavernBrawl ? 2 : 1),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const removeMalGanisAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(
		0,
		entity.attack -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantmentTavernBrawl ? 4 : 2),
	);
	entity.health = Math.max(
		1,
		entity.health -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Warlock.MalGanis_GraspOfMalganisEnchantmentTavernBrawl ? 4 : 2),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const applyMurlocWarleaderAura = (board: BoardEntity[], index: number, enchantmentId: string, cards: AllCardsService): void => {
	const originEntity = board[index];
	// const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.MURLOC)) {
			// newBoard.push(entity);
			continue;
		}

		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
			entity.attack += enchantmentId === CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentTavernBrawl ? 4 : 2;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId });
		}
	}
	// return newBoard;
};

const removeMurlocWarleaderAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId && e.originEntityId !== entity.entityId).length;
	entity.attack = Math.max(
		0,
		entity.attack -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentTavernBrawl ? 4 : 2),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const applySouthseaCaptainAura = (board: BoardEntity[], index: number, enchantmentId: string, cards: AllCardsService): void => {
	const originEntity = board[index];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.PIRATE)) {
			continue;
		}

		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
			entity.attack += enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentTavernBrawl ? 2 : 1;
			entity.health += enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentTavernBrawl ? 2 : 1;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId });
		}
	}
	// return newBoard;
};

const removeSouthseaCaptainAura = (entity: BoardEntity, enchantmentId: string, board: BoardEntity[]): void => {
	const debug = false && entity.entityId === 3879;
	if (debug) {
	}
	const buffs = entity.enchantments.filter((e) => e.cardId === enchantmentId && e.originEntityId !== entity.entityId);
	const numberOfBuffs = buffs.length;
	if (debug) {
		console.log(
			'buffs',
			entity.enchantments.filter((e) => e.cardId === enchantmentId && e.originEntityId !== entity.entityId),
		);
	}
	// TODO: there is an issue here. If the minion's health at the end of the turn should be 1, removing then reapplying
	// the aura actually bumps it to 2
	// If the buffing entity is still alive, we should ignore this max
	// However, for now there's a bug, as the app originates the enchantment from an entity ID
	// that isn't on the board
	// const existingEnchantingEntity = board.filter((e) => buffs.map((b) => b.originEntityId).includes(e.entityId));
	// const isBuffingEntityAlive = existingEnchantingEntity.length > 0;
	entity.attack = Math.max(
		0,
		entity.attack -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentTavernBrawl ? 2 : 1),
	);
	entity.health = Math.max(
		1,
		entity.health -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentTavernBrawl ? 2 : 1),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
	if (debug) {
	}
};
