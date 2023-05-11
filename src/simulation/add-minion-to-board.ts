import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { WHELP_CARD_IDS } from '../cards/cards-data';
import {
	afterStatsUpdate,
	hasCorrectTribe,
	isCorrectTribe,
	modifyAttack,
	modifyHealth,
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
	handleAfterSpawnEffects(board, minionsToAdd, allCards, spectator);
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
): void => {
	board.splice(index, 0, minionToAdd);
	// Minion has already been removed from the board in the previous step
	handleSpawnEffect(board, boardHero, otherHero, minionToAdd, allCards, spectator, sharedState);
	if (performAfterSpawnEffects) {
		handleAfterSpawnEffects(board, [minionToAdd], allCards, spectator);
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
	if (otherHero.heroPowerId === CardIds.AllWillBurnBattlegrounds) {
		spawned.attack += 3;
	}

	switch (boardHero.heroPowerId) {
		case CardIds.AllWillBurnBattlegrounds:
			spawned.attack += 3;
			break;
		case CardIds.SproutItOutBattlegrounds:
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
		case CardIds.TinkerBattlegrounds:
			if (hasCorrectTribe(spawned, Race.MECH, allCards)) {
				modifyAttack(spawned, 2, board, allCards);
				afterStatsUpdate(spawned, board, allCards);
			}
			break;
	}

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
					spawned.attack += 5;
					break;
			}
		}
	}

	const cardIds = [spawned.cardId, ...(spawned.additionalCards ?? [])];
	for (const spawnedCardId of cardIds) {
		switch (spawnedCardId) {
			case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
			case CardIds.SouthseaCaptainLegacyBattlegrounds:
				board
					.filter((e) => hasCorrectTribe(e, Race.PIRATE, allCards))
					// Other
					.filter((e) => e.entityId !== spawned.entityId)
					.forEach((e) => {
						e.attack += spawned.cardId === CardIds.SouthseaCaptainLegacyBattlegrounds ? 2 : 1;
						e.health += spawned.cardId === CardIds.SouthseaCaptainLegacyBattlegrounds ? 2 : 1;
					});
				break;
			case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
			case CardIds.MurlocWarleaderLegacyBattlegrounds:
				board
					.filter((e) => hasCorrectTribe(e, Race.MURLOC, allCards))
					.filter((e) => e.entityId !== spawned.entityId)
					.forEach((e) => {
						e.attack += spawned.cardId === CardIds.MurlocWarleaderLegacyBattlegrounds ? 4 : 2;
					});
				break;
			case CardIds.HummingBird:
			case CardIds.HummingBirdBattlegrounds:
				board
					.filter((e) => hasCorrectTribe(e, Race.BEAST, allCards))
					.filter((e) => e.entityId !== spawned.entityId)
					.forEach((e) => {
						e.attack += spawned.cardId === CardIds.HummingBirdBattlegrounds ? 4 : 2;
					});
				break;
			case CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy:
			case CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy_G:
				board.forEach((e) => {
					e.attack +=
						spawned.cardId === CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy_G ? 6 : 3;
				});
				break;
			case CardIds.Kathranatir_BG21_039:
			case CardIds.KathranatirBattlegrounds:
				board
					.filter((e) => hasCorrectTribe(e, Race.DEMON, allCards))
					.filter((e) => e.entityId !== spawned.entityId)
					.forEach((e) => {
						e.attack += spawned.cardId === CardIds.KathranatirBattlegrounds ? 4 : 2;
					});
				break;
			case CardIds.CyborgDrake:
			case CardIds.CyborgDrakeBattlegrounds:
				board
					.filter((e) => e.divineShield)
					.forEach((e) => {
						e.attack += spawned.cardId === CardIds.CyborgDrakeBattlegrounds ? 16 : 8;
					});
				break;

			case CardIds.EternalKnight:
			case CardIds.EternalKnightBattlegrounds:
				const multiplierKnight = spawned.cardId === CardIds.EternalKnightBattlegrounds ? 2 : 1;
				const statsBonusKnight = multiplierKnight * boardHero.globalInfo.EternalKnightsDeadThisGame;
				modifyAttack(spawned, statsBonusKnight, board, allCards);
				modifyHealth(spawned, statsBonusKnight, board, allCards);
				afterStatsUpdate(spawned, board, allCards);
				break;
			case CardIds.RotHideGnoll:
			case CardIds.RotHideGnollBattlegrounds:
				const multiplierGnoll = spawned.cardId === CardIds.RotHideGnollBattlegrounds ? 2 : 1;
				const statsBonusGnoll =
					multiplierGnoll * sharedState.deaths.filter((e) => e.friendly === spawned.friendly).length;
				modifyAttack(spawned, statsBonusGnoll, board, allCards);
				afterStatsUpdate(spawned, board, allCards);
				break;
		}
	}

	if (hasCorrectTribe(spawned, Race.UNDEAD, allCards)) {
		if (boardHero.globalInfo.UndeadAttackBonus > 0) {
			modifyAttack(spawned, boardHero.globalInfo.UndeadAttackBonus, board, allCards);
			afterStatsUpdate(spawned, board, allCards);
		}
	}

	// https://twitter.com/LoewenMitchell/status/1491879869457879040
	if (cardIds.some((cardId) => WHELP_CARD_IDS.includes(cardId as CardIds))) {
		const manyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelps);
		const goldenManyWhelps = board.filter((entity) => entity.cardId === CardIds.ManyWhelpsBattlegrounds);
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
			case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
			case CardIds.MurlocWarleaderLegacyBattlegrounds:
				if (hasCorrectTribe(spawned, Race.MURLOC, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.MurlocWarleaderLegacyBattlegrounds ? 4 : 2;
				}
				break;
			case CardIds.HummingBird:
			case CardIds.HummingBirdBattlegrounds:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.HummingBirdBattlegrounds ? 4 : 2;
				}
				break;
			case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
			case CardIds.SouthseaCaptainLegacyBattlegrounds:
				if (hasCorrectTribe(spawned, Race.PIRATE, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.SouthseaCaptainLegacyBattlegrounds ? 2 : 1;
					spawned.health += entity.cardId === CardIds.SouthseaCaptainLegacyBattlegrounds ? 2 : 1;
				}
				break;
			case CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy:
			case CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy_G:
				spawned.attack +=
					entity.cardId === CardIds.LadySinestraBattlegrounds_TB_BaconShop_HERO_52_Buddy_G ? 6 : 3;
				break;
			case CardIds.Kathranatir_BG21_039:
			case CardIds.KathranatirBattlegrounds:
				if (hasCorrectTribe(spawned, Race.DEMON, allCards) && entity.entityId !== spawned.entityId) {
					spawned.attack += entity.cardId === CardIds.KathranatirBattlegrounds ? 2 : 1;
				}
				break;
			case CardIds.CyborgDrake:
			case CardIds.CyborgDrakeBattlegrounds:
				if (spawned.divineShield) {
					spawned.attack += entity.cardId === CardIds.CyborgDrakeBattlegrounds ? 16 : 8;
				}
				break;

			case CardIds.BabyYshaarjBattlegrounds_TB_BaconShop_HERO_92_Buddy:
			case CardIds.BabyYshaarjBattlegrounds_TB_BaconShop_HERO_92_Buddy_G:
				if (allCards.getCard(spawned.cardId).techLevel === boardHero.tavernTier) {
					const statsBonus =
						entity.cardId === CardIds.BabyYshaarjBattlegrounds_TB_BaconShop_HERO_92_Buddy_G ? 8 : 4;
					modifyAttack(spawned, statsBonus, board, allCards);
					modifyHealth(spawned, statsBonus, board, allCards);
					afterStatsUpdate(spawned, board, allCards);
				}
				break;
			// This has to happen after greybough's hero power kicks in
			case CardIds.WanderingTreantBattlegrounds_TB_BaconShop_HERO_95_Buddy:
			case CardIds.WanderingTreantBattlegrounds_TB_BaconShop_HERO_95_Buddy_G:
				if (spawned.taunt) {
					const statsBonus =
						entity.cardId === CardIds.WanderingTreantBattlegrounds_TB_BaconShop_HERO_95_Buddy_G ? 4 : 2;
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
			case CardIds.DeflectOBot:
			case CardIds.DeflectOBotBattlegrounds:
				if (hasCorrectTribe(spawned, Race.MECH, allCards)) {
					const statsBonus = entity.cardId === CardIds.DeflectOBotBattlegrounds ? 4 : 2;
					if (!entity.divineShield) {
						updateDivineShield(entity, board, true, allCards);
					}
					modifyAttack(entity, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.Bigfernal:
			case CardIds.BigfernalBattlegrounds:
				if (hasCorrectTribe(spawned, Race.DEMON, allCards)) {
					const statsBonus = entity.cardId === CardIds.BigfernalBattlegrounds ? 2 : 1;
					modifyAttack(entity, statsBonus, board, allCards);
					modifyHealth(entity, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.MamaBear:
			case CardIds.MamaBearBattlegrounds:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards)) {
					const statsBonus = entity.cardId === CardIds.MamaBearBattlegrounds ? 10 : 5;
					modifyAttack(spawned, statsBonus, board, allCards);
					modifyHealth(spawned, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.PackLeader:
			case CardIds.PackLeaderBattlegrounds:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards)) {
					const statsBonus = entity.cardId === CardIds.PackLeaderBattlegrounds ? 4 : 2;
					modifyAttack(spawned, statsBonus, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
		}
	}
};

const handleAfterSpawnEffects = (
	board: BoardEntity[],
	allSpawned: readonly BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	for (const spawned of allSpawned) {
		handleAfterSpawnEffect(board, spawned, allCards, spectator);
	}
};

const handleAfterSpawnEffect = (
	board: BoardEntity[],
	spawned: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	// console.debug('after spawn', stringifySimpleCard(spawned, allCards), stringifySimple(board, allCards));
	for (const entity of board) {
		switch (entity.cardId) {
			case CardIds.MurlocTidecallerLegacy:
			case CardIds.MurlocTidecallerBattlegrounds:
				const multiplier = entity.cardId === CardIds.MurlocTidecallerBattlegrounds ? 2 : 1;
				const buffAmount =
					multiplier * (isCorrectTribe(allCards.getCard(spawned.cardId).races, Race.MURLOC) ? 1 : 0);
				if (buffAmount > 0) {
					modifyAttack(entity, buffAmount, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.Swampstriker:
			case CardIds.SwampstrikerBattlegrounds:
				const multiplier2 = entity.cardId === CardIds.SwampstrikerBattlegrounds ? 2 : 1;
				const buffAmount2 =
					multiplier2 * (isCorrectTribe(allCards.getCard(spawned.cardId).races, Race.MURLOC) ? 1 : 0);
				if (buffAmount2 > 0) {
					modifyAttack(entity, buffAmount2, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
			case CardIds.Felstomper:
			case CardIds.FelstomperBattlegrounds:
				// console.debug('felstomper');
				const felstomperBuff = entity.cardId === CardIds.FelstomperBattlegrounds ? 6 : 3;
				board.forEach((e) => {
					modifyAttack(e, felstomperBuff, board, allCards);
					afterStatsUpdate(e, board, allCards);
					spectator.registerPowerTarget(entity, e, board);
				});
				break;
			case CardIds.OctosariWrapGod:
			case CardIds.OctosariWrapGodBattlegrounds:
				const octoStats = entity.cardId === CardIds.OctosariWrapGodBattlegrounds ? 4 : 2;
				entity.scriptDataNum1 += octoStats;
				break;
			case CardIds.BananaSlamma:
			case CardIds.BananaSlammaBattlegrounds:
				if (hasCorrectTribe(spawned, Race.BEAST, allCards)) {
					const bananaStatBuff = entity.cardId === CardIds.BananaSlammaBattlegrounds ? 3 : 2;
					spawned.attack = spawned.attack * bananaStatBuff;
					spawned.health = spawned.health * bananaStatBuff;
				}
				break;

			// Putricide-only
			case CardIds.ArmsDealer_BG26_RLK_824:
				if (hasCorrectTribe(spawned, Race.UNDEAD, allCards)) {
					modifyAttack(spawned, 1, board, allCards);
					afterStatsUpdate(entity, board, allCards);
					spectator.registerPowerTarget(entity, entity, board);
				}
				break;
		}
	}
};
