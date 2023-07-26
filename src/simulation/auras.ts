/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from 'src/bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { hasCorrectTribe, normalizeCardIdForSkin } from '../utils';

export const setMissingAuras = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	allCards: AllCardsService,
): void => {
	setMissingMinionsAura(board, allCards);
	setMissingHeroPowerAura(board, boardHero, otherHero);
};

export const setMissingHeroPowerAura = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
): void => {
	// if (
	// 	boardHero.heroPowerId === CardIds.AllWillBurnBattlegrounds ||
	// 	otherHero.heroPowerId === CardIds.AllWillBurnBattlegrounds
	// ) {
	// 	const bonus =
	// 		(boardHero.heroPowerId === CardIds.AllWillBurnBattlegrounds ? 3 : 0) +
	// 		(otherHero.heroPowerId === CardIds.AllWillBurnBattlegrounds ? 3 : 0);
	// 	board
	// 		.filter(
	// 			(e) =>
	// 				!e.enchantments.find(
	// 					(ench) => ench.cardId === CardIds.AllWillBurn_AllWillBurnEnchantmentBattlegrounds,
	// 				),
	// 		)
	// 		.forEach((e) => {
	// 			e.attack += bonus;
	// 		});
	// }
	if (boardHero.heroPowerId === CardIds.TheSmokingGun) {
		board
			.filter(
				(e) =>
					!e.enchantments.find(
						(ench) => ench.cardId === CardIds.TheSmokingGun_ArmedAndStillSmokingEnchantment,
					),
			)
			.forEach((e) => {
				e.attack += 4;
			});
	}
	if (boardHero.heroPowerId === CardIds.VolatileVenom) {
		board
			.filter((e) => !e.enchantments.find((ench) => ench.cardId === CardIds.VolatileVenom_VolatileEnchantment))
			.forEach((e) => {
				e.attack += 7;
				e.health += 7;
				e.enchantments.push({
					cardId: CardIds.VolatileVenom_VolatileEnchantment,
					originEntityId: undefined,
					timing: 0,
				});
			});
	}
};

const setMissingMinionsAura = (board: BoardEntity[], allCards: AllCardsService): void => {
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.PIRATE, allCards)),
		CardIds.SouthseaCaptainLegacy_BG_NEW1_027,
		CardIds.SouthseaCaptain_YarrrVanillaEnchantment,
		1,
		1,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.PIRATE, allCards)),
		CardIds.SouthseaCaptainLegacy_TB_BaconUps_136,
		CardIds.SouthseaCaptain_YarrrEnchantment,
		2,
		2,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.MURLOC, allCards)),
		CardIds.MurlocWarleaderLegacy_BG_EX1_507,
		CardIds.MurlocWarleader_MrgglaarglLegacyEnchantment,
		2,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.MURLOC, allCards)),
		CardIds.MurlocWarleaderLegacy_BG_EX1_507,
		CardIds.MurlocWarleader_MrgglaarglEnchantment,
		4,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.BEAST, allCards)),
		CardIds.HummingBird_BG26_805,
		CardIds.HummingBird_EntrancedEnchantment_BG26_805e,
		2,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.BEAST, allCards)),
		CardIds.HummingBird_BG26_805_G,
		CardIds.HummingBird_EntrancedEnchantment_BG26_805_Ge,
		4,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.DEMON, allCards)),
		CardIds.Kathranatir_BG21_039,
		CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039e,
		2,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, Race.DEMON, allCards)),
		CardIds.Kathranatir_BG21_039_G,
		CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039_Ge,
		4,
		0,
	);
	setMissingAura(
		board,
		CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy,
		CardIds.DraconicBlessingEnchantment_TB_BaconShop_HERO_52_Buddy_e,
		3,
		0,
		false,
	);
	setMissingAura(
		board,
		CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G,
		CardIds.DraconicBlessingEnchantment_TB_BaconShop_HERO_52_Buddy_G_e,
		6,
		0,
		false,
	);
	setMissingAura(
		board.filter((e) => e.divineShield),
		CardIds.CyborgDrake_BG25_043,
		CardIds.CyborgDrake_CyborgEnhancementEnchantment_BG25_043e,
		6,
		0,
		false,
	);
	setMissingAura(
		board.filter((e) => e.divineShield),
		CardIds.CyborgDrake_BG25_043_G,
		CardIds.CyborgDrake_CyborgEnhancementEnchantment_BG25_043_Ge,
		12,
		0,
		false,
	);
};

const setMissingAura = (
	board: BoardEntity[],
	minionCardId: string,
	enchantmentCardId: string,
	attack: number,
	health: number,
	ignoreSelf = true,
	allCards: AllCardsService = null,
): void => {
	const buffers = board.filter((e) => e.cardId === minionCardId);
	for (const buffer of buffers) {
		board
			.filter((e) => !e.enchantments.find((ench) => ench.cardId === enchantmentCardId))
			.filter((e) => (ignoreSelf ? e.entityId !== buffer.entityId : true))
			.forEach((e) => {
				e.attack += attack;
				e.health += health;
			});
	}
};

export const setImplicitData = (board: BoardEntity[], cardsData: CardsData): void => {
	for (const entity of board) {
		entity.cardId = normalizeCardIdForSkin(entity.cardId);
		entity.maxHealth = Math.max(0, entity.health);
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
	hero.questRewardEntities = hero.questRewards.map((reward) => ({
		cardId: reward,
		avengeCurrent: 0,
		avengeDefault: cardsData.avengeValue(reward),
	}));
	hero.entityId = hero.entityId ?? (isPlayer ? 999_999_998 : 999_999_999);
	hero.hand = hero.hand ?? [];
	if (!hero.globalInfo) {
		hero.globalInfo = {
			EternalKnightsDeadThisGame: 0,
			UndeadAttackBonus: 0,
			FrostlingBonus: 0,
			BloodGemAttackBonus: 0,
			BloodGemHealthBonus: 0,
		};
	}
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
