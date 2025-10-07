/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { updateStealth } from '../keywords/stealth';
import { CardIds } from '../services/card-ids';
import { hasCorrectTribe } from '../utils';
import { FullGameState } from './internal-game-state';

export const setMissingAuras = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	anomalies: readonly string[],
	allCards: AllCardsService,
): void => {
	setMissingMinionsAura(board, boardHero, anomalies, allCards);
	setMissingHeroPowerAura(board, boardHero);
	setMissingTrinketAura(board, boardHero);
};

export const setMissingTrinketAura = (board: BoardEntity[], boardHero: BgsPlayerEntity): void => {
	for (const trinket of boardHero.trinkets ?? []) {
		// switch (trinket.cardId) {
		// 	case CardIds.WindrunnerNecklace_BG30_MagicItem_997:
		// 	case CardIds.WindrunnerNecklace_WindrunnerNecklaceToken_BG30_MagicItem_997t:
		// 		const enchantment =
		// 			trinket.cardId === CardIds.WindrunnerNecklace_BG30_MagicItem_997
		// 				? CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e
		// 				: CardIds.WindrunnerNecklace_RunningLikeTheWindEnchantment_BG30_MagicItem_997e2;
		// 		const buff = trinket.cardId === CardIds.WindrunnerNecklace_BG30_MagicItem_997 ? 8 : 20;
		// 		const target = board[0];
		// 		if (!!target && !target.enchantments?.find((e) => e.cardId === enchantment)) {
		// 			target.attack += buff;
		// 			target.enchantments.push({
		// 				cardId: enchantment,
		// 				originEntityId: trinket.entityId,
		// 				timing: 0,
		// 			});
		// 		}
		// 		break;
		// }
	}
};

