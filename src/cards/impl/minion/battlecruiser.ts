import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RebornEffectInput } from '../../../simulation/reborn';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { getRandomMinionWithHighestHealth } from '../../../utils';
import { DeathrattleEffectCard, OnAttackCard, RebornEffectCard, StartOfCombatCard } from '../../card.interface';

export const Battlecruiser: StartOfCombatCard & RebornEffectCard & OnAttackCard & DeathrattleEffectCard = {
	cardIds: [CardIds.LiftOff_BattlecruiserToken_BG31_HERO_801pt, CardIds.Battlecruiser_BG31_HERO_801pt_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// Enchantments can appear multiple times???
		const yamatoCannon = [...(minion.enchantments ?? [])]
			.reverse()
			.find((e) => e.cardId === CardIds.YamatoCannon_YamatoCannonEnchantment_BG31_HERO_801ptce);
		if (!yamatoCannon) {
			return false;
		}

		const damage = yamatoCannon.tagScriptDataNum1;
		const loops = minion.tags?.[GameTag.BACON_YAMATO_CANNON] === 1 ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const target = getRandomMinionWithHighestHealth(input.opponentBoard);
			if (!!target) {
				dealDamageToMinion(
					target,
					input.opponentBoard,
					input.opponentEntity,
					minion,
					damage,
					input.playerBoard,
					input.playerEntity,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.opponentBoard,
					input.playerEntity,
					input.opponentEntity,
				);
			}
		}
		return true;
	},
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput) => {
		const ultraCapacitor = [...(input.initialEntity.enchantments ?? [])]
			.reverse()
			.find((e) => e.cardId === CardIds.UltraCapacitor_UltraCapacitorEnchantment_BG31_HERO_801ptje);
		if (!ultraCapacitor) {
			return;
		}

		minion.enchantments = input.initialEntity.enchantments;
		minion.attack = input.initialEntity.maxAttack;
		minion.maxAttack = input.initialEntity.maxAttack;
		minion.health = input.initialEntity.maxHealth;
		minion.maxHealth = input.initialEntity.maxHealth;
		minion.divineShield = input.initialEntity.hadDivineShield;
		minion.taunt = input.initialEntity.taunt;
		minion.windfury = input.initialEntity.windfury;
		minion.poisonous = input.initialEntity.poisonous;
	},
	onAnyMinionAttack: (
		minion: BoardEntity,
		input: OnAttackInput,
	): {
		dmgDoneByAttacker: number;
		dmgDoneByDefender: number;
	} => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const advancedBallistics = [...(minion.enchantments ?? [])]
			.reverse()
			.find((e) => e.cardId === CardIds.AdvancedBallistics_AdvancedBallisticsEnchantment_BG31_HERO_801ptde);
		if (!advancedBallistics) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const buff = advancedBallistics.tagScriptDataNum1;
		const targets = input.attackingBoard.filter((entity) => entity !== minion);
		for (const target of targets) {
			modifyStats(target, buff, 0, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const caduceusReactor = [...(minion.enchantments ?? [])]
			.reverse()
			.find((e) => e.cardId === CardIds.CaduceusReactor_CaduceusReactorEnchantment_BG31_HERO_801ptee);
		if (!caduceusReactor) {
			return;
		}

		const target = input.boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead)[0];
		if (!target) {
			return;
		}

		const buff = caduceusReactor.tagScriptDataNum1;
		modifyStats(target, buff, buff, input.boardWithDeadEntity, input.boardWithDeadEntityHero, input.gameState);
		input.gameState.spectator.registerPowerTarget(
			minion,
			target,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			input.otherBoardHero,
		);
	},
};
