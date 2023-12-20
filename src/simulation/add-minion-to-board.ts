import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { WHELP_CARD_IDS } from '../cards/cards-data';
import {
	addStatsToBoard,
	afterStatsUpdate,
	hasCorrectTribe,
	isCorrectTribe,
	modifyAttack,
	modifyHealth,
	setEntityStats,
	updateDivineShield,
} from '../utils';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const addMinionsToBoard = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	index: number,
	minionsToAdd: readonly BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
): void => {
	board.splice(index, 0, ...minionsToAdd);
	for (const minionToAdd of [...minionsToAdd].reverse()) {
		addMinionToBoard(board, boardHero, otherHero, index, minionToAdd, allCards, spectator, sharedState, false);
	}
	handleAfterSpawnEffects(board, boardHero, minionsToAdd, allCards, sharedState, spectator);
};

export const addMinionToBoard = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	index: number,
	minionToAdd: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
	performAfterSpawnEffects = true,
	applySelfAuras = true,
): void => {
	board.splice(index, 0, minionToAdd);
	// Minion has already been removed from the board in the previous step
	handleAddedMinionAuraEffect(board, boardHero, minionToAdd, allCards, spectator, sharedState, applySelfAuras);
	handleSpawnEffect(board, boardHero, otherHero, minionToAdd, allCards, spectator, sharedState);
	if (performAfterSpawnEffects) {
		handleAfterSpawnEffects(board, boardHero, [minionToAdd], allCards, sharedState, spectator);
	}
};

