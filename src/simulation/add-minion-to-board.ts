import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { WHELP_CARD_IDS } from '../cards/cards-data';
import { addStatsToBoard, hasCorrectTribe, isCorrectTribe, updateDivineShield } from '../utils';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';
import { modifyStats, setEntityStats } from './stats';

export const addMinionsToBoard = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	index: number,
	minionsToAdd: readonly BoardEntity[],
	gameState: FullGameState,
): void => {
	// board.splice(index, 0, ...minionsToAdd);
	for (const minionToAdd of [...minionsToAdd].reverse()) {
		addMinionToBoard(board, boardHero, otherHero, index, minionToAdd, gameState, false);
	}
	handleAfterSpawnEffects(board, boardHero, minionsToAdd, gameState);
};

export const addMinionToBoard = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	index: number,
	minionToAdd: BoardEntity,
	gameState: FullGameState,
	performAfterSpawnEffects = true,
): void => {
	board.splice(index, 0, minionToAdd);
	// Minion has already been removed from the board in the previous step
	handleAddedMinionAuraEffect(board, boardHero, minionToAdd, gameState);
	// Important to do this here, so that "attack immediately" minions can be taken into account by the quests
	onMinionSummoned(boardHero, board, gameState);
	handleSpawnEffect(board, boardHero, otherHero, minionToAdd, gameState);
	if (performAfterSpawnEffects) {
		handleAfterSpawnEffects(board, boardHero, [minionToAdd], gameState);
	}
};

