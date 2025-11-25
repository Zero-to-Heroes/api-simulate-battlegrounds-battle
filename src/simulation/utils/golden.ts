import { AllCardsService, GameTag } from '@firestone-hs/reference-data';
import { BgsPlayerEntity, BoardTrinket } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { eternalKnightAttack, eternalKnightHealth } from '../../cards/impl/trinket/eternal-portrait';
import { CardIds } from '../../services/card-ids';
import { addImpliedMechanics } from '../../utils';
import { handleAddedMinionAuraEffect } from '../add-minion-to-board';
import { FullGameState } from '../internal-game-state';
import { handleMinionRemovedAuraEffect } from '../remove-minion-from-board';
import { modifyStats } from '../stats';

export const makeMinionGolden = (
	target: BoardEntity,
	source: BoardEntity | BgsPlayerEntity | BoardTrinket,
	targetBoard: BoardEntity[],
	targetBoardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// Typically, we are already golden
	if (isMinionGolden(target, gameState.allCards)) {
		return;
	}

	gameState.spectator.registerPowerTarget(source, target, targetBoard, null, null);

	// console.log('before transforming minion', stringifySimple(targetBoard, allCards));
	handleMinionRemovedAuraEffect(targetBoard, target, targetBoardHero, gameState);
	// Specific for making a minion golden
	// This is not handled in handleMinionRemovedAuraEffect, though I'm not entirely sure why. Maybe because it's a self-effect only?
	// Also, because of how I implemented auras and such, it's probably good to have something specific for golden
	removeMinionAuraEffectsForGolden(target, targetBoardHero);
	// console.log('after removed effect', stringifySimple(targetBoard, allCards));
	const refCard = gameState.allCards.getCard(target.cardId);
	let goldenCard = gameState.allCards.getCardFromDbfId(refCard.battlegroundsPremiumDbfId);
	// Happens when there is no dedicated golden card, like for the Bettle token from Boon of Beetles
	if (!goldenCard?.id) {
		goldenCard = refCard;
	}

	// A minion becoming golden ignore the current death.
	// This way of handling it is not ideal, since it will still trigger if both avenges trigger at the same time, but
	// should solve the other cases
	// Update 2024-06-21: I'm not sure what this is about exactly. See
	// http://replays.firestoneapp.com/?reviewId=5d94ebeb-3691-4509-88de-5d5418b20597&turn=11&action=2
	// The Sr. Tomb Diver dies, thus gilding the Phaerix. Two other deaths later, the avenge procs
	// This means the death of the diver counted normally
	// target.avengeCurrent = Math.min(target.avengeDefault, target.avengeCurrent + 1);

	// Only change the card ID after modifying the stats, so that some effects (like Tarecgosa) won't trigger
	// too early
	// TODO: add a replay with Tarec to illustrate the difference with Defiant Shipwright, and
	// check if there is something different with Tarec
	target.cardId = goldenCard.id;
	// 33.6.2 (https://replays.firestoneapp.com/?reviewId=3b025701-01f5-4527-9d53-d8d67f78c5c8&turn=7&action=0)
	//    The Phylactery enchantment exists before the Golden Deathrattle power so it goes first.
	//    This most likely means that we need to create a new entityId when gilding a minion, so that it
	// is processed in the correct order.
	target.entityId = gameState.sharedState.currentEntityId++;

	// The rule for golden minions is to add the base stats
	// TO CHECK: not sure that this is what actually happens (i.e. do minions that trigger on stats modifications
	// trigger?)
	// UPDATE 2024-06-20: Defiant Shipwright (2/5) going golden (4/10) actually ends up at 4/12 because
	// of the +2 health bonus
	// http://replays.firestoneapp.com/?reviewId=283dc44c-5fc8-40fb-af89-7d752a39f9b9&turn=7&action=1
	// BUT (2025-05-10) Tarecgosa going golden just becomes a 10/10, it doesn't get the x2 from the buff
	// Maybe that's because it's not an enchantment, so let's just hard-code this here
	// (bug: it won't work with Poets)
	// Update 2025-05-05: Whelp Smuggler going golden doesn't not trigger the other whelp smuggler stat buff
	// https://replays.firestoneapp.com/?reviewId=253ddf7c-be1b-44f4-aa78-9a23442d3687&turn=15&action=0
	// So I'm just modifying the stats here without triggering any side-effects
	// target.attack += refCard.attack;
	// target.health += refCard.health;
	// UPDATE 33.6: Defiant Shipwright going golden triggers its effect. Not sure how this should behave
	// https://replays.firestoneapp.com/?reviewId=52ae764d-6dc8-43cc-bd00-035a121e2388&turn=11&action=0
	modifyStats(target, null, refCard.attack, refCard.health, targetBoard, targetBoardHero, gameState, true, false);

	// console.log('before adding new effect', stringifySimple(targetBoard, allCards));
	handleAddedMinionAuraEffect(targetBoard, targetBoardHero, otherBoard, otherHero, target, gameState, true, false);
	const hasDivineShield = target.divineShield;
	const hasReborn = target.reborn;
	const avengeCurrent = target.avengeCurrent;
	addImpliedMechanics(target, gameState.cardsData);

	// addImpliedMechanics grants divine shield if the card has divine shield, or if the entity had
	// it at some point. That means that when we gild Zilliax: Defense Module (with Divine Shield) into
	// Zilliaw: Assembled, we restore the divine shield, while we shouldn't
	target.divineShield = hasDivineShield;
	// Update 2024-06-19: Hat tested on one of their build, and gilding a zilliax module should NOT
	// remove its divine shield / reborn status
	// Gilding a reborn Risen Rider results into a golden Risen Rider with reborn
	// http://replays.firestoneapp.com/?reviewId=c553c3e7-01e2-494d-80f8-69f33c08fb39&turn=7&action=4
	target.reborn = hasReborn || goldenCard.mechanics?.includes(GameTag[GameTag.REBORN]);
	// target.windfury = refGoldenCard.mechanics?.includes(GameTag[GameTag.WINDFURY]);
	// target.taunt = refGoldenCard.mechanics?.includes(GameTag[GameTag.TAUNT]);
	// target.stealth = refGoldenCard.mechanics?.includes(GameTag[GameTag.STEALTH]);
	target.avengeCurrent = avengeCurrent;
	target.gildedInCombat = true;

	// console.log('after adding new effect', stringifySimple(targetBoard, allCards));
};

