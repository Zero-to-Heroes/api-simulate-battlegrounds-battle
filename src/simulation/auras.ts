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
		applyDeathwingAura(board, CardIds.NonCollectible.Neutral.AllWillBurn_AllWillBurnEnchantmentBattlegrounds);
	}
	// return board;
};

export const setImplicitData = (board: BoardEntity[], cardsData: CardsData): void => {
	for (const entity of board) {
		entity.maxHealth = entity.health;
		const avengeValue = cardsData.avengeValue(entity.cardId);
		if (avengeValue > 0) {
			entity.avengeCurrent = avengeValue;
			entity.avengeDefault = avengeValue;
	}
};

export const removeAuras = (board: BoardEntity[], data: CardsData): void => {
	for (const entity of board) {
		removeAurasFrom(entity, board, data);
	}
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
		case CardIds.Collectible.Warlock.SiegebreakerLegacy:
		case CardIds.NonCollectible.Warlock.SiegebreakerBattlegrounds:
			applySiegebreakerAura(board, i, enchantmentId, cards);
			return;
		case CardIds.Collectible.Warlock.Malganis1:
		case CardIds.NonCollectible.Warlock.MalganisBattlegrounds:
			applyMalGanisAura(board, i, enchantmentId, cards);
			return;
		case CardIds.Collectible.Neutral.MurlocWarleaderLegacy:
		case CardIds.Collectible.Neutral.MurlocWarleaderVanilla:
		case CardIds.NonCollectible.Neutral.MurlocWarleaderBattlegrounds:
			applyMurlocWarleaderAura(board, i, enchantmentId, cards);
			return;
		case CardIds.Collectible.Neutral.SouthseaCaptainLegacy:
		case CardIds.Collectible.Neutral.SouthseaCaptainCore:
		case CardIds.Collectible.Neutral.SouthseaCaptainVanilla:
		case CardIds.NonCollectible.Neutral.SouthseaCaptainBattlegrounds:
			applySouthseaCaptainAura(board, i, enchantmentId, cards);
			return;
	}
};

const removeAura = (entity: BoardEntity, enchantmentId: string, board: BoardEntity[]): void => {
	switch (enchantmentId) {
		case CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingLegacyEnchantment:
		case CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentBattlegrounds:
			removeSiegebreakerAura(entity, enchantmentId);
			return;
		case CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantment:
		case CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantmentBattlegrounds:
			removeMalGanisAura(entity, enchantmentId);
			return;
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglLegacyEnchantment:
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglVanillaEnchantment:
		case CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds:
			removeMurlocWarleaderAura(entity, enchantmentId);
			return;
		case CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrLegacyEnchantment:
		case CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrVanillaEnchantment:
		case CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentBattlegrounds:
			removeSouthseaCaptainAura(entity, enchantmentId, board);
			return;
		case CardIds.NonCollectible.Neutral.AllWillBurn_AllWillBurnEnchantmentBattlegrounds:
			removeDeathwingAura(entity, enchantmentId);
			return;
		// case CardIds.NonCollectible.Warrior.WhirlwindTempest_WhirlingEnchantment:
		// 	removeWhirlwindTempestAura(entity, enchantmentId);
		// 	return;
	}
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
			entity.attack += enchantmentId === CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentBattlegrounds ? 2 : 1;
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
			entity.attack += enchantmentId === CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2;
			entity.health += enchantmentId === CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2;
			entity.maxHealth += enchantmentId === CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId });
		}
	}
	// return newBoard;
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
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Warlock.Siegebreaker_SiegebreakingEnchantmentBattlegrounds ? 2 : 1),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const removeMalGanisAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(
		0,
		entity.attack -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2),
	);
	entity.health = Math.max(
		1,
		entity.health -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Warlock.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2),
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
			entity.attack += enchantmentId === CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds ? 4 : 2;
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
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Neutral.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds ? 4 : 2),
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
			entity.attack += enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1;
			entity.health += enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1;
			entity.maxHealth += enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1;
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
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1),
	);
	entity.health = Math.max(
		1,
		entity.health -
			numberOfBuffs * (enchantmentId === CardIds.NonCollectible.Neutral.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
	if (debug) {
	}
};
