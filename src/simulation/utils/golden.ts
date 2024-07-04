import { AllCardsService, CardIds, GameTag } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { addImpliedMechanics } from '../../utils';
import { handleAddedMinionAuraEffect } from '../add-minion-to-board';
import { FullGameState } from '../internal-game-state';
import { handleMinionRemovedAuraEffect } from '../remove-minion-from-board';
import { modifyStats } from '../stats';

export const makeMinionGolden = (
	target: BoardEntity,
	source: BoardEntity | BgsPlayerEntity,
	targetBoard: BoardEntity[],
	targetBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// Typically, we are already golden
	if (isMinionGolden(target, gameState.allCards)) {
		return;
	}

	gameState.spectator.registerPowerTarget(source, target, targetBoard, null, null);

	// console.log('before transforming minion', stringifySimple(targetBoard, allCards));
	handleMinionRemovedAuraEffect(targetBoard, target, targetBoardHero, gameState.allCards, gameState.spectator);
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
	const refGoldenCard = gameState.allCards.getCard(target.cardId);
	target.cardId = goldenCard.id;

	// The rule for golden minions is to add the base stats
	// TO CHECK: not sure that this is what actually happens (i.e. do minions that trigger on stats modifications
	// trigger?)
	// UPDATE 2024-06-20: Defiant Shipwright (2/5) going golden (4/10) actually ends up at 4/12 because
	// of the +2 health bonus
	// http://replays.firestoneapp.com/?reviewId=283dc44c-5fc8-40fb-af89-7d752a39f9b9&turn=7&action=1
	modifyStats(target, refCard.attack, refCard.health, targetBoard, targetBoardHero, gameState);

	// console.log('before adding new effect', stringifySimple(targetBoard, allCards));
	handleAddedMinionAuraEffect(targetBoard, targetBoardHero, target, gameState);
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
	target.reborn = hasReborn || refGoldenCard.mechanics?.includes(GameTag[GameTag.REBORN]);
	// target.windfury = refGoldenCard.mechanics?.includes(GameTag[GameTag.WINDFURY]);
	// target.taunt = refGoldenCard.mechanics?.includes(GameTag[GameTag.TAUNT]);
	// target.stealth = refGoldenCard.mechanics?.includes(GameTag[GameTag.STEALTH]);
	target.avengeCurrent = avengeCurrent;

	// console.log('after adding new effect', stringifySimple(targetBoard, allCards));
};

export const isMinionGolden = (entity: BoardEntity, allCards: AllCardsService): boolean => {
	const ref = allCards.getCard(entity.cardId);
	// Some cards (like the Bettle token from Boon of Beetles) don't have a premium dbf id. However, we can still
	// gild it
	return ref.premium || !!ref.battlegroundsNormalDbfId;
};

const removeMinionAuraEffectsForGolden = (entity: BoardEntity, hero: BgsPlayerEntity) => {
	switch (entity.cardId) {
		case CardIds.EternalKnight_BG25_008:
		case CardIds.EternalKnight_BG25_008_G:
			const eternalKnightBuffToRemove = hero.globalInfo.EternalKnightsDeadThisGame ?? 0;
			const eternalKnighMultiplier = entity.cardId === CardIds.EternalKnight_BG25_008_G ? 2 : 1;
			entity.health = Math.max(1, entity.health - eternalKnighMultiplier * eternalKnightBuffToRemove);
			entity.attack = Math.max(0, entity.attack - eternalKnighMultiplier * eternalKnightBuffToRemove);
			break;
	}
};
