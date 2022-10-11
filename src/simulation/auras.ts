/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from 'src/bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { AURA_ENCHANTMENTS, AURA_ORIGINS, CardsData } from '../cards/cards-data';
import { isCorrectTribe, normalizeCardIdForSkin } from '../utils';
import { SharedState } from './shared-state';

// Check if aura is already applied, and if not re-apply it
export const applyAuras = (
	board: BoardEntity[],
	numberOfDeathwingPresents: number,
	isSmokingGunPresent: boolean,
	data: CardsData,
	cards: AllCardsService,
	sharedState: SharedState,
): void => {
	for (let i = 0; i < board.length; i++) {
		if (AURA_ORIGINS.indexOf(board[i].cardId) !== -1) {
			const enchantmentId = AURA_ENCHANTMENTS.find((aura) => aura[0] === board[i].cardId)[1];
			applyAura(board, i, enchantmentId, cards, sharedState);
		}
	}

	for (let i = 0; i < numberOfDeathwingPresents; i++) {
		applyDeathwingAura(board, CardIds.AllWillBurn_AllWillBurnEnchantmentBattlegrounds, sharedState);
	}
	if (isSmokingGunPresent) {
		applySmokingGunAura(board, CardIds.TheSmokingGun_ArmedAndStillSmokingEnchantment, sharedState);
	}
	// return board;
};

export const setImplicitData = (board: BoardEntity[], cardsData: CardsData): void => {
	for (const entity of board) {
		entity.cardId = normalizeCardIdForSkin(entity.cardId);
		entity.maxHealth = entity.health;
		const avengeValue = cardsData.avengeValue(entity.cardId);
		if (avengeValue > 0) {
			entity.avengeCurrent = avengeValue;
			entity.avengeDefault = avengeValue;
		}
		entity.immuneWhenAttackCharges = 0;
	}
};

export const setImplicitDataHero = (hero: BgsPlayerEntity, cardsData: CardsData, isPlayer: boolean): void => {
	const avengeValue = cardsData.avengeValue(hero.heroPowerId);
	if (avengeValue > 0) {
		hero.avengeCurrent = avengeValue;
		hero.avengeDefault = avengeValue;
	}
	// Backward compatibility
	if (!!hero.questRewards?.length && !Array.isArray(hero.questRewards)) {
		hero.questRewards = [hero.questRewards as any];
	}

	// Because Denathrius can send a quest reward as its hero power (I think)
	hero.questRewards = [...(hero.questRewards ?? []), hero.heroPowerId].filter((e) => !!e);
	hero.entityId = hero.entityId ?? (isPlayer ? 999_999_998 : 999_999_999);
};

export const clearStealthIfNeeded = (board: BoardEntity[], otherBoard: BoardEntity[]): void => {
	// https://twitter.com/DCalkosz/status/1562194944688660481?s=20&t=100I8IVZmBKgYQWkdK8nIA
	if (board.every((entity) => entity.stealth && !entity.attack)) {
		board.forEach((e) => (e.stealth = false));
	}
	if (otherBoard.every((entity) => entity.stealth && !entity.attack)) {
		otherBoard.forEach((e) => (e.stealth = false));
	}
	if (board.every((e) => e.stealth) && otherBoard.every((e) => e.stealth)) {
		board.forEach((e) => (e.stealth = false));
		otherBoard.forEach((e) => (e.stealth = false));
	}
};

// When removing and applying auras without any action in-between (like for attackImmediately minions),
// we use this hack to avoid granting additional health to minions that would end at 0 HP
// once the aura is removed (eg two Southsea Captains)
export const removeAuras = (board: BoardEntity[], data: CardsData, allowNegativeHealth = false): void => {
	for (const entity of board) {
		removeAurasFrom(entity, board, data, allowNegativeHealth);
	}
};

export const removeAurasAfterAuraSourceDeath = (board: BoardEntity[], auraSource: BoardEntity, data: CardsData): void => {
	const auraPair = AURA_ENCHANTMENTS.find((pair) => pair[0] === auraSource.cardId);
	const auraEnchantmentId = !!auraPair ? auraPair[1] : null;
	if (!auraEnchantmentId) {
		return;
	}

	for (const entity of board) {
		removeAura(entity, auraEnchantmentId, board, false, auraSource);
	}
};