const handleSpawnEffect = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	spawned: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
): void => {
	const cardIds = [spawned.cardId, ...(spawned.additionalCards ?? [])];

	// https://twitter.com/LoewenMitchell/status/1491879869457879040
	if (cardIds.some((cardId) => WHELP_CARD_IDS.includes(cardId as CardIds))) {
		const manyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelps_BG22_HERO_305_Buddy);
		const goldenManyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelps_BG22_HERO_305_Buddy_G);
		manyWhelps.forEach((entity) => {
			modifyAttack(entity, 2, board, allCards);
			modifyHealth(entity, 2, board, allCards);
			afterStatsUpdate(entity, board, allCards);
		});
		goldenManyWhelps.forEach((entity) => {
			modifyAttack(entity, 4, board, allCards);
			modifyHealth(entity, 4, board, allCards);
			afterStatsUpdate(entity, board, allCards);
		});
	}

	for (const entity of board) {
		switch (entity.cardId) {
			case CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy:
			case CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G:
				if (allCards.getCard(spawned.cardId).techLevel === boardHero.tavernTier) {
					const statsBonus = entity.cardId === CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G ? 8 : 4;
					modifyAttack(spawned, statsBonus, board, allCards);
					modifyHealth(spawned, statsBonus, board, allCards);
					afterStatsUpdate(spawned, board, allCards);
				}
				break;
			// This has to happen after greybough's hero power kicks in
			case CardIds.WanderingTreant_TB_BaconShop_HERO_95_Buddy:
			case CardIds.WanderingTreant_TB_BaconShop_HERO_95_Buddy_G:
				if (spawned.taunt) {
					const statsBonus = entity.cardId === CardIds.WanderingTreant_TB_BaconShop_HERO_95_Buddy_G ? 4 : 2;
					modifyAttack(spawned, statsBonus, board, allCards);
					modifyHealth(spawned, statsBonus, board, allCards);
					afterStatsUpdate(spawned, board, allCards);
				}
				break;
			case CardIds.CobaltGuardian:
				if (hasCorrectTribe(spawned, Race.MECH, allCards)) {
					if (!entity.divineShield) {
						updateDivineShield(entity, board, true, allCards);
					}
					modifyAttack(entity, 2, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.DeflectOBot_BGS_071:
			case CardIds.DeflectOBot_TB_BaconUps_123:
				if (hasCorrectTribe(spawned, Race.MECH, allCards)) {
					const statsBonus = entity.cardId === CardIds.DeflectOBot_TB_BaconUps_123 ? 4 : 2;
					if (!entity.divineShield) {
						updateDivineShield(entity, board, true, allCards);
					}
					modifyAttack(entity, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.Bigfernal_BGS_204:
			case CardIds.Bigfernal_TB_BaconUps_304:
				if (hasCorrectTribe(spawned, Race.DEMON, allCards)) {
					const statsBonus = entity.cardId === CardIds.Bigfernal_TB_BaconUps_304 ? 2 : 1;
					modifyAttack(entity, statsBonus, board, allCards);
					modifyHealth(entity, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.MamaBear_BGS_021:
			case CardIds.MamaBear_TB_BaconUps_090:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards)) {
					const statsBonus = entity.cardId === CardIds.MamaBear_TB_BaconUps_090 ? 6 : 3;
					modifyAttack(spawned, statsBonus, board, allCards);
					modifyHealth(spawned, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.PackLeader_BGS_017:
			case CardIds.PackLeader_TB_BaconUps_086:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards)) {
					const statsBonus = entity.cardId === CardIds.PackLeader_TB_BaconUps_086 ? 4 : 2;
					modifyAttack(spawned, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
		}
	}
};
export const handleAddedMinionAuraEffect = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	spawned: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
	applySelfAuras = true,
): void => {
	switch (boardHero.heroPowerId) {
		case CardIds.SproutItOut:
			spawned.taunt = true;
			modifyAttack(spawned, 1, board, allCards);
			modifyHealth(spawned, 2, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
			break;
		case CardIds.KurtrusAshfallen_CloseThePortal:
			modifyAttack(spawned, 2, board, allCards);
			modifyHealth(spawned, 2, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
			break;
		case CardIds.Tinker_TB_BaconShop_HP_015:
			if (hasCorrectTribe(spawned, Race.MECH, allCards)) {
				modifyAttack(spawned, 2, board, allCards);
				afterStatsUpdate(spawned, board, allCards);
			}
			break;
	}

	// The board here already contains the new minion
	// TODO: what if the additional part is a potential target for the aura effect?
	if (applySelfAuras) {
		applyAurasToSelf(spawned, board, boardHero, allCards, sharedState, spectator);
	}

	// Apply auras to board
	const cardIds = [spawned.cardId, ...(spawned.additionalCards ?? [])];
	for (const spawnedCardId of cardIds) {
		handleMinionAddedAuraEffect(spawnedCardId, spawned, board, boardHero, allCards, spectator, sharedState);
	}
};

export const applyAurasToSelf = (
	spawned: BoardEntity,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (!!boardHero.questRewards?.length) {
		for (const quest of boardHero.questRewards) {
			switch (quest) {
				case CardIds.VolatileVenom:
					spawned.attack += 7;
					spawned.health += 7;
					spawned.enchantments.push({
						cardId: CardIds.VolatileVenom_VolatileEnchantment,
						originEntityId: undefined,
						timing: sharedState.currentEntityId++,
					});
					break;
				case CardIds.TheSmokingGun:
					spawned.attack += 4;
					break;
			}
		}
	}

	if (hasCorrectTribe(spawned, Race.UNDEAD, allCards)) {
		if (boardHero.globalInfo.UndeadAttackBonus > 0) {
			modifyAttack(spawned, boardHero.globalInfo.UndeadAttackBonus, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
		}
	}
	if (hasCorrectTribe(spawned, Race.BEAST, allCards)) {
		if (boardHero.globalInfo.GoldrinnBuffAtk > 0) {
			modifyAttack(spawned, boardHero.globalInfo.GoldrinnBuffAtk, board, allCards);
			modifyHealth(spawned, boardHero.globalInfo.GoldrinnBuffHealth, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
			spectator.registerPowerTarget(boardHero, spawned, board);
		}
	}

	// In case Putricide spawns a stictched minion whose stitched part creates an aura effect
	// const potentialAuraSources: { cardId: string; entityId: number }[] = [
	// 	{ cardId: spawned.cardId, entityId: spawned.entityId },
	// 	...(spawned.additionalCards ?? []).map((cardId) => ({ cardId, entityId: spawned.entityId })),
	// ];
	for (const entity of board) {
		switch (entity.cardId) {
			case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
			case CardIds.MurlocWarleaderLegacy_TB_BaconUps_008:
				if (hasCorrectTribe(spawned, Race.MURLOC, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2;
				}
				break;
			case CardIds.HummingBird_BG26_805:
			case CardIds.HummingBird_BG26_805_G:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.HummingBird_BG26_805_G ? 4 : 2;
				}
				break;
			case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
			case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
				if (hasCorrectTribe(spawned, Race.PIRATE, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
					spawned.health += entity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
				}
				break;
			case CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy:
			case CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G:
				spawned.attack += entity.cardId === CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G ? 6 : 3;
				break;
			case CardIds.Kathranatir_BG21_039:
			case CardIds.Kathranatir_BG21_039_G:
				if (hasCorrectTribe(spawned, Race.DEMON, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.Kathranatir_BG21_039_G ? 2 : 1;
				}
				break;
			case CardIds.CyborgDrake_BG25_043:
			case CardIds.CyborgDrake_BG25_043_G:
				if (spawned.divineShield) {
					spawned.attack += entity.cardId === CardIds.CyborgDrake_BG25_043_G ? 12 : 6;
				}
				break;
			case CardIds.SoreLoser_BG27_030:
			case CardIds.SoreLoser_BG27_030_G:
				if (hasCorrectTribe(spawned, Race.UNDEAD, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += (entity.cardId === CardIds.SoreLoser_BG27_030_G ? 2 : 1) * boardHero.tavernTier;
				}
				break;
		}
	}

	switch (spawned.cardId) {
		case CardIds.EternalKnight_BG25_008:
		case CardIds.EternalKnight_BG25_008_G:
			const multiplierKnight = spawned.cardId === CardIds.EternalKnight_BG25_008_G ? 2 : 1;
			const statsBonusKnight = multiplierKnight * boardHero.globalInfo.EternalKnightsDeadThisGame;
			modifyAttack(spawned, statsBonusKnight, board, allCards);
			modifyHealth(spawned, statsBonusKnight, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
			break;
		case CardIds.EnsorcelledFungus_BG28_555:
		case CardIds.EnsorcelledFungus_BG28_555_G:
			const multiplierFungus = spawned.cardId === CardIds.EnsorcelledFungus_BG28_555_G ? 2 : 1;
			const statsBonusFungus = multiplierFungus * boardHero.globalInfo.TavernSpellsCastThisGame;
			modifyAttack(spawned, statsBonusFungus, board, allCards);
			modifyHealth(spawned, 2 * statsBonusFungus, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
			break;
		case CardIds.FlourishingFrostling_BG26_537:
		case CardIds.FlourishingFrostling_BG26_537_G:
			const multiplierFrostling = spawned.cardId === CardIds.FlourishingFrostling_BG26_537_G ? 2 : 1;
			const statsBonusFrostling = multiplierFrostling * boardHero.globalInfo.FrostlingBonus;
			modifyAttack(spawned, statsBonusFrostling, board, allCards);
			modifyHealth(spawned, statsBonusFrostling, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
			break;
		case CardIds.RotHideGnoll_BG25_013:
		case CardIds.RotHideGnoll_BG25_013_G:
			const multiplierGnoll = spawned.cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			const statsBonusGnoll =
				multiplierGnoll * sharedState.deaths.filter((e) => e.friendly === spawned.friendly).length;
			modifyAttack(spawned, statsBonusGnoll, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
			break;
	}
};

const handleMinionAddedAuraEffect = (
	spawnedCardId: string,
	spawned: BoardEntity,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
): void => {
	switch (spawnedCardId) {
		case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
		case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
			board
				.filter((e) => hasCorrectTribe(e, Race.PIRATE, allCards))
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
				.filter((e) => hasCorrectTribe(e, Race.MURLOC, allCards))
				.filter((e) => e.entityId !== spawned.entityId)
				.forEach((e) => {
					e.attack += spawned.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2;
				});
			break;
		case CardIds.HummingBird_BG26_805:
		case CardIds.HummingBird_BG26_805_G:
			board
				.filter((e) => hasCorrectTribe(e, Race.BEAST, allCards))
				.filter((e) => e.entityId !== spawned.entityId)
				.forEach((e) => {
					e.attack += spawned.cardId === CardIds.HummingBird_BG26_805_G ? 4 : 2;
				});
			break;
		case CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy:
		case CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G:
			board.forEach((e) => {
				e.attack += spawned.cardId === CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G ? 6 : 3;
			});
			break;
		case CardIds.Kathranatir_BG21_039:
		case CardIds.Kathranatir_BG21_039_G:
			board
				.filter((e) => hasCorrectTribe(e, Race.DEMON, allCards))
				.filter((e) => e.entityId !== spawned.entityId)
				.forEach((e) => {
					e.attack += spawned.cardId === CardIds.Kathranatir_BG21_039_G ? 4 : 2;
				});
			break;
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
				.filter((e) => hasCorrectTribe(e, Race.UNDEAD, allCards))
				.filter((e) => e.entityId !== spawned.entityId)
				.forEach((e) => {
					e.attack += (spawned.cardId === CardIds.SoreLoser_BG27_030_G ? 2 : 1) * boardHero.tavernTier;
				});
			break;
	}
};

const handleAfterSpawnEffects = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	allSpawned: readonly BoardEntity[],
	allCards: AllCardsService,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	for (const spawned of allSpawned) {
		handleAfterSpawnEffect(board, hero, spawned, allCards, sharedState, spectator);
	}
};

const handleAfterSpawnEffect = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	spawned: BoardEntity,
	allCards: AllCardsService,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// console.debug('after spawn', stringifySimpleCard(spawned, allCards), stringifySimple(board, allCards));
	for (const entity of board) {
		switch (entity.cardId) {
			// case CardIds.MurlocTidecallerLegacy:
			// case CardIds.MurlocTidecallerCore:
			// 	const multiplier = entity.cardId === CardIds.MurlocTidecallerBattlegrounds ? 2 : 1;
			// 	const buffAmount =
			// 		multiplier * (isCorrectTribe(allCards.getCard(spawned.cardId).races, Race.MURLOC) ? 1 : 0);
			// 	if (buffAmount > 0) {
			// 		modifyAttack(entity, buffAmount, board, allCards);
			// 		afterStatsUpdate(entity, board, allCards);
			// 		spectator.registerPowerTarget(entity, entity, board);
			// 	}
			// 	break;
			case CardIds.Swampstriker_BG22_401:
			case CardIds.Swampstriker_BG22_401_G:
				if (entity.entityId !== spawned.entityId) {
					const multiplier2 = entity.cardId === CardIds.Swampstriker_BG22_401_G ? 2 : 1;
					const buffAmount2 =
						multiplier2 * (isCorrectTribe(allCards.getCard(spawned.cardId).races, Race.MURLOC) ? 1 : 0);
					if (buffAmount2 > 0) {
						modifyAttack(entity, buffAmount2, board, allCards);
						afterStatsUpdate(entity, board, allCards);
						spectator.registerPowerTarget(entity, entity, board);
					}
				}
				break;
			case CardIds.Felstomper_BG25_042:
			case CardIds.Felstomper_BG25_042_G:
				// console.debug('felstomper');
				if (entity.entityId !== spawned.entityId) {
					const felstomperBuff = entity.cardId === CardIds.Felstomper_BG25_042_G ? 6 : 3;
					board.forEach((e) => {
						modifyAttack(e, felstomperBuff, board, allCards);
						afterStatsUpdate(e, board, allCards);
						spectator.registerPowerTarget(entity, e, board);
					});
				}
				break;
			case CardIds.XyloBones_BG26_172:
			case CardIds.XyloBones_BG26_172_G:
				if (entity.entityId !== spawned.entityId) {
					const xylobonesBuff = entity.cardId === CardIds.XyloBones_BG26_172_G ? 6 : 3;
					modifyHealth(entity, xylobonesBuff, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.OctosariWrapGod_BG26_804:
			case CardIds.OctosariWrapGod_BG26_804_G:
				const octoStats = entity.cardId === CardIds.OctosariWrapGod_BG26_804_G ? 4 : 2;
				entity.scriptDataNum1 += octoStats;
				break;
			case CardIds.BananaSlamma_BG26_802:
			case CardIds.BananaSlamma_BG26_802_G:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards) && entity.entityId !== spawned.entityId) {
					const bananaStatBuff = entity.cardId === CardIds.BananaSlamma_BG26_802_G ? 3 : 2;
					setEntityStats(
						spawned,
						spawned.attack * bananaStatBuff,
						spawned.health * bananaStatBuff,
						board,
						hero,
						allCards,
						sharedState,
						spectator,
					);
					spectator.registerPowerTarget(entity, spawned, board);
				}
				break;
			case CardIds.HungrySnapjaw_BG26_370:
			case CardIds.HungrySnapjaw_BG26_370_G:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards) && entity.entityId !== spawned.entityId) {
					const snapjawBuff = entity.cardId === CardIds.HungrySnapjaw_BG26_370_G ? 2 : 1;
					modifyHealth(entity, snapjawBuff, board, allCards);
					afterStatsUpdate(entity, board, allCards);
				}
				break;
			case CardIds.ObserverOfMyths_BG_TTN_078:
			case CardIds.ObserverOfMyths_BG_TTN_078_G:
				if (spawned.attack > entity.attack) {
					const observerBuff = entity.cardId === CardIds.ObserverOfMyths_BG_TTN_078_G ? 2 : 1;
					addStatsToBoard(entity, board, observerBuff, 0, allCards, spectator);
				}
				break;

			// Putricide-only
			case CardIds.ArmsDealer_BG26_RLK_824:
				if (hasCorrectTribe(spawned, Race.UNDEAD, allCards) && entity.entityId !== spawned.entityId) {
					modifyAttack(spawned, 1, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
		}
	}
};