export const setMissingHeroPowerAura = (board: BoardEntity[], boardHero: BgsPlayerEntity): void => {
	for (const heroPower of boardHero.heroPowers) {
		if (heroPower.cardId === CardIds.TheSmokingGun) {
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
		if (heroPower.cardId === CardIds.VolatileVenom) {
			board
				.filter(
					(e) => !e.enchantments.find((ench) => ench.cardId === CardIds.VolatileVenom_VolatileEnchantment),
				)
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
	}
};

const setMissingMinionsAura = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	anomalies: readonly string[],
	allCards: AllCardsService,
): void => {
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.PIRATE, anomalies, allCards)),
		CardIds.SouthseaCaptainLegacy_BG_NEW1_027,
		CardIds.SouthseaCaptain_YarrrVanillaEnchantment,
		1,
		1,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.PIRATE, anomalies, allCards)),
		CardIds.SouthseaCaptainLegacy_TB_BaconUps_136,
		CardIds.SouthseaCaptain_YarrrEnchantment,
		2,
		2,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.MURLOC, anomalies, allCards)),
		CardIds.MurlocWarleaderLegacy_BG_EX1_507,
		CardIds.MurlocWarleader_MrgglaarglLegacyEnchantment,
		2,
		0,
	);
	// setMissingAura(
	// 	board.filter((e) => hasCorrectTribe(e, boardHero, Race.MURLOC, anomalies, allCards)),
	// 	CardIds.MurlocWarleaderLegacy_BG_EX1_507,
	// 	CardIds.MurlocWarleader_MrgglaarglEnchantment,
	// 	4,
	// 	0,
	// );
	// setMissingAura(
	// 	board.filter((e) => hasCorrectTribe(e, boardHero, Race.DEMON, anomalies, allCards)),
	// 	CardIds.Kathranatir_BG21_039,
	// 	CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039e,
	// 	2,
	// 	0,
	// );
	// setMissingAura(
	// 	board.filter((e) => hasCorrectTribe(e, boardHero, Race.DEMON, anomalies, allCards)),
	// 	CardIds.Kathranatir_BG21_039_G,
	// 	CardIds.Kathranatir_GraspOfKathranatirEnchantment_BG21_039_Ge,
	// 	4,
	// 	0,
	// );
	setMissingAura(
		board.filter((e) => e.divineShield),
		CardIds.CyborgDrake_BG25_043,
		CardIds.CyborgDrake_CyborgEnhancementEnchantment_BG25_043e,
		6,
		0,
		false,
	);
	// setMissingAura(
	// 	board.filter((e) => e.divineShield),
	// 	CardIds.CyborgDrake_BG25_043_G,
	// 	CardIds.CyborgDrake_CyborgEnhancementEnchantment_BG25_043_Ge,
	// 	12,
	// 	0,
	// 	false,
	// );
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.UNDEAD, anomalies, allCards)),
		CardIds.SoreLoser_BG27_030,
		CardIds.SoreLoser_NoImWinningEnchantment_BG27_030e,
		boardHero.tavernTier,
		0,
	);
	setMissingAura(
		board.filter((e) => hasCorrectTribe(e, boardHero, Race.UNDEAD, anomalies, allCards)),
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
	for (const heroPower of hero.heroPowers) {
		const avengeValue = cardsData.avengeValue(heroPower.cardId);
		if (avengeValue > 0) {
			heroPower.avengeCurrent = avengeValue - (heroPower.scoreValue2 ?? 0);
			heroPower.avengeDefault = avengeValue;
		}
		if ((heroPower.info as BoardEntity)?.health) {
			const infoAvengeValue = cardsData.avengeValue((heroPower.info as BoardEntity).cardId);
			if (infoAvengeValue > 0) {
				(heroPower.info as BoardEntity).avengeCurrent = infoAvengeValue;
				(heroPower.info as BoardEntity).avengeDefault = infoAvengeValue;
			}
		}
	}
	// Backward compatibility
	if (!!hero.questRewards?.length && !Array.isArray(hero.questRewards)) {
		hero.questRewards = [hero.questRewards as any];
	}

	// Because Denathrius can send a quest reward as its hero power (I think)
	// For now deactivating this, until I have a scenario where this matters. It feels like
	// this should be a display issue only, as quest rewards are also handled in the code
	const heroPowerAsReward = null; // hero.cardId === CardIds.SireDenathrius_BG24_HERO_100 ? hero.heroPowers[0]?.cardId : null;
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
		// Use scriptDataNum1 to keep the info from the input
		scriptDataNum1: trinket.scriptDataNum1 || cardsData.defaultScriptDataNum(trinket.cardId),
	}));
	// 0 is not a valid entityId
	hero.entityId = hero.entityId || entityIdContainer.entityId--;
	hero.hand = hero.hand ?? [];
	if (!hero.globalInfo) {
		hero.globalInfo = {};
	}

	hero.globalInfo.EternalKnightsDeadThisGame = hero.globalInfo.EternalKnightsDeadThisGame ?? 0;
	hero.globalInfo.SanlaynScribesDeadThisGame = hero.globalInfo.SanlaynScribesDeadThisGame ?? 0;
	hero.globalInfo.BeastsSummonedThisGame = hero.globalInfo.BeastsSummonedThisGame ?? 0;
	hero.globalInfo.BeastsSummonedThisCombat = hero.globalInfo.BeastsSummonedThisCombat ?? 0;
	hero.globalInfo.MagnetizedThisGame = hero.globalInfo.MagnetizedThisGame ?? 0;
	hero.globalInfo.PiratesSummonedThisGame = hero.globalInfo.PiratesSummonedThisGame ?? 0;
	hero.globalInfo.BattlecriesTriggeredThisGame = hero.globalInfo.BattlecriesTriggeredThisGame ?? 0;
	hero.globalInfo.BeetleAttackBuff = hero.globalInfo.BeetleAttackBuff ?? 0;
	hero.globalInfo.BeetleHealthBuff = hero.globalInfo.BeetleHealthBuff ?? 0;
	hero.globalInfo.ElementalAttackBuff = hero.globalInfo.ElementalAttackBuff ?? 0;
	hero.globalInfo.ElementalHealthBuff = hero.globalInfo.ElementalHealthBuff ?? 0;
	hero.globalInfo.TavernSpellAttackBuff = hero.globalInfo.TavernSpellAttackBuff ?? 0;
	hero.globalInfo.TavernSpellHealthBuff = hero.globalInfo.TavernSpellHealthBuff ?? 0;
	hero.globalInfo.MutatedLasherAttackBuff = hero.globalInfo.MutatedLasherAttackBuff ?? 0;
	hero.globalInfo.MutatedLasherHealthBuff = hero.globalInfo.MutatedLasherHealthBuff ?? 0;
	hero.globalInfo.TavernSpellsCastThisGame = hero.globalInfo.TavernSpellsCastThisGame ?? 0;
	hero.globalInfo.AdditionalAttack = hero.globalInfo.AdditionalAttack ?? 0;
	hero.globalInfo.SpellsCastThisGame = hero.globalInfo.SpellsCastThisGame ?? 0;
	hero.globalInfo.UndeadAttackBonus = hero.globalInfo.UndeadAttackBonus ?? 0;
	hero.globalInfo.HauntedCarapaceAttackBonus = hero.globalInfo.HauntedCarapaceAttackBonus ?? 0;
	hero.globalInfo.HauntedCarapaceHealthBonus = hero.globalInfo.HauntedCarapaceHealthBonus ?? 0;
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
	hero.globalInfo.GoldSpentThisGame = hero.globalInfo.GoldSpentThisGame ?? 0;
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