const removeAurasFrom = (entity: BoardEntity, board: BoardEntity[], data: CardsData, allowNegativeHealth: boolean): void => {
	// let newEntity = entity;
	for (const enchantment of entity.enchantments ?? []) {
		removeAura(entity, enchantment.cardId, board, allowNegativeHealth);
	}
	// return newEntity;
};

const applyAura = (board: BoardEntity[], i: number, enchantmentId: string, cards: AllCardsService, sharedState: SharedState): void => {
	switch (board[i].cardId) {
		// case CardIds.SiegebreakerLegacy:
		// case CardIds.SiegebreakerBattlegrounds:
		// 	applySiegebreakerAura(board, i, enchantmentId, cards);
		// 	return;
		// case CardIds.Malganis1:
		// case CardIds.MalganisBattlegrounds:
		// 	applyMalGanisAura(board, i, enchantmentId, cards);
		// 	return;
		case CardIds.Kathranatir_BG21_039:
		case CardIds.KathranatirBattlegrounds:
			applyKathranatirAura(board, i, enchantmentId, cards, sharedState);
			return;
		case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
		case CardIds.MurlocWarleaderVanilla:
		case CardIds.MurlocWarleaderLegacyBattlegrounds:
			applyMurlocWarleaderAura(board, i, enchantmentId, cards, sharedState);
			return;
		case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
		case CardIds.SouthseaCaptainCore:
		case CardIds.SouthseaCaptainVanilla:
		case CardIds.SouthseaCaptainLegacyBattlegrounds:
			applySouthseaCaptainAura(board, i, enchantmentId, cards, sharedState);
			return;
		case CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy:
		case CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy_G:
			applyLadySinestraAura(board, i, enchantmentId, sharedState);
			return;
	}
};

const removeAura = (
	entity: BoardEntity,
	enchantmentId: string,
	board: BoardEntity[],
	allowNegativeHealth: boolean,
	deadAuraSource: BoardEntity = null,
): void => {
	switch (enchantmentId) {
		// case CardIds.Siegebreaker_SiegebreakingLegacyEnchantment:
		// case CardIds.Siegebreaker_SiegebreakingEnchantmentBattlegrounds:
		// 	removeSiegebreakerAura(entity, enchantmentId);
		// 	return;
		// case CardIds.Malganis_GraspOfMalganisEnchantment:
		// case CardIds.Malganis_GraspOfMalganisEnchantmentBattlegrounds:
		// 	removeMalGanisAura(entity, enchantmentId);
		// 	return;
		case CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039e:
		case CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039_Ge:
			removeKathranatirAura(entity, enchantmentId);
			return;
		case CardIds.MurlocWarleader_MrgglaarglLegacyEnchantment:
		case CardIds.MurlocWarleader_MrgglaarglVanillaEnchantment:
		case CardIds.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds:
			removeMurlocWarleaderAura(entity, enchantmentId);
			return;
		case CardIds.SouthseaCaptain_YarrrLegacyEnchantment:
		case CardIds.SouthseaCaptain_YarrrVanillaEnchantment:
		case CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds:
			removeSouthseaCaptainAura(entity, enchantmentId, board, allowNegativeHealth, deadAuraSource);
			return;
		// TODO find proper enchantment
		case CardIds.DraconicBlessingEnchantmentBattlegrounds_TB_BaconShop_HERO_52_Buddy_e:
		case CardIds.DraconicBlessingEnchantmentBattlegrounds_TB_BaconShop_HERO_52_Buddy_G_e:
			removeLadySinestraAura(entity, enchantmentId);
			return;
		case CardIds.AllWillBurn_AllWillBurnEnchantmentBattlegrounds:
			removeDeathwingAura(entity, enchantmentId);
			return;
		case CardIds.TheSmokingGun_ArmedAndStillSmokingEnchantment:
			removeSmokingGunAura(entity, enchantmentId);
			return;
		// case CardIds.WhirlwindTempest_WhirlingEnchantment:
		// 	removeWhirlwindTempestAura(entity, enchantmentId);
		// 	return;
	}
};

const applyDeathwingAura = (board: BoardEntity[], enchantmentId: string, sharedState: SharedState): void => {
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId)) {
			entity.attack += 3;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: undefined, timing: sharedState.currentEntityId++ });
		}
	}
};