export const isMinionGolden = (entity: BoardEntity, allCards: AllCardsService): boolean => {
	const ref = allCards.getCard(entity.cardId);
	// Some cards (like the Bettle token from Boon of Beetles) don't have a premium dbf id. However, we can still
	// gild it
	return ref.premium;
};

// This feels wrong, and is probably an indicator that auras are not applied at the right time
const removeMinionAuraEffectsForGolden = (entity: BoardEntity, hero: BgsPlayerEntity) => {
	switch (entity.cardId) {
		case CardIds.EternalKnight_BG25_008:
		case CardIds.EternalKnight_BG25_008_G:
			const eternalKnightBuffToRemove = hero.globalInfo.EternalKnightsDeadThisGame;
			const eternalKnighMultiplier = entity.cardId === CardIds.EternalKnight_BG25_008_G ? 2 : 1;
			entity.health = Math.max(
				1,
				entity.health - eternalKnightHealth * eternalKnighMultiplier * eternalKnightBuffToRemove,
			);
			entity.attack = Math.max(
				0,
				entity.attack - eternalKnightAttack * eternalKnighMultiplier * eternalKnightBuffToRemove,
			);
			break;
		case CardIds.SanlaynScribe_BGDUO31_208:
		case CardIds.SanlaynScribe_BGDUO31_208_G:
			const sanlaynBuffToRemove = hero.globalInfo.SanlaynScribesDeadThisGame;
			const sanlaynMultiplier = entity.cardId === CardIds.SanlaynScribe_BGDUO31_208_G ? 2 : 1;
			entity.health = Math.max(1, entity.health - sanlaynMultiplier * sanlaynBuffToRemove);
			entity.attack = Math.max(0, entity.attack - sanlaynMultiplier * sanlaynBuffToRemove);
			break;
		case CardIds.AstralAutomaton_BG_TTN_401:
		case CardIds.AstralAutomaton_BG_TTN_401_G:
			const multiplierAstral = entity.cardId === CardIds.AstralAutomaton_BG_TTN_401_G ? 2 : 1;
			// Doesn't count self
			const statsBonusAstralToRemove = hero.globalInfo.AstralAutomatonsSummonedThisGame - 1;
			entity.health = Math.max(1, entity.health - 3 * multiplierAstral * statsBonusAstralToRemove);
			entity.attack = Math.max(0, entity.attack - 2 * multiplierAstral * statsBonusAstralToRemove);
			break;
		case CardIds.DrBoomsMonster_BG31_176:
		case CardIds.DrBoomsMonster_BG31_176_G:
			const multiplierDrBoom = entity.cardId === CardIds.DrBoomsMonster_BG31_176_G ? 2 : 1;
			entity.health = Math.max(1, entity.health - 2 * hero.globalInfo.MagnetizedThisGame * multiplierDrBoom);
			entity.attack = Math.max(0, entity.attack - 2 * hero.globalInfo.MagnetizedThisGame * multiplierDrBoom);
			break;
	}
};