const handleSpawnEffect = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	spawned: BoardEntity,
	gameState: FullGameState,
): void => {
	const cardIds = [spawned.cardId, ...(spawned.additionalCards ?? [])];

	// https://twitter.com/LoewenMitchell/status/1491879869457879040
	if (cardIds.some((cardId) => WHELP_CARD_IDS.includes(cardId as CardIds))) {
		const manyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelps_BG22_HERO_305_Buddy);
		const goldenManyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelps_BG22_HERO_305_Buddy_G);
		manyWhelps.forEach((entity) => {
			modifyStats(entity, 2, 2, board, boardHero, gameState);
		});
		goldenManyWhelps.forEach((entity) => {
			modifyStats(entity, 4, 4, board, boardHero, gameState);
		});
	}

	for (const entity of board) {
		// The case for Reborns, and these shouldn't proc on themselves
		if (entity.entityId === spawned.entityId) {
			continue;
		}

		switch (entity.cardId) {
			case CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy:
			case CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G:
				if (gameState.allCards.getCard(spawned.cardId).techLevel === boardHero.tavernTier) {
					const statsBonus = entity.cardId === CardIds.BabyYshaarj_TB_BaconShop_HERO_92_Buddy_G ? 8 : 4;
					modifyStats(spawned, statsBonus, statsBonus, board, boardHero, gameState);
				}
				break;
			case CardIds.CobaltGuardian:
				if (hasCorrectTribe(spawned, Race.MECH, gameState.allCards)) {
					if (!entity.divineShield) {
						updateDivineShield(entity, board, true, gameState.allCards);
					}
					modifyStats(entity, 2, 0, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
			case CardIds.DeflectOBot_BGS_071:
			case CardIds.DeflectOBot_TB_BaconUps_123:
				if (hasCorrectTribe(spawned, Race.MECH, gameState.allCards)) {
					const statsBonus = entity.cardId === CardIds.DeflectOBot_TB_BaconUps_123 ? 4 : 2;
					if (!entity.divineShield) {
						updateDivineShield(entity, board, true, gameState.allCards);
					}
					modifyStats(entity, statsBonus, 0, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
			case CardIds.Bigfernal_BGS_204:
			case CardIds.Bigfernal_TB_BaconUps_304:
				if (hasCorrectTribe(spawned, Race.DEMON, gameState.allCards)) {
					const statsBonus = entity.cardId === CardIds.Bigfernal_TB_BaconUps_304 ? 2 : 1;
					modifyStats(entity, statsBonus, statsBonus, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
			case CardIds.MamaBear_BGS_021:
			case CardIds.MamaBear_TB_BaconUps_090:
				if (hasCorrectTribe(spawned, Race.BEAST, gameState.allCards)) {
					const statsBonus = entity.cardId === CardIds.MamaBear_TB_BaconUps_090 ? 8 : 4;
					modifyStats(spawned, statsBonus, statsBonus, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
			case CardIds.PackLeader_BGS_017:
			case CardIds.PackLeader_TB_BaconUps_086:
				if (hasCorrectTribe(spawned, Race.BEAST, gameState.allCards)) {
					const statsBonus = entity.cardId === CardIds.PackLeader_TB_BaconUps_086 ? 4 : 2;
					modifyStats(spawned, statsBonus, 0, board, boardHero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, boardHero, otherHero);
				}
				break;
		}
	}
};
export const handleAddedMinionAuraEffect = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	spawned: BoardEntity,
	gameState: FullGameState,
): void => {
	switch (boardHero.heroPowerId) {
		case CardIds.SproutItOut:
			spawned.taunt = true;
			modifyStats(spawned, 1, 2, board, boardHero, gameState);
			break;
		case CardIds.KurtrusAshfallen_CloseThePortal:
			modifyStats(spawned, 2, 2, board, boardHero, gameState);
			break;
		case CardIds.Tinker_TB_BaconShop_HP_015:
			if (hasCorrectTribe(spawned, Race.MECH, gameState.allCards)) {
				modifyStats(spawned, 2, 0, board, boardHero, gameState);
			}
			break;
	}

	if (boardHero.questRewards?.includes(CardIds.TumblingDisaster_BG28_Reward_505)) {
		const tumblingDisasterBonus =
			boardHero.questRewardEntities?.find((e) => e.cardId === CardIds.TumblingDisaster_BG28_Reward_505)
				?.scriptDataNum1 || 1;
		modifyStats(spawned, tumblingDisasterBonus, tumblingDisasterBonus, board, boardHero, gameState);
	}

	// The board here already contains the new minion
	// TODO: what if the additional part is a potential target for the aura effect?
	applyAurasToSelf(spawned, board, boardHero, gameState);

	// Apply auras to board
	const cardIds = [spawned.cardId, ...(spawned.additionalCards ?? [])];
	for (const spawnedCardId of cardIds) {
		handleMinionAddedAuraEffect(
			spawnedCardId,
			spawned,
			board,
			boardHero,
			gameState.allCards,
			gameState.spectator,
			gameState.sharedState,
		);
	}
};

export const applyAurasToSelf = (
	spawned: BoardEntity,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	gameState: FullGameState,
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
						timing: gameState.sharedState.currentEntityId++,
					});
					break;
				case CardIds.TheSmokingGun:
					spawned.attack += 4;
					break;
			}
		}
	}

	if (hasCorrectTribe(spawned, Race.UNDEAD, gameState.allCards)) {
		if (boardHero.globalInfo.UndeadAttackBonus > 0) {
			modifyStats(spawned, boardHero.globalInfo.UndeadAttackBonus, 0, board, boardHero, gameState);
		}
	}
	if (hasCorrectTribe(spawned, Race.BEAST, gameState.allCards)) {
		if (boardHero.globalInfo.GoldrinnBuffAtk > 0) {
			modifyStats(
				spawned,
				boardHero.globalInfo.GoldrinnBuffAtk,
				boardHero.globalInfo.GoldrinnBuffHealth,
				board,
				boardHero,
				gameState,
			);
			gameState.spectator.registerPowerTarget(boardHero, spawned, board, null, null);
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
				if (hasCorrectTribe(spawned, Race.MURLOC, gameState.allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2;
				}
				break;
			case CardIds.HummingBird_BG26_805:
			case CardIds.HummingBird_BG26_805_G:
				if (hasCorrectTribe(spawned, Race.BEAST, gameState.allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.HummingBird_BG26_805_G ? 4 : 2;
				}
				break;
			case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
			case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
				if (hasCorrectTribe(spawned, Race.PIRATE, gameState.allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
					spawned.health += entity.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
				}
				break;
			case CardIds.Kathranatir_BG21_039:
			case CardIds.Kathranatir_BG21_039_G:
				if (hasCorrectTribe(spawned, Race.DEMON, gameState.allCards) && entity.entityId !== spawned.entityId) {
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
				if (hasCorrectTribe(spawned, Race.UNDEAD, gameState.allCards) && entity.entityId !== spawned.entityId) {
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
			modifyStats(spawned, statsBonusKnight, statsBonusKnight, board, boardHero, gameState);
			break;
		case CardIds.EnsorcelledFungus_BG28_555:
		case CardIds.EnsorcelledFungus_BG28_555_G:
			const multiplierFungus = spawned.cardId === CardIds.EnsorcelledFungus_BG28_555_G ? 2 : 1;
			const statsBonusFungus = multiplierFungus * boardHero.globalInfo.TavernSpellsCastThisGame;
			modifyStats(spawned, statsBonusFungus, 2 * statsBonusFungus, board, boardHero, gameState);
			break;
		case CardIds.FlourishingFrostling_BG26_537:
		case CardIds.FlourishingFrostling_BG26_537_G:
			const multiplierFrostling = spawned.cardId === CardIds.FlourishingFrostling_BG26_537_G ? 2 : 1;
			const statsBonusFrostling = multiplierFrostling * boardHero.globalInfo.FrostlingBonus;
			modifyStats(spawned, 2 * statsBonusFrostling, statsBonusFrostling, board, boardHero, gameState);
			break;
		case CardIds.RotHideGnoll_BG25_013:
		case CardIds.RotHideGnoll_BG25_013_G:
			const multiplierGnoll = spawned.cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			const statsBonusGnoll =
				multiplierGnoll * gameState.sharedState.deaths.filter((e) => e.friendly === spawned.friendly).length;
			modifyStats(spawned, statsBonusGnoll, 0, board, boardHero, gameState);
			break;
	}
};

// Introduced for Rapid Reanimation: since we will "addMinionToBoard" the minion afterwards, the auras will
// be re-applied then, so we need to remove them first
export const removeAurasFromSelf = (
	entity: BoardEntity,
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
					entity.attack = Math.max(0, entity.attack - 7);
					entity.health = Math.max(1, entity.health - 7);
					entity.enchantments = entity.enchantments.filter(
						(e) => e.cardId !== CardIds.VolatileVenom_VolatileEnchantment,
					);
					break;
				case CardIds.TheSmokingGun:
					entity.attack = Math.max(0, entity.attack - 7);
					break;
			}
		}
	}

	if (hasCorrectTribe(entity, Race.UNDEAD, allCards)) {
		if (boardHero.globalInfo.UndeadAttackBonus > 0) {
			entity.attack = Math.max(0, entity.attack - boardHero.globalInfo.UndeadAttackBonus);
		}
	}
	if (hasCorrectTribe(entity, Race.BEAST, allCards)) {
		if (boardHero.globalInfo.GoldrinnBuffAtk > 0) {
			entity.attack = Math.max(0, entity.attack - boardHero.globalInfo.GoldrinnBuffAtk);
			entity.health = Math.max(1, entity.health - boardHero.globalInfo.GoldrinnBuffHealth);
		}
	}

	for (const boardEntity of board) {
		switch (boardEntity.cardId) {
			case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
			case CardIds.MurlocWarleaderLegacy_TB_BaconUps_008:
				if (hasCorrectTribe(entity, Race.MURLOC, allCards) && entity.entityId !== boardEntity.entityId) {
					entity.attack = Math.max(
						0,
						entity.attack - (boardEntity.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2),
					);
				}
				break;
			case CardIds.HummingBird_BG26_805:
			case CardIds.HummingBird_BG26_805_G:
				if (hasCorrectTribe(entity, Race.BEAST, allCards) && entity.entityId !== boardEntity.entityId) {
					entity.attack = Math.max(
						0,
						entity.attack - (entity.cardId === CardIds.HummingBird_BG26_805_G ? 4 : 2),
					);
				}
				break;
			case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
			case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
				if (hasCorrectTribe(entity, Race.PIRATE, allCards) && entity.entityId !== boardEntity.entityId) {
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
			case CardIds.Kathranatir_BG21_039:
			case CardIds.Kathranatir_BG21_039_G:
				if (hasCorrectTribe(entity, Race.DEMON, allCards) && entity.entityId !== boardEntity.entityId) {
					entity.attack = Math.max(
						0,
						entity.attack - (boardEntity.cardId === CardIds.Kathranatir_BG21_039_G ? 2 : 1),
					);
				}
				break;
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
				if (hasCorrectTribe(entity, Race.UNDEAD, allCards) && entity.entityId !== boardEntity.entityId) {
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
			entity.attack = Math.max(0, entity.attack - statsBonusKnight);
			entity.health = Math.max(1, entity.health - statsBonusKnight);
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
		case CardIds.RotHideGnoll_BG25_013:
		case CardIds.RotHideGnoll_BG25_013_G:
			const multiplierGnoll = entity.cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			const statsBonusGnoll =
				multiplierGnoll * sharedState.deaths.filter((e) => e.friendly === entity.friendly).length;
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
	gameState: FullGameState,
): void => {
	for (const spawned of allSpawned) {
		handleAfterSpawnEffect(board, hero, spawned, gameState);
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
	spawned: BoardEntity,
	gameState: FullGameState,
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
						multiplier2 *
						(isCorrectTribe(gameState.allCards.getCard(spawned.cardId).races, Race.MURLOC) ? 1 : 0);
					if (buffAmount2 > 0) {
						modifyStats(entity, buffAmount2, 0, board, hero, gameState);
						gameState.spectator.registerPowerTarget(entity, entity, board, null, null);
					}
				}
				break;
			case CardIds.Felstomper_BG25_042:
			case CardIds.Felstomper_BG25_042_G:
			case CardIds.Deadstomper_BG28_634:
			case CardIds.Deadstomper_BG28_634_G:
				// console.debug('felstomper');
				if (entity.entityId !== spawned.entityId) {
					const felstomperBuff =
						entity.cardId === CardIds.Felstomper_BG25_042_G ||
						entity.cardId === CardIds.Deadstomper_BG28_634_G
							? 6
							: 3;
					board.forEach((e) => {
						modifyStats(e, felstomperBuff, 0, board, hero, gameState);
						gameState.spectator.registerPowerTarget(entity, e, board, null, null);
					});
				}
				break;
			case CardIds.XyloBones_BG26_172:
			case CardIds.XyloBones_BG26_172_G:
				if (entity.entityId !== spawned.entityId) {
					const xylobonesBuff = entity.cardId === CardIds.XyloBones_BG26_172_G ? 6 : 3;
					modifyStats(entity, 0, xylobonesBuff, board, hero, gameState);
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
				if (hasCorrectTribe(spawned, Race.BEAST, gameState.allCards) && entity.entityId !== spawned.entityId) {
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
			case CardIds.HungrySnapjaw_BG26_370:
			case CardIds.HungrySnapjaw_BG26_370_G:
				if (hasCorrectTribe(spawned, Race.BEAST, gameState.allCards) && entity.entityId !== spawned.entityId) {
					const snapjawBuff = entity.cardId === CardIds.HungrySnapjaw_BG26_370_G ? 2 : 1;
					modifyStats(entity, 0, snapjawBuff, board, hero, gameState);
				}
				break;
			case CardIds.ObserverOfMyths_BG_TTN_078:
			case CardIds.ObserverOfMyths_BG_TTN_078_G:
				if (spawned.attack > entity.attack) {
					const observerBuff = entity.cardId === CardIds.ObserverOfMyths_BG_TTN_078_G ? 2 : 1;
					addStatsToBoard(entity, board, hero, observerBuff, 0, gameState);
				}
				break;
			case CardIds.ValithriaDreamwalker_TB_BaconShop_HERO_53_Buddy:
			case CardIds.ValithriaDreamwalker_TB_BaconShop_HERO_53_Buddy_G:
				if (hasCorrectTribe(spawned, Race.DRAGON, gameState.allCards) && entity.entityId !== spawned.entityId) {
					const valithriaBuff =
						entity.cardId === CardIds.ValithriaDreamwalker_TB_BaconShop_HERO_53_Buddy_G ? 3 : 2;
					modifyStats(entity, valithriaBuff, valithriaBuff, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, spawned, board, null, null);
				}
				break;

			// Putricide-only
			case CardIds.ArmsDealer_BG26_RLK_824:
				if (hasCorrectTribe(spawned, Race.UNDEAD, gameState.allCards) && entity.entityId !== spawned.entityId) {
					modifyStats(spawned, 1, 0, board, hero, gameState);
					gameState.spectator.registerPowerTarget(entity, entity, board, null, null);
				}
				break;
		}
	}
};
