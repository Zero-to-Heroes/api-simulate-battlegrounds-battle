import { GameTag, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnWheneverAnotherMinionAttacks, hasRally } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { updateReborn } from '../keywords/reborn';
import { CardIds } from '../services/card-ids';
import { pickRandom } from '../services/utils';
import { hasCorrectTribe, hasEntityMechanic } from '../utils';
import { dealDamageToMinion, getNeighbours } from './attack';
import { addCardsInHand } from './cards-in-hand';
import { fixEnchantments } from './enchantments';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

// Whenever it attacks
export const applyOnAttackEffects = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): { damageDoneByAttacker: number; damageDoneByDefender: number } => {
	let damageDoneByAttacker = 0;
	let damageDoneByDefender = 0;

	for (const trinket of attackingBoardHero.trinkets ?? []) {
		const onAttackImpl = cardMappings[trinket.cardId];
		if (hasOnWheneverAnotherMinionAttacks(onAttackImpl)) {
			const { dmgDoneByAttacker, dmgDoneByDefender } = onAttackImpl.onWheneverAnotherMinionAttacks(trinket, {
				attacker: attacker,
				attackingHero: attackingBoardHero,
				attackingBoard: attackingBoard,
				defendingEntity: defendingEntity,
				defendingHero: defendingBoardHero,
				defendingBoard: defendingBoard,
				gameState,
				playerIsFriendly: attackingBoardHero.friendly,
			});
			damageDoneByAttacker += dmgDoneByAttacker;
			damageDoneByDefender += dmgDoneByDefender;
		}
	}

	// "Whenever friendly minion attacks" triggers before the rally itself?
	// https://replays.firestoneapp.com/?reviewId=04e6a624-ccd5-4068-9420-884843f3685f&turn=25&action=1
	const attackingBoardOtherEntities = attackingBoard.filter((e) => e !== attacker);
	for (const boardEntity of attackingBoardOtherEntities) {
		const onAttackImpl = cardMappings[boardEntity.cardId];
		if (hasOnWheneverAnotherMinionAttacks(onAttackImpl)) {
			const { dmgDoneByAttacker, dmgDoneByDefender } = onAttackImpl.onWheneverAnotherMinionAttacks(boardEntity, {
				attacker: attacker,
				attackingHero: attackingBoardHero,
				attackingBoard: attackingBoard,
				defendingEntity: defendingEntity,
				defendingHero: defendingBoardHero,
				defendingBoard: defendingBoard,
				gameState,
				playerIsFriendly: attackingBoardHero.friendly,
			});
			damageDoneByAttacker += dmgDoneByAttacker;
			damageDoneByDefender += dmgDoneByDefender;
		}
		const enchantments = boardEntity.enchantments;
		for (const enchantment of enchantments) {
			const onAttackImpl = cardMappings[enchantment.cardId];
			if (hasOnWheneverAnotherMinionAttacks(onAttackImpl)) {
				const { dmgDoneByAttacker, dmgDoneByDefender } = onAttackImpl.onWheneverAnotherMinionAttacks(
					enchantment,
					{
						attacker: attacker,
						attackingHero: attackingBoardHero,
						attackingBoard: attackingBoard,
						defendingEntity: defendingEntity,
						defendingHero: defendingBoardHero,
						defendingBoard: defendingBoard,
						gameState,
						playerIsFriendly: attackingBoardHero.friendly,
					},
				);
				damageDoneByAttacker += dmgDoneByAttacker;
				damageDoneByDefender += dmgDoneByDefender;
			}
		}
	}

	// This assumes that only "Rally" effects trigger on attack
	// 2025-08-20: this is false. "Whenever a friendly minion attacks" is not a rally effect
	const isAttackerRallying = hasEntityMechanic(attacker, GameTag.BACON_RALLY, gameState.allCards);
	const numberOfRallyingCries =
		attackingBoardHero.questRewardEntities?.filter((r) => r.cardId === CardIds.RallyingCry_BG33_Reward_021)
			.length ?? 0;
	const rallyLoops = 1 + (isAttackerRallying ? numberOfRallyingCries : 0);
	for (let i = 0; i < rallyLoops; i++) {
		const onAttackImpl = cardMappings[attacker.cardId];
		if (hasRally(onAttackImpl)) {
			const { dmgDoneByAttacker, dmgDoneByDefender } = onAttackImpl.rally(attacker, {
				attacker: attacker,
				attackingHero: attackingBoardHero,
				attackingBoard: attackingBoard,
				defendingEntity: defendingEntity,
				defendingHero: defendingBoardHero,
				defendingBoard: defendingBoard,
				gameState,
				playerIsFriendly: attackingBoardHero.friendly,
			});
			damageDoneByAttacker += dmgDoneByAttacker;
			damageDoneByDefender += dmgDoneByDefender;
		}
		const enchantments = attacker.enchantments;
		for (const enchantment of enchantments) {
			const onAttackImpl = cardMappings[enchantment.cardId];
			if (hasRally(onAttackImpl)) {
				let enchantmentToMinion: BoardEntity = {
					...enchantment,
					entityId: attacker.entityId,
					attack: attacker.attack,
					health: attacker.health,
					maxHealth: attacker.maxHealth,
					maxAttack: attacker.maxAttack,
					abiityChargesLeft: attacker.abiityChargesLeft,
				};
				enchantmentToMinion = fixEnchantments(enchantmentToMinion, gameState.allCards);
				const { dmgDoneByAttacker, dmgDoneByDefender } = onAttackImpl.rally(enchantmentToMinion, {
					attacker: attacker,
					attackingHero: attackingBoardHero,
					attackingBoard: attackingBoard,
					defendingEntity: defendingEntity,
					defendingHero: defendingBoardHero,
					defendingBoard: defendingBoard,
					gameState,
					playerIsFriendly: attackingBoardHero.friendly,
				});
				damageDoneByAttacker += dmgDoneByAttacker;
				damageDoneByDefender += dmgDoneByDefender;
			}
		}
	}

	// if (attacker.cardId === CardIds.GlyphGuardian_BGS_045) {
	// 	// For now the utility method only works additively, so we hack around it
	// 	modifyStats(
	// 		attacker,
	// 		null,
	// 		2 * attacker.attack - attacker.attack,
	// 		0,
	// 		attackingBoard,
	// 		attackingBoardHero,
	// 		gameState,
	// 	);
	// } else if (attacker.cardId === CardIds.GlyphGuardian_TB_BaconUps_115) {
	// 	modifyStats(
	// 		attacker,
	// 		null,
	// 		3 * attacker.attack - attacker.attack,
	// 		0,
	// 		attackingBoard,
	// 		attackingBoardHero,
	// 		gameState,
	// 	);
	// } else
	if (attacker.cardId === CardIds.GlimGuardian_BG29_888 || attacker.cardId === CardIds.GlimGuardian_BG29_888_G) {
		const multiplier = attacker.cardId === CardIds.GlimGuardian_BG29_888_G ? 2 : 1;
		modifyStats(attacker, attacker, 2 * multiplier, 0, attackingBoard, attackingBoardHero, gameState);
	} else if (
		attacker.cardId === CardIds.VanessaVancleef_BG24_708 ||
		attacker.cardId === CardIds.VanessaVancleef_BG24_708_G
	) {
		attackingBoard
			.filter((e) => hasCorrectTribe(e, attackingBoardHero, Race.PIRATE, gameState.anomalies, gameState.allCards))
			.forEach((e) => {
				modifyStats(
					e,
					attacker,
					attacker.cardId === CardIds.VanessaVancleef_BG24_708_G ? 4 : 2,
					attacker.cardId === CardIds.VanessaVancleef_BG24_708_G ? 4 : 2,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
			});
	} else if (
		attacker.cardId === CardIds.WhirlingLassOMatic_BG28_635 ||
		attacker.cardId === CardIds.WhirlingLassOMatic_BG28_635_G
	) {
		const numberOfCardsToAdd = attacker.cardId === CardIds.WhirlingLassOMatic_BG28_635_G ? 2 : 1;
		const cardsToAdd = Array.from({ length: numberOfCardsToAdd }).map(() => null);
		addCardsInHand(attackingBoardHero, attackingBoard, cardsToAdd, gameState);
	} else if (attacker.cardId === CardIds.Rampager_BG29_809 || attacker.cardId === CardIds.Rampager_BG29_809_G) {
		const loops = attacker.cardId === CardIds.Rampager_BG29_809_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			// Don't include new spawns
			for (const entity of [...attackingBoard]) {
				if (entity.entityId === attacker.entityId) {
					continue;
				}
				const isSameSide = entity.friendly === attacker.friendly;
				const board = isSameSide ? attackingBoard : defendingBoard;
				const hero = isSameSide ? attackingBoardHero : defendingBoardHero;
				dealDamageToMinion(
					entity,
					board,
					hero,
					attacker,
					1,
					isSameSide ? defendingBoard : attackingBoard,
					isSameSide ? defendingBoardHero : attackingBoardHero,
					gameState,
				);
			}
		}
	} else if (attacker.cardId === CardIds.HatefulHag_BG29_120 || attacker.cardId === CardIds.HatefulHag_BG29_120_G) {
		const loops = attacker.cardId === CardIds.HatefulHag_BG29_120_G ? 2 : 1;
		const attackerIndex = attackingBoard.indexOf(attacker);
		for (let i = 1; i <= loops; i++) {
			const target = attackingBoard[attackerIndex + i];
			if (!!target) {
				updateReborn(target, true, attackingBoard, attackingBoardHero, defendingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					attacker,
					target,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
			}
		}
	}

	const eclipsion = attackingBoard.find(
		(e) =>
			[
				CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy,
				CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy_G,
			].includes(e.cardId as CardIds) && e.abiityChargesLeft > 0,
	);
	// Only once per minion
	if (!!eclipsion && attacker.immuneWhenAttackCharges == null) {
		attacker.immuneWhenAttackCharges = 1;
		// If we have 2 eclipsions, the first minion that attacks eats both charges
		attackingBoard
			.filter((e) =>
				[
					CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy,
					CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy_G,
				].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				e.abiityChargesLeft--;
			});
	}

	for (const trinket of attackingBoardHero.trinkets) {
		switch (trinket.cardId) {
			case CardIds.CeremonialSword_BG30_MagicItem_925:
				modifyStats(attacker, trinket, 4, 0, attackingBoard, attackingBoardHero, gameState);
				break;
		}
	}

	return { damageDoneByAttacker, damageDoneByDefender };
};

export interface OnAttackInput {
	attacker: BoardEntity;
	attackingHero: BgsPlayerEntity;
	attackingBoard: BoardEntity[];
	defendingEntity: BoardEntity;
	defendingHero: BgsPlayerEntity;
	defendingBoard: BoardEntity[];
	gameState: FullGameState;
	playerIsFriendly: boolean;
}
