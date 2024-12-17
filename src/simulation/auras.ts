/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { updateStealth } from '../keywords/stealth';
import { hasCorrectTribe } from '../utils';
import { FullGameState } from './internal-game-state';

export const setMissingAuras = (board: BoardEntity[], boardHero: BgsPlayerEntity, allCards: AllCardsService): void => {
	setMissingMinionsAura(board, boardHero, allCards);
	setMissingHeroPowerAura(board, boardHero);
	setMissingTrinketAura(board, boardHero);
};

export const setMissingTrinketAura = (board: BoardEntity[], boardHero: BgsPlayerEntity): void => {
	for (const trinket of boardHero.trinkets ?? []) {
		switch (trinket.cardId) {
			case CardIds.WindrunnerNecklace_BG30_MagicItem_997:
			case CardIds.WindrunnerNecklace_WindrunnerNecklaceToken_BG30_MagicItem_997t:
				const enchantment =
					trinket.cardId === CardIds.WindrunnerNecklace_BG30_MagicItem_997
						? CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e
						: CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e2;
				const buff = trinket.cardId === CardIds.WindrunnerNecklace_BG30_MagicItem_997 ? 8 : 20;
				const target = board[0];
				if (!!target && !target.enchantments?.find((e) => e.cardId === enchantment)) {
					target.attack += buff;
					target.enchantments.push({
						cardId: enchantment,
						originEntityId: trinket.entityId,
						timing: 0,
					});
				}
				break;
		}
	}
};

export const setMissingHeroPowerAura = (board: BoardEntity[], boardHero: BgsPlayerEntity): void => {
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

const setMissingMinionsAura = (board: BoardEntity[], boardHero: BgsPlayerEntity, allCards: AllCardsService): void => {
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.PIRATE, allCards)),
		CardIds.SouthseaCaptainLegacy_BG_NEW1_027,
		CardIds.SouthseaCaptain_YarrrVanillaEnchantment,
		1,
		1,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.PIRATE, allCards)),
		CardIds.SouthseaCaptainLegacy_TB_BaconUps_136,
		CardIds.SouthseaCaptain_YarrrEnchantment,
		2,
		2,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.MURLOC, allCards)),
		CardIds.MurlocWarleaderLegacy_BG_EX1_507,
		CardIds.MurlocWarleader_MrgglaarglLegacyEnchantment,
		2,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.MURLOC, allCards)),
		CardIds.MurlocWarleaderLegacy_BG_EX1_507,
		CardIds.MurlocWarleader_MrgglaarglEnchantment,
		4,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.DEMON, allCards)),
		CardIds.Kathranatir_BG21_039,
		CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039e,
		2,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.DEMON, allCards)),
		CardIds.Kathranatir_BG21_039_G,
		CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039_Ge,
		4,
		0,
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
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.UNDEAD, allCards)),
		CardIds.SoreLoser_BG27_030,
		CardIds.SoreLoser_NoImWinningEnchantment_BG27_030e,
		boardHero.tavernTier,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.UNDEAD, allCards)),
		CardIds.SoreLoser_BG27_030_G,
		CardIds.SoreLoser_NoImWinningEnchantment_BG27_030e,
		2 * boardHero.tavernTier,
		0,
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