const applySmokingGunAura = (board: BoardEntity[], enchantmentId: string, sharedState: SharedState): void => {
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId)) {
			entity.attack += 5;
			entity.enchantments.push({ cardId: enchantmentId, originEntityId: undefined, timing: sharedState.currentEntityId++ });
		}
	}
};

// const applySiegebreakerAura = (board: BoardEntity[], index: number, enchantmentId: string, cards: AllCardsService): void => {
// 	const originEntity = board[index];
// 	// const newBoard = [];
// 	for (let i = 0; i < board.length; i++) {
// 		const entity = board[i];
// 		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.DEMON)) {
// 			// newBoard.push(entity);
// 			continue;
// 		}

// 		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
// 			entity.attack += enchantmentId === CardIds.Siegebreaker_SiegebreakingEnchantmentBattlegrounds ? 2 : 1;
// 			entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId });
// 		}
// 	}
// };

// const applyMalGanisAura = (board: BoardEntity[], index: number, enchantmentId: string, cards: AllCardsService): void => {
// 	const originEntity = board[index];
// 	// const newBoard = [];
// 	for (let i = 0; i < board.length; i++) {
// 		const entity = board[i];
// 		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.DEMON)) {
// 			// newBoard.push(entity);
// 			continue;
// 		}

// 		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
// 			entity.attack += enchantmentId === CardIds.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2;
// 			entity.health += enchantmentId === CardIds.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2;
// 			entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId });
// 		}
// 	}
// 	// return newBoard;
// };

const applyKathranatirAura = (
	board: BoardEntity[],
	index: number,
	enchantmentId: string,
	cards: AllCardsService,
	sharedState: SharedState,
): void => {
	const originEntity = board[index];
	// const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.DEMON)) {
			// newBoard.push(entity);
			continue;
		}

		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
			entity.attack += enchantmentId === CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039_Ge ? 4 : 2;
			entity.enchantments.push({
				cardId: enchantmentId,
				originEntityId: originEntity.entityId,
				timing: sharedState.currentEntityId++,
			});
		}
	}
	// return newBoard;
};

const removeDeathwingAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(0, entity.attack - numberOfBuffs * 3);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const removeSmokingGunAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(0, entity.attack - numberOfBuffs * 5);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

// const removeSiegebreakerAura = (entity: BoardEntity, enchantmentId: string): void => {
// 	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
// 	entity.attack = Math.max(
// 		0,
// 		entity.attack - numberOfBuffs * (enchantmentId === CardIds.Siegebreaker_SiegebreakingEnchantmentBattlegrounds ? 2 : 1),
// 	);
// 	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
// };

// const removeMalGanisAura = (entity: BoardEntity, enchantmentId: string): void => {
// 	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
// 	entity.attack = Math.max(
// 		0,
// 		entity.attack - numberOfBuffs * (enchantmentId === CardIds.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2),
// 	);
// 	entity.health = Math.max(
// 		1,
// 		entity.health - numberOfBuffs * (enchantmentId === CardIds.Malganis_GraspOfMalganisEnchantmentBattlegrounds ? 4 : 2),
// 	);
// 	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
// };

const removeKathranatirAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	entity.attack = Math.max(
		0,
		entity.attack - numberOfBuffs * (enchantmentId === CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039_Ge ? 4 : 2),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const applyMurlocWarleaderAura = (
	board: BoardEntity[],
	index: number,
	enchantmentId: string,
	cards: AllCardsService,
	sharedState: SharedState,
): void => {
	const originEntity = board[index];
	// const newBoard = [];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.MURLOC)) {
			// newBoard.push(entity);
			continue;
		}

		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
			entity.attack += enchantmentId === CardIds.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds ? 4 : 2;
			entity.enchantments.push({
				cardId: enchantmentId,
				originEntityId: originEntity.entityId,
				timing: sharedState.currentEntityId++,
			});
		}
	}
	// return newBoard;
};

const removeMurlocWarleaderAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId && e.originEntityId !== entity.entityId).length;
	entity.attack = Math.max(
		0,
		entity.attack - numberOfBuffs * (enchantmentId === CardIds.MurlocWarleader_MrgglaarglEnchantmentBattlegrounds ? 4 : 2),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};

