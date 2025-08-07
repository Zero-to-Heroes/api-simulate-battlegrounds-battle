import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import {
	hasAfterOtherSpawned,
	hasOnDespawned,
	hasOnOtherSpawned,
	hasOnOtherAuraSpawned as hasOnOtherSpawnedAura,
	hasOnSpawned,
} from '../cards/card.interface';
import { WHELP_CARD_IDS } from '../cards/cards-data';
import { cardMappings } from '../cards/impl/_card-mappings';
import { eternalKnightAttack, eternalKnightHealth } from '../cards/impl/trinket/eternal-portrait';
import { updateDivineShield } from '../keywords/divine-shield';
import { updateTaunt } from '../keywords/taunt';
import { pickRandom } from '../services/utils';
import { copyEntity, hasCorrectTribe } from '../utils';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';
import { modifyStats, setEntityStats } from './stats';

export const addMinionsToBoard = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	index: number,
	minionsToAdd: readonly BoardEntity[],
	gameState: FullGameState,
): void => {
	// board.splice(index, 0, ...minionsToAdd);
	for (const minionToAdd of [...minionsToAdd].reverse()) {
		addMinionToBoard(board, boardHero, otherBoard, otherHero, index, minionToAdd, gameState, false);
	}
	handleAfterSpawnEffects(board, boardHero, otherBoard, otherHero, minionsToAdd, gameState);
};

export const addMinionToBoard = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	index: number,
	minionToAdd: BoardEntity,
	gameState: FullGameState,
	performAfterSpawnEffects = true,
	applySelfAuras = true,
): void => {
	board.splice(index, 0, minionToAdd);
	// Minion has already been removed from the board in the previous step
	// Update the global "SummonedThisGame/Combat" info here
	handleAddedMinionAuraEffect(board, boardHero, otherBoard, otherHero, minionToAdd, gameState, applySelfAuras);
	// Important to do this here, so that "attack immediately" minions can be taken into account by the quests
	onMinionSummoned(boardHero, board, gameState);
	handleSpawnEffect(board, boardHero, otherBoard, otherHero, minionToAdd, gameState, applySelfAuras);
	if (performAfterSpawnEffects) {
		handleAfterSpawnEffects(board, boardHero, otherBoard, otherHero, [minionToAdd], gameState);
	}
};