export const setImplicitDataHero = (
	hero: BgsPlayerEntity,
	cardsData: CardsData,
	isPlayer: boolean,
	entityIdContainer: { entityId: number },
): void => {
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
	const heroPowerAsReward = hero.cardId === CardIds.SireDenathrius_BG24_HERO_100 ? hero.heroPowerId : null;
	hero.questRewards = [...(hero.questRewards ?? []), heroPowerAsReward].filter((e) => !!e);
	hero.questRewardEntities = hero.questRewardEntities
		? hero.questRewardEntities.map((reward: any) => ({
				cardId: reward.CardId,
				scriptDataNum1: reward.ScriptDataNum1 ?? 0,
				entityId: entityIdContainer.entityId--,
				avengeDefault: cardsData.avengeValue(reward.CardId),
				avengeCurrent: cardsData.avengeValue(reward.CardId),
		  }))
		: hero.questRewards.map((reward) => ({
				cardId: reward,
				entityId: entityIdContainer.entityId--,
				avengeCurrent: cardsData.avengeValue(reward),
				avengeDefault: cardsData.avengeValue(reward),
				scriptDataNum1: cardsData.defaultScriptDataNum(reward),
		  }));
	hero.trinkets = (hero.trinkets ?? []).map((trinket) => ({
		...trinket,
		avengeDefault: cardsData.avengeValue(trinket.cardId),
		avengeCurrent: cardsData.avengeValue(trinket.cardId),
		scriptDataNum1: cardsData.defaultScriptDataNum(trinket.cardId),
	}));
	// 0 is not a valid entityId
	hero.entityId = hero.entityId || entityIdContainer.entityId--;
	hero.hand = hero.hand ?? [];
	if (!hero.globalInfo) {
		hero.globalInfo = {};
	}

	hero.globalInfo.EternalKnightsDeadThisGame = hero.globalInfo.EternalKnightsDeadThisGame ?? 0;
	hero.globalInfo.SanlaynScribesDeadThisGame = hero.globalInfo.SanlaynScribesDeadThisGame ?? 0;
	hero.globalInfo.BattlecriesTriggeredThisGame = hero.globalInfo.BattlecriesTriggeredThisGame ?? 0;
	hero.globalInfo.BeetleAttackBuff = hero.globalInfo.BeetleAttackBuff ?? 0;
	hero.globalInfo.BeetleHealthBuff = hero.globalInfo.BeetleHealthBuff ?? 0;
	hero.globalInfo.MutatedLasherAttackBuff = hero.globalInfo.MutatedLasherAttackBuff ?? 0;
	hero.globalInfo.MutatedLasherHealthBuff = hero.globalInfo.MutatedLasherHealthBuff ?? 0;
	hero.globalInfo.TavernSpellsCastThisGame = hero.globalInfo.TavernSpellsCastThisGame ?? 0;
	hero.globalInfo.UndeadAttackBonus = hero.globalInfo.UndeadAttackBonus ?? 0;
	hero.globalInfo.FrostlingBonus = hero.globalInfo.FrostlingBonus ?? 0;
	hero.globalInfo.BloodGemAttackBonus =
		(hero.globalInfo.BloodGemAttackBonus ?? 0) +
		// Not sure why, but this isn't reflected in the player enchant
		(hero.questRewardEntities?.filter((e) => e.cardId === CardIds.EndlessBloodMoon).length ?? 0);
	hero.globalInfo.BloodGemHealthBonus =
		(hero.globalInfo.BloodGemHealthBonus ?? 0) +
		(hero.questRewardEntities?.filter((e) => e.cardId === CardIds.EndlessBloodMoon).length ?? 0);
	hero.globalInfo.GoldrinnBuffAtk = hero.globalInfo.GoldrinnBuffAtk ?? 0;
	hero.globalInfo.GoldrinnBuffHealth = hero.globalInfo.GoldrinnBuffHealth ?? 0;
};

export const clearStealthIfNeeded = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// https://twitter.com/DCalkosz/status/1562194944688660481?s=20&t=100I8IVZmBKgYQWkdK8nIA
	if (board.every((entity) => entity.stealth && !entity.attack)) {
		board.forEach((e) => updateStealth(e, false, board, hero, otherHero, gameState));
	}
	if (otherBoard.every((entity) => entity.stealth && !entity.attack)) {
		otherBoard.forEach((e) => updateStealth(e, false, otherBoard, otherHero, hero, gameState));
	}
	if (board.every((e) => e.stealth) && otherBoard.every((e) => e.stealth)) {
		board.forEach((e) => updateStealth(e, false, board, hero, otherHero, gameState));
		otherBoard.forEach((e) => updateStealth(e, false, otherBoard, otherHero, hero, gameState));
	}
};

export const updateBoardwideAuras = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (board.length === 0) {
		return;
	}

	board
		.filter((entity) =>
			entity.enchantments.some(
				(ench) =>
					ench.cardId === CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e ||
					ench.cardId === CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e2,
			),
		)
		.forEach((e) => {
			const enchantments = e.enchantments.filter(
				(ench) => ench.cardId === CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e,
			).length;
			const greaterEnchantments = e.enchantments.filter(
				(ench) => ench.cardId === CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e2,
			).length;
			e.attack = Math.max(0, e.attack - enchantments * 8 - greaterEnchantments * 15);
			e.enchantments = e.enchantments
				.filter(
					(ench) =>
						ench.cardId !== CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e,
				)
				.filter(
					(ench) =>
						ench.cardId !== CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e2,
				);
		});
	boardHero.trinkets
		.filter(
			(t) =>
				t.cardId === CardIds.WindrunnerNecklace_BG30_MagicItem_997 ||
				t.cardId === CardIds.WindrunnerNecklace_WindrunnerNecklaceToken_BG30_MagicItem_997t,
		)
		.forEach((t) => {
			const buff = t.cardId === CardIds.WindrunnerNecklace_BG30_MagicItem_997 ? 8 : 15;
			board[0].attack = board[0].attack + buff;
			board[0].enchantments.push({
				cardId:
					t.cardId === CardIds.WindrunnerNecklace_BG30_MagicItem_997
						? CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e
						: CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e2,
				originEntityId: t.entityId,
				timing: gameState.sharedState.currentEntityId++,
			});
		});
};