const applySouthseaCaptainAura = (
	board: BoardEntity[],
	index: number,
	enchantmentId: string,
	cards: AllCardsService,
	sharedState: SharedState,
): void => {
	const originEntity = board[index];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		if (i === index || !isCorrectTribe(cards.getCard(entity.cardId).race, Race.PIRATE)) {
			continue;
		}

		// console.log('applying aura', stringifySimpleCard(entity), entity.maxHealth);
		if (!entity.enchantments.some((aura) => aura.cardId === enchantmentId && aura.originEntityId === originEntity.entityId)) {
			entity.attack += enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1;
			entity.health += enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1;
			// entity.maxHealth += enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1;
			entity.enchantments.push({
				cardId: enchantmentId,
				originEntityId: originEntity.entityId,
				timing: sharedState.currentEntityId++,
			});
		}
	}
	// return newBoard;
};

const applyLadySinestraAura = (board: BoardEntity[], index: number, enchantmentId: string, sharedState: SharedState): void => {
	const originEntity = board[index];
	for (let i = 0; i < board.length; i++) {
		const entity = board[i];
		// TODO find proper enchantment
		entity.attack += enchantmentId === CardIds.DraconicBlessingEnchantmentBattlegrounds_TB_BaconShop_HERO_52_Buddy_G_e ? 6 : 3;
		entity.enchantments.push({ cardId: enchantmentId, originEntityId: originEntity.entityId, timing: sharedState.currentEntityId++ });
	}
};

const removeSouthseaCaptainAura = (
	entity: BoardEntity,
	enchantmentId: string,
	board: BoardEntity[],
	allowNegativeHealth: boolean,
	deadAuraSource: BoardEntity = null,
): void => {
	if (!deadAuraSource) {
		// console.log('removing aura', stringifySimpleCard(entity), entity.maxHealth);
		const buffs = entity.enchantments.filter((e) => e.cardId === enchantmentId && e.originEntityId !== entity.entityId);
		const numberOfBuffs = buffs.length;

		entity.attack = Math.max(
			0,
			entity.attack - numberOfBuffs * (enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1),
		);

		entity.health = Math.max(
			allowNegativeHealth ? -999 : 1,
			entity.health - numberOfBuffs * (enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1),
		);
		entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
		// console.log('removed aura', stringifySimpleCard(entity), entity.maxHealth);
	}
	// Special case where the source dies, health is treated differently
	else {
		// console.log('removing aura after source death', stringifySimpleCard(entity), stringifySimpleCard(deadAuraSource), entity.maxHealth);
		const buffs = entity.enchantments.filter((e) => e.cardId === enchantmentId && e.originEntityId === deadAuraSource.entityId);
		const numberOfBuffs = buffs.length;

		entity.attack = Math.max(
			0,
			entity.attack - numberOfBuffs * (enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1),
		);
		// This doesn't work, as if you have a buffed pirate that is 4/2 (after aura) and the aura source dies, it just stays where it is
		// instead of losing the health buff
		// entity.health = entity.maxHealth
		// 	? Math.min(entity.health, entity.maxHealth)
		// 	: Math.max(
		// 			allowNegativeHealth ? -999 : 1,
		// 			entity.health - numberOfBuffs * (enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1),
		// 	  );
		entity.health = Math.max(
			allowNegativeHealth ? -999 : 1,
			entity.health - numberOfBuffs * (enchantmentId === CardIds.SouthseaCaptain_YarrrEnchantmentBattlegrounds ? 2 : 1),
		);
		entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
		// console.log('removed aura after source death', stringifySimpleCard(entity), entity.maxHealth);
	}
};

const removeLadySinestraAura = (entity: BoardEntity, enchantmentId: string): void => {
	const numberOfBuffs = entity.enchantments.filter((e) => e.cardId === enchantmentId).length;
	// TODO: find proper enchantment
	entity.attack = Math.max(
		0,
		entity.attack -
			numberOfBuffs * (enchantmentId === CardIds.DraconicBlessingEnchantmentBattlegrounds_TB_BaconShop_HERO_52_Buddy_G_e ? 6 : 3),
	);
	entity.enchantments = entity.enchantments.filter((aura) => aura.cardId !== enchantmentId);
};