const handleSpawnEffect = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	spawned: BoardEntity,
	gameState: FullGameState,
	applySelfAuras = true,
): void => {
	const cardIds = [spawned.cardId, ...(spawned.additionalCards ?? [])];

	// https://twitter.com/LoewenMitchell/status/1491879869457879040
	if (cardIds.some((cardId) => WHELP_CARD_IDS.includes(cardId as CardIds))) {
		const manyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelps_BG22_HERO_305_Buddy);
		const goldenManyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelps_BG22_HERO_305_Buddy_G);
		manyWhelps.forEach((entity) => {
			modifyStats(entity, entity, 2, 2, board, boardHero, gameState);
		});
		goldenManyWhelps.forEach((entity) => {
			modifyStats(entity, entity, 4, 4, board, boardHero, gameState);
		});
	}

	for (const entity of board) {
		// The case for Reborns, and these shouldn't proc on themselves
		if (entity.entityId === spawned.entityId) {
			continue;
		}

		const onOtherSpawnedImpl = cardMappings[entity.cardId];
		if (hasOnOtherSpawned(onOtherSpawnedImpl)) {
			onOtherSpawnedImpl.onOtherSpawned(entity, {
				spawned: spawned,
				hero: boardHero,
				board: board,
				otherBoard: otherBoard,
				otherHero: otherHero,
				applySelfAuras,
				gameState,
			});
		}

		switch (entity.cardId) {
			case CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy:
			case CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G:
				if (gameState.allCards.getCard(spawned.cardId).techLevel === boardHero.tavernTier) {
					const statsBonus = entity.cardId === CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G ? 8 : 4;
					modifyStats(spawned, entity, statsBonus, statsBonus, board, boardHero, gameState);
				}
				break;
			case CardIds.CobaltGuardian:
				if (hasCorrectTribe(spawned, boardHero, Race.MECH, gameState.anomalies, gameState.allCards)) {
					if (!entity.divineShield) {
						updateDivineShield(entity, board, boardHero, otherHero, true, gameState);
					}
					modifyStats(entity, entity, 2, 0, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
			// case CardIds.Bigfernal_BGS_204:
			// case CardIds.Bigfernal_TB_BaconUps_304:
			// 	if (hasCorrectTribe(spawned, boardHero, Race.DEMON, gameState.anomalies, gameState.allCards)) {
			// 		const statsBonus = entity.cardId === CardIds.Bigfernal_TB_BaconUps_304 ? 2 : 1;
			// 		modifyStats(entity, entity, statsBonus, statsBonus, board, boardHero, gameState);
			// 		gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
			// 	}
			// 	break;
			case CardIds.MamaBear_BGS_021:
			case CardIds.MamaBear_TB_BaconUps_090:
				if (hasCorrectTribe(spawned, boardHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
					const statsBonus = entity.cardId === CardIds.MamaBear_TB_BaconUps_090 ? 8 : 4;
					modifyStats(spawned, entity, statsBonus, statsBonus, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
			// case CardIds.PapaBear_BG27_509:
			// case CardIds.PapaBear_BG27_509_G:
			// 	if (hasCorrectTribe(spawned, boardHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
			// 		const statsBonus = entity.cardId === CardIds.PapaBear_BG27_509_G ? 16 : 8;
			// 		modifyStats(spawned, entity, statsBonus, statsBonus, board, boardHero, gameState);
			// 		gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
			// 	}
			// 	break;
			case CardIds.PackLeader_BGS_017:
			case CardIds.PackLeader_TB_BaconUps_086:
				if (hasCorrectTribe(spawned, boardHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
					const statsBonus = entity.cardId === CardIds.PackLeader_TB_BaconUps_086 ? 4 : 2;
					modifyStats(spawned, entity, statsBonus, 0, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
		}
	}
};
export const handleAddedMinionAuraEffect = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	spawned: BoardEntity,
	gameState: FullGameState,
	applySelfAuras = true,
	isActuallySpawned = true,
): void => {
	for (const heroPower of boardHero.heroPowers) {
		switch (heroPower.cardId) {
			case CardIds.SproutItOut:
				if (isActuallySpawned) {
					updateTaunt(spawned, true, board, boardHero, otherHero, gameState);
					modifyStats(spawned, boardHero, 1, 2, board, boardHero, gameState);
				}
				break;
			// case CardIds.KurtrusAshfallen_CloseThePortal:
			// 	modifyStats(spawned, boardHero, 2, 2, board, boardHero, gameState);
			// 	break;
			case CardIds.Tinker_TB_BaconShop_HP_015:
				if (isActuallySpawned) {
					if (hasCorrectTribe(spawned, boardHero, Race.MECH, gameState.anomalies, gameState.allCards)) {
						modifyStats(spawned, boardHero, 3, 0, board, boardHero, gameState);
					}
				}
				break;
		}
	}

	if (boardHero.questRewards?.includes(CardIds.TumblingDisaster_BG28_Reward_505)) {
		const tumblingDisasterBonus =
			boardHero.questRewardEntities?.find((e) => e.cardId === CardIds.TumblingDisaster_BG28_Reward_505)
				?.scriptDataNum1 || 1;
		modifyStats(spawned, boardHero, tumblingDisasterBonus, tumblingDisasterBonus, board, boardHero, gameState);
	}

	if (isActuallySpawned) {
		for (const trinket of boardHero.trinkets) {
			switch (trinket.cardId) {
				case CardIds.BlingtronsSunglasses_BG30_MagicItem_978:
					if (hasCorrectTribe(spawned, boardHero, Race.MECH, gameState.anomalies, gameState.allCards)) {
						const target = pickRandom(board.filter((e) => !e.divineShield));
						if (!!target) {
							updateDivineShield(target, board, boardHero, otherHero, true, gameState);
						}
					}
					break;
				case CardIds.TwinSkyLanterns_BG30_MagicItem_822:
				case CardIds.TwinSkyLanterns_TwinSkyLanternsToken_BG30_MagicItem_822t2:
					if (!trinket.rememberedMinion) {
						trinket.rememberedMinion = copyEntity(spawned);
					}
					break;
				case CardIds.ReinforcedShield_BG30_MagicItem_886:
					if (trinket.scriptDataNum1 > 0 && !spawned.divineShield) {
						updateDivineShield(spawned, board, boardHero, otherHero, true, gameState);
						trinket.scriptDataNum1--;
					}
					break;
			}
		}
	}

	// Apply auras to board
	const cardIds = [spawned.cardId, ...(spawned.additionalCards ?? [])];
	for (const spawnedCardId of cardIds) {
		handleMinionAddedAuraEffect(spawnedCardId, spawned, board, boardHero, gameState, isActuallySpawned);
	}

	// When we want to summon an "exact copy", we need to make sure we don't apply the aura twice
	if (applySelfAuras) {
		// The board here already contains the new minion
		// TODO: what if the additional part is a potential target for the aura effect?
		// 2024-08-27: changing the order to first handleMinionAddedAuraEffect so that the automatons get boosted,
		// then apply the aura
		applyAurasToSelf(spawned, board, boardHero, gameState);
	}

	if (isActuallySpawned) {
		if (hasCorrectTribe(spawned, boardHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
			boardHero.globalInfo.BeastsSummonedThisCombat++;
			boardHero.globalInfo.BeastsSummonedThisGame++;
		}
		if (hasCorrectTribe(spawned, boardHero, Race.PIRATE, gameState.anomalies, gameState.allCards)) {
			boardHero.globalInfo.PiratesSummonedThisGame++;
		}
	}
};

export const applyAurasToSelf = (
	spawned: BoardEntity,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	spawned.attack += boardHero.globalInfo.AdditionalAttack;

	if (!!boardHero.questRewards?.length) {
		for (const quest of boardHero.questRewards) {
			switch (quest) {
				case CardIds.VolatileVenom:
					spawned.attack += 7;
					spawned.health += 7;
					spawned.enchantments.push({
						cardId: CardIds.VolatileVenom_VolatileEnchantment,
						originEntityId: undefined,
						timing: gameState.sharedState.currentEntityId++,
					});
					break;
				case CardIds.TheSmokingGun:
					spawned.attack += 4;
					break;
			}
		}
	}

	if (!!boardHero.trinkets?.length) {
		for (const trinket of boardHero.trinkets) {
			switch (trinket.cardId) {
				case CardIds.FeralTalisman_BG30_MagicItem_880:
					spawned.attack += 2;
					spawned.health += 1;
					break;
				case CardIds.FeralTalisman_FeralTalismanToken_BG30_MagicItem_880t:
					spawned.attack += 8;
					spawned.health += 5;
					break;
				case CardIds.DazzlingDagger_BG32_MagicItem_934:
					spawned.attack += trinket.scriptDataNum1 || 1;
					break;
				case CardIds.HordeKeychainToken_BG30_MagicItem_843t:
					if (gameState.cardsData.getTavernLevel(spawned.cardId) <= 3) {
						spawned.attack += 7;
						spawned.health += 5;
					}
					break;
				case CardIds.FlagbearerPortrait_BG30_MagicItem_921:
					if (
						spawned.cardId === CardIds.Scallywag_SkyPirateToken_BGS_061t ||
						spawned.cardId === CardIds.Scallywag_SkyPirateToken_TB_BaconUps_141t
					) {
						spawned.attack += 6;
					}
					break;
			}
		}
	}

	if (boardHero.globalInfo.HauntedCarapaceAttackBonus > 0) {
		modifyStats(
			spawned,
			spawned,
			boardHero.globalInfo.HauntedCarapaceAttackBonus,
			0,
			board,
			boardHero,
			gameState,
			false,
		);
	}
	if (boardHero.globalInfo.HauntedCarapaceHealthBonus > 0) {
		modifyStats(
			spawned,
			spawned,
			0,
			boardHero.globalInfo.HauntedCarapaceHealthBonus,
			board,
			boardHero,
			gameState,
			false,
		);
	}
	if (hasCorrectTribe(spawned, boardHero, Race.UNDEAD, gameState.anomalies, gameState.allCards)) {
		if (boardHero.globalInfo.UndeadAttackBonus > 0) {
			modifyStats(
				spawned,
				spawned,
				boardHero.globalInfo.UndeadAttackBonus,
				0,
				board,
				boardHero,
				gameState,
				false,
			);
		}
	}
	if (hasCorrectTribe(spawned, boardHero, Race.PIRATE, gameState.anomalies, gameState.allCards)) {
		if (boardHero.globalInfo.PirateAttackBonus > 0) {
			modifyStats(
				spawned,
				spawned,
				boardHero.globalInfo.PirateAttackBonus,
				0,
				board,
				boardHero,
				gameState,
				false,
			);
		}
	}
	if (hasCorrectTribe(spawned, boardHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
		if (boardHero.globalInfo.GoldrinnBuffAtk > 0) {
			modifyStats(
				spawned,
				spawned,
				boardHero.globalInfo.GoldrinnBuffAtk,
				boardHero.globalInfo.GoldrinnBuffHealth,
				board,
				boardHero,
				gameState,
				false,
			);
			gameState.spectator.registerPowerTarget(boardHero, spawned, board, null, null);
		}
	}

	// In case Putricide spawns a stictched minion whose stitched part creates an aura effect
	// const potentialAuraSources: { cardId: string; entityId: number }[] = [
	// 	{ cardId: spawned.cardId, entityId: spawned.entityId },
	// 	...(spawned.additionalCards ?? []).map((cardId) => ({ cardId, entityId: spawned.entityId })),
	// ];

	if (gameState.cardsData.getTavernLevel(spawned.cardId) % 2 === 1) {
		const atkBuff = boardHero.globalInfo.MutatedLasherAttackBuff ?? 0;
		const healthBuff = boardHero.globalInfo.MutatedLasherHealthBuff ?? 0;
		modifyStats(spawned, spawned, atkBuff, healthBuff, board, boardHero, gameState, false);
	}
	for (const entity of board) {
		const onOtherSpawnedImpl = cardMappings[entity.cardId];
		if (hasOnOtherSpawnedAura(onOtherSpawnedImpl)) {
			onOtherSpawnedImpl.onOtherSpawnedAura(entity, {
				spawned: spawned,
				hero: boardHero,
				board: board,
				gameState,
			});
		}
		switch (entity.cardId) {
			case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
			case CardIds.MurlocWarleaderLegacy_TB_BaconUps_008:
				if (
					hasCorrectTribe(spawned, boardHero, Race.MURLOC, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== spawned.entityId
				) {
					spawned.attack += entity.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2;
				}
				break;
			case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
			case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
				if (
					hasCorrectTribe(spawned, boardHero, Race.PIRATE, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== spawned.entityId
				) {
					spawned.attack += entity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
					spawned.health += entity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
				}
				break;
			// case CardIds.Kathranatir_BG21_039:
			// case CardIds.Kathranatir_BG21_039_G:
			// 	if (
			// 		hasCorrectTribe(spawned, boardHero, Race.DEMON, gameState.anomalies, gameState.allCards) &&
			// 		entity.entityId !== spawned.entityId
			// 	) {
			// 		spawned.attack += entity.cardId === CardIds.Kathranatir_BG21_039_G ? 2 : 1;
			// 	}
			// 	break;
			case CardIds.CyborgDrake_BG25_043:
			case CardIds.CyborgDrake_BG25_043_G:
				if (spawned.divineShield) {
					spawned.attack += entity.cardId === CardIds.CyborgDrake_BG25_043_G ? 12 : 6;
				}
				break;
			case CardIds.SoreLoser_BG27_030:
			case CardIds.SoreLoser_BG27_030_G:
				if (
					hasCorrectTribe(spawned, boardHero, Race.UNDEAD, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== spawned.entityId
				) {
					spawned.attack += (entity.cardId === CardIds.SoreLoser_BG27_030_G ? 2 : 1) * boardHero.tavernTier;
				}
				break;
		}
	}

	const onSpawnedImpl = cardMappings[spawned.cardId];
	if (hasOnSpawned(onSpawnedImpl)) {
		onSpawnedImpl.onSpawned(spawned, {
			hero: boardHero,
			board: board,
			gameState: gameState,
		});
	}
	switch (spawned.cardId) {
		case CardIds.EternalKnight_BG25_008:
		case CardIds.EternalKnight_BG25_008_G:
			const multiplierKnight = spawned.cardId === CardIds.EternalKnight_BG25_008_G ? 2 : 1;
			const statsBonusKnight = multiplierKnight * boardHero.globalInfo.EternalKnightsDeadThisGame;
			modifyStats(
				spawned,
				null,
				eternalKnightAttack * statsBonusKnight,
				eternalKnightHealth * statsBonusKnight,
				board,
				boardHero,
				gameState,
				false,
			);
			break;
		case CardIds.EnsorcelledFungus_BG28_555:
		case CardIds.EnsorcelledFungus_BG28_555_G:
			const multiplierFungus = spawned.cardId === CardIds.EnsorcelledFungus_BG28_555_G ? 2 : 1;
			const statsBonusFungus = multiplierFungus * boardHero.globalInfo.TavernSpellsCastThisGame;
			modifyStats(spawned, null, statsBonusFungus, 2 * statsBonusFungus, board, boardHero, gameState, false);
			break;
		case CardIds.FlourishingFrostling_BG26_537:
		case CardIds.FlourishingFrostling_BG26_537_G:
			const multiplierFrostling = spawned.cardId === CardIds.FlourishingFrostling_BG26_537_G ? 2 : 1;
			const statsBonusFrostling = multiplierFrostling * boardHero.globalInfo.FrostlingBonus;
			modifyStats(
				spawned,
				null,
				2 * statsBonusFrostling,
				statsBonusFrostling,
				board,
				boardHero,
				gameState,
				false,
			);
			break;
		case CardIds.SaltyLooter_BGS_081:
		case CardIds.SaltyLooter_TB_BaconUps_143:
			const multiplierLooter = spawned.cardId === CardIds.SaltyLooter_TB_BaconUps_143 ? 2 : 1;
			const statsBonusLooter = multiplierLooter * boardHero.globalInfo.PiratesSummonedThisGame;
			modifyStats(spawned, null, 2 * statsBonusLooter, 2 * multiplierLooter, board, boardHero, gameState, false);
			break;
		case CardIds.AstralAutomaton_BG_TTN_401:
		case CardIds.AstralAutomaton_BG_TTN_401_G:
			const multiplierAstral = spawned.cardId === CardIds.AstralAutomaton_BG_TTN_401_G ? 2 : 1;
			// Don't count the yourself
			const statsBonusAstral = multiplierAstral * (boardHero.globalInfo.AstralAutomatonsSummonedThisGame - 1);
			modifyStats(spawned, null, 3 * statsBonusAstral, 2 * statsBonusAstral, board, boardHero, gameState, false);
			break;
		case CardIds.RotHideGnoll_BG25_013:
		case CardIds.RotHideGnoll_BG25_013_G:
			const multiplierGnoll = spawned.cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			const statsBonusGnoll =
				multiplierGnoll * gameState.sharedState.deaths.filter((e) => e.friendly === spawned.friendly).length;
			modifyStats(spawned, null, statsBonusGnoll, 0, board, boardHero, gameState, false);
			break;
	}
};

// Introduced for Rapid Reanimation: since we will "addMinionToBoard" the minion afterwards, the auras will
// be re-applied then, so we need to remove them first
export const removeAurasFromSelf = (
	entity: BoardEntity,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	entity.attack -= Math.max(0, boardHero.globalInfo.AdditionalAttack);

	if (!!boardHero.questRewards?.length) {
		for (const quest of boardHero.questRewards) {
			switch (quest) {
				case CardIds.VolatileVenom:
					entity.attack = Math.max(0, entity.attack - 7);
					entity.health = Math.max(1, entity.health - 7);
					entity.enchantments = entity.enchantments.filter(
						(e) => e.cardId !== CardIds.VolatileVenom_VolatileEnchantment,
					);
					break;
				case CardIds.TheSmokingGun:
					entity.attack = Math.max(0, entity.attack - 7);
					break;
				case CardIds.FlagbearerPortrait_BG30_MagicItem_921:
					if (
						entity.cardId === CardIds.SkyPirateFlagbearer_BG30_119 ||
						entity.cardId === CardIds.SkyPirateFlagbearer_BG30_119_G
					) {
						entity.attack = Math.max(0, entity.attack - 8);
					}
					break;
			}
		}
	}

	if (!!boardHero.trinkets?.length) {
		for (const trinket of boardHero.trinkets) {
			switch (trinket.cardId) {
				case CardIds.FeralTalisman_BG30_MagicItem_880:
					entity.attack = Math.max(0, entity.attack - 2);
					entity.health = Math.max(1, entity.health - 1);
					break;
				case CardIds.FeralTalisman_FeralTalismanToken_BG30_MagicItem_880t:
					entity.attack = Math.max(0, entity.attack - 8);
					entity.health = Math.max(1, entity.health - 5);
					break;
				case CardIds.DazzlingDagger_BG32_MagicItem_934:
					entity.attack = Math.max(0, entity.attack - (trinket.scriptDataNum1 || 1));
					break;
				case CardIds.HordeKeychainToken_BG30_MagicItem_843t:
					if (gameState.cardsData.getTavernLevel(entity.cardId) <= 3) {
						entity.attack = Math.max(0, entity.attack - 7);
						entity.health = Math.max(1, entity.health - 5);
					}
					break;
			}
		}
	}

	if (boardHero.globalInfo.HauntedCarapaceAttackBonus > 0) {
		entity.attack = Math.max(0, entity.attack - boardHero.globalInfo.HauntedCarapaceAttackBonus);
	}
	if (boardHero.globalInfo.HauntedCarapaceHealthBonus > 0) {
		entity.health = Math.max(1, entity.health - boardHero.globalInfo.HauntedCarapaceHealthBonus);
	}
	if (hasCorrectTribe(entity, boardHero, Race.UNDEAD, gameState.anomalies, gameState.allCards)) {
		if (boardHero.globalInfo.UndeadAttackBonus > 0) {
			entity.attack = Math.max(0, entity.attack - boardHero.globalInfo.UndeadAttackBonus);
		}
	}
	if (hasCorrectTribe(entity, boardHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
		if (boardHero.globalInfo.GoldrinnBuffAtk > 0) {
			entity.attack = Math.max(0, entity.attack - boardHero.globalInfo.GoldrinnBuffAtk);
			entity.health = Math.max(1, entity.health - boardHero.globalInfo.GoldrinnBuffHealth);
		}
	}

	for (const boardEntity of board) {
		switch (boardEntity.cardId) {
			case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
			case CardIds.MurlocWarleaderLegacy_TB_BaconUps_008:
				if (
					hasCorrectTribe(entity, boardHero, Race.MURLOC, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== boardEntity.entityId
				) {
					entity.attack = Math.max(
						0,
						entity.attack - (boardEntity.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2),
					);
				}
				break;
			case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
			case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
				if (
					hasCorrectTribe(entity, boardHero, Race.PIRATE, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== boardEntity.entityId
				) {
					entity.attack = Math.max(
						0,
						entity.attack - (boardEntity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1),
					);
					entity.health = Math.max(
						1,
						entity.health - (boardEntity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1),
					);
				}
				break;
			// case CardIds.Kathranatir_BG21_039:
			// case CardIds.Kathranatir_BG21_039_G:
			// 	if (
			// 		hasCorrectTribe(entity, boardHero, Race.DEMON, gameState.anomalies, gameState.allCards) &&
			// 		entity.entityId !== boardEntity.entityId
			// 	) {
			// 		entity.attack = Math.max(
			// 			0,
			// 			entity.attack - (boardEntity.cardId === CardIds.Kathranatir_BG21_039_G ? 2 : 1),
			// 		);
			// 	}
			// 	break;
			case CardIds.CyborgDrake_BG25_043:
			case CardIds.CyborgDrake_BG25_043_G:
				if (entity.divineShield) {
					entity.attack = Math.max(
						0,
						entity.attack - (boardEntity.cardId === CardIds.CyborgDrake_BG25_043_G ? 12 : 6),
					);
				}
				break;
			case CardIds.SoreLoser_BG27_030:
			case CardIds.SoreLoser_BG27_030_G:
				if (
					hasCorrectTribe(entity, boardHero, Race.UNDEAD, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== boardEntity.entityId
				) {
					entity.attack = Math.max(
						0,
						entity.attack -
							(boardEntity.cardId === CardIds.SoreLoser_BG27_030_G ? 2 : 1) * boardHero.tavernTier,
					);
				}
				break;
		}
	}

	switch (entity.cardId) {
		case CardIds.EternalKnight_BG25_008:
		case CardIds.EternalKnight_BG25_008_G:
			const multiplierKnight = entity.cardId === CardIds.EternalKnight_BG25_008_G ? 2 : 1;
			const statsBonusKnight = multiplierKnight * boardHero.globalInfo.EternalKnightsDeadThisGame;
			entity.attack = Math.max(0, entity.attack - eternalKnightAttack * statsBonusKnight);
			entity.health = Math.max(1, entity.health - eternalKnightHealth * statsBonusKnight);
			break;
		case CardIds.EnsorcelledFungus_BG28_555:
		case CardIds.EnsorcelledFungus_BG28_555_G:
			const multiplierFungus = entity.cardId === CardIds.EnsorcelledFungus_BG28_555_G ? 2 : 1;
			const statsBonusFungus = multiplierFungus * boardHero.globalInfo.TavernSpellsCastThisGame;
			entity.attack = Math.max(0, entity.attack - statsBonusFungus);
			entity.health = Math.max(1, entity.health - 2 * statsBonusFungus);
			break;
		case CardIds.FlourishingFrostling_BG26_537:
		case CardIds.FlourishingFrostling_BG26_537_G:
			const multiplierFrostling = entity.cardId === CardIds.FlourishingFrostling_BG26_537_G ? 2 : 1;
			const statsBonusFrostling = multiplierFrostling * boardHero.globalInfo.FrostlingBonus;
			entity.attack = Math.max(0, entity.attack - statsBonusFrostling);
			entity.health = Math.max(1, entity.health - statsBonusFrostling);
			break;
		case CardIds.AstralAutomaton_BG_TTN_401:
		case CardIds.AstralAutomaton_BG_TTN_401_G:
			const multiplierAstral = entity.cardId === CardIds.AstralAutomaton_BG_TTN_401_G ? 2 : 1;
			// We remove 1 because the AstralAutomatonsSummonedThisGame also includes the current one
			// and ancestral automaton only counts "other" automatons
			const statsBonusAstral = multiplierAstral * (boardHero.globalInfo.AstralAutomatonsSummonedThisGame - 1);
			entity.attack = Math.max(0, entity.attack - 3 * statsBonusAstral);
			entity.health = Math.max(1, entity.health - 2 * statsBonusAstral);
			break;
		case CardIds.RotHideGnoll_BG25_013:
		case CardIds.RotHideGnoll_BG25_013_G:
			const multiplierGnoll = entity.cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			const statsBonusGnoll =
				multiplierGnoll * gameState.sharedState.deaths.filter((e) => e.friendly === entity.friendly).length;
			entity.attack = Math.max(0, entity.attack - statsBonusGnoll);
			break;
	}

	for (const enchantment of entity.enchantments ?? []) {
		switch (enchantment?.cardId) {
			case CardIds.TavernLighting_TavernLightsEnchantment:
				entity.attack = Math.max(0, entity.attack - enchantment.tagScriptDataNum1);
				break;
		}
	}
};

const handleMinionAddedAuraEffect = (
	spawnedCardId: string,
	spawned: BoardEntity,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	gameState: FullGameState,
	isActuallySpawned = true,
): void => {
	switch (spawnedCardId) {
		case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
		case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.PIRATE, gameState.anomalies, gameState.allCards))
				// Other
				.filter((e) => e.entityId !== spawned.entityId)
				.forEach((e) => {
					e.attack += spawned.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
					e.health += spawned.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
				});
			break;
		case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
		case CardIds.MurlocWarleaderLegacy_TB_BaconUps_008:
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.MURLOC, gameState.anomalies, gameState.allCards))
				.filter((e) => e.entityId !== spawned.entityId)
				.forEach((e) => {
					e.attack += spawned.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2;
				});
			break;
		// case CardIds.Kathranatir_BG21_039:
		// case CardIds.Kathranatir_BG21_039_G:
		// 	board
		// 		.filter((e) => hasCorrectTribe(e, boardHero, Race.DEMON, gameState.anomalies, gameState.allCards))
		// 		.filter((e) => e.entityId !== spawned.entityId)
		// 		.forEach((e) => {
		// 			e.attack += spawned.cardId === CardIds.Kathranatir_BG21_039_G ? 4 : 2;
		// 		});
		// 	break;
		case CardIds.CyborgDrake_BG25_043:
		case CardIds.CyborgDrake_BG25_043_G:
			board
				.filter((e) => e.divineShield)
				.forEach((e) => {
					e.attack += spawned.cardId === CardIds.CyborgDrake_BG25_043_G ? 12 : 6;
				});
			break;

		case CardIds.SoreLoser_BG27_030:
		case CardIds.SoreLoser_BG27_030_G:
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.UNDEAD, gameState.anomalies, gameState.allCards))
				.filter((e) => e.entityId !== spawned.entityId)
				.forEach((e) => {
					e.attack += (spawned.cardId === CardIds.SoreLoser_BG27_030_G ? 2 : 1) * boardHero.tavernTier;
				});
			break;
		case CardIds.AstralAutomaton_BG_TTN_401:
		case CardIds.AstralAutomaton_BG_TTN_401_G:
			// TODO: move this somewhere else
			if (isActuallySpawned) {
				boardHero.globalInfo.AstralAutomatonsSummonedThisGame++;
			}
			board
				.filter((e) => e.entityId !== spawned.entityId)
				.filter(
					(e) =>
						e.cardId === CardIds.AstralAutomaton_BG_TTN_401 ||
						e.cardId === CardIds.AstralAutomaton_BG_TTN_401_G,
				)
				.forEach((e) => {
					const multiplierAstral = e.cardId === CardIds.AstralAutomaton_BG_TTN_401_G ? 2 : 1;
					modifyStats(e, e, 3 * multiplierAstral, 2 * multiplierAstral, board, boardHero, gameState, false);
				});
			break;
		case CardIds.DrBoomsMonster_BG31_176:
		case CardIds.DrBoomsMonster_BG31_176_G:
			const multiplierDrBoom = spawned.cardId === CardIds.DrBoomsMonster_BG31_176_G ? 2 : 1;
			modifyStats(
				spawned,
				spawned,
				2 * boardHero.globalInfo.MagnetizedThisGame * multiplierDrBoom,
				2 * boardHero.globalInfo.MagnetizedThisGame * multiplierDrBoom,
				board,
				boardHero,
				gameState,
				false,
			);
			break;
	}
};

const handleAfterSpawnEffects = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	allSpawned: readonly BoardEntity[],
	gameState: FullGameState,
): void => {
	for (const spawned of allSpawned) {
		handleAfterSpawnEffect(board, hero, otherBoard, otherHero, spawned, gameState);
	}
};

export const onMinionSummoned = (hero: BgsPlayerEntity, board: BoardEntity[], gameState: FullGameState): void => {
	const quests = hero.questEntities ?? [];
	if (!quests.length) {
		return;
	}

	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.AssembleALineup:
				onQuestProgressUpdated(hero, quest, board, gameState);
				break;
		}
	}
};

const handleAfterSpawnEffect = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	spawned: BoardEntity,
	gameState: FullGameState,
): void => {
	// So that spawns don't mess up the loop
	const initialBoard = [...board];

	for (const trinket of hero.trinkets ?? []) {
		const onAfterSpawnedImpl = cardMappings[trinket.cardId];
		if (hasAfterOtherSpawned(onAfterSpawnedImpl)) {
			onAfterSpawnedImpl.afterOtherSpawned(trinket, {
				spawned: spawned,
				hero: hero,
				board: board,
				otherHero: otherHero,
				otherBoard: otherBoard,
				gameState,
				applySelfAuras: false,
			});
		}
	}

	for (const entity of initialBoard) {
		const onAfterSpawnedImpl = cardMappings[entity.cardId];
		if (hasAfterOtherSpawned(onAfterSpawnedImpl)) {
			onAfterSpawnedImpl.afterOtherSpawned(entity, {
				spawned: spawned,
				hero: hero,
				board: board,
				otherHero: otherHero,
				otherBoard: otherBoard,
				gameState,
				applySelfAuras: false,
			});
		}

		switch (entity.cardId) {
			case CardIds.XyloBones_BG26_172:
			case CardIds.XyloBones_BG26_172_G:
				if (entity.entityId !== spawned.entityId) {
					const xylobonesBuff = entity.cardId === CardIds.XyloBones_BG26_172_G ? 4 : 2;
					modifyStats(entity, entity, 0, xylobonesBuff, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, null, null);
				}
				break;
			case CardIds.OctosariWrapGod_BG26_804:
			case CardIds.OctosariWrapGod_BG26_804_G:
				if (entity.entityId !== spawned.entityId) {
					const octoStats = entity.cardId === CardIds.OctosariWrapGod_BG26_804_G ? 4 : 2;
					entity.scriptDataNum1 = (entity.scriptDataNum1 ?? 0) + octoStats;
				}
				break;
			case CardIds.BananaSlamma_BG26_802:
			case CardIds.BananaSlamma_BG26_802_G:
				if (
					hasCorrectTribe(spawned, hero, Race.BEAST, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== spawned.entityId
				) {
					const bananaStatBuff = entity.cardId === CardIds.BananaSlamma_BG26_802_G ? 3 : 2;
					setEntityStats(
						spawned,
						spawned.attack * bananaStatBuff,
						spawned.health * bananaStatBuff,
						board,
						hero,
						gameState,
					);
					gameState.spectator.registerPowerTarget(entity, spawned, board, null, null);
				}
				break;
			// case CardIds.ObserverOfMyths_BG_TTN_078:
			// case CardIds.ObserverOfMyths_BG_TTN_078_G:
			// 	if (spawned.attack > entity.attack) {
			// 		const observerBuff = entity.cardId === CardIds.ObserverOfMyths_BG_TTN_078_G ? 2 : 1;
			// 		addStatsToBoard(entity, board, hero, observerBuff, 0, gameState);
			// 	}
			// 	break;
			case CardIds.ValithriaDreamwalker_TB_BaconShop_HERO_53_Buddy:
			case CardIds.ValithriaDreamwalker_TB_BaconShop_HERO_53_Buddy_G:
				if (
					hasCorrectTribe(spawned, hero, Race.DRAGON, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== spawned.entityId
				) {
					const valithriaBuff =
						entity.cardId === CardIds.ValithriaDreamwalker_TB_BaconShop_HERO_53_Buddy_G ? 3 : 2;
					modifyStats(entity, entity, valithriaBuff, valithriaBuff, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, spawned, board, null, null);
				}
				break;

			// Putricide-only
			case CardIds.ArmsDealer_BG26_RLK_824:
				if (
					hasCorrectTribe(spawned, hero, Race.UNDEAD, gameState.anomalies, gameState.allCards) &&
					entity.entityId !== spawned.entityId
				) {
					modifyStats(spawned, spawned, 1, 0, board, hero, gameState, false);
					gameState.spectator.registerPowerTarget(entity, entity, board, null, null);
				}
				break;
		}
	}

	for (const trinket of hero.trinkets) {
		switch (trinket.cardId) {
			case CardIds.SlammaSticker_BG30_MagicItem_540:
				if (hasCorrectTribe(spawned, hero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
					setEntityStats(spawned, spawned.attack * 2, spawned.health * 2, board, hero, gameState);
					gameState.spectator.registerPowerTarget(hero, spawned, board, null, null);
				}
				break;
		}
	}
};

export interface OnSpawnInput {
	hero: BgsPlayerEntity;
	board: BoardEntity[];
	gameState: FullGameState;
}
export interface OnOtherSpawnInput {
	spawned: BoardEntity;
	hero: BgsPlayerEntity;
	board: BoardEntity[];
	otherHero: BgsPlayerEntity;
	otherBoard: BoardEntity[];
	gameState: FullGameState;
	applySelfAuras: boolean;
}
export interface OnOtherSpawnAuraInput {
	spawned: BoardEntity;
	hero: BgsPlayerEntity;
	board: BoardEntity[];
	gameState: FullGameState;
}
export interface OnDespawnInput {
	hero: BgsPlayerEntity;
	board: BoardEntity[];
	gameState: FullGameState;
}
