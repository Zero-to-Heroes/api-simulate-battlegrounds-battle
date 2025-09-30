import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToMinion } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RebornEffectInput } from '../../../simulation/reborn';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { getRandomMinionWithHighestHealth } from '../../../utils';
import { DeathrattleSpawnCard, RallyCard, RebornSelfEffectCard, StartOfCombatCard } from '../../card.interface';

export const Battlecruiser: StartOfCombatCard & RebornSelfEffectCard & RallyCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.LiftOff_BattlecruiserToken_BG31_HERO_801pt, CardIds.Battlecruiser_BG31_HERO_801pt_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// Enchantments can appear multiple times???
		const yamatoCannons = [...minion.enchantments]
			// .reverse()
			.filter((e) => e.cardId === CardIds.YamatoCannon_YamatoCannonEnchantment_BG31_HERO_801ptce);
		if (!yamatoCannons?.length) {
			return false;
		}

		// Still not sure how these should be processed
		// In some cases, it feels like it takes the sum of the damage, in other cases it runs them one after the other
		// (but maybe that's just the replay aggregating the values)
		// I'm not sure about the BACON_YAMATO_CANNON tag; it seems like it indicates multiple cannons, but I'm not sure
		// Other issues: looks like that if there are multiple cannon enchantments but no divine shield, everything is applied to the same target
		// So it looks as if the target is selected first, then everything targets it
		// https://replays.firestoneapp.com/?reviewId=e8f38ab0-3380-4275-88d8-0715d69d3f08&turn=21&action=1
		// Even more than that: the target is the same between multiple battlecruisers
		// https://replays.firestoneapp.com/?reviewId=cbfd6fe9-1a58-400a-a593-6b8852df5427&turn=9&action=0
		// However I'm pretty sure I've seen another behavior

		// Get the highest health opponent minion at the start of the phase
		// Update 2025-05-16: it looks like it now takes the highest health current minion
		// https://replays.firestoneapp.com/?reviewId=c2620528-e0de-4862-9b11-cf055440b2b8&turn=19&action=2
		const aliveEntities = input.opponentBoard.filter((entity) => entity.health > 0 && !entity.definitelyDead);
		const targetEntityId = getRandomMinionWithHighestHealth(aliveEntities)?.entityId;
		// const numberOfCannons = yamatoCannons.length;
		const cannonDamage = Math.max(...yamatoCannons.map((e) => e.tagScriptDataNum1));
		for (const yamatoCannon of yamatoCannons) {
			// const damage = yamatoCannon.tagScriptDataNum1;
			// Could this simply be tagScriptDataNum2 on the battlecruiser?
			// I don't understand how this relates to the number enchants in the cruiser itself
			const loops = minion.tags?.[GameTag.BACON_YAMATO_CANNON] === 1 ? 2 : 1;
			for (let i = 0; i < loops; i++) {
				let target = input.opponentBoard.find((entity) => entity.entityId === targetEntityId);
				if (!target || target.health <= 0 || target.definitelyDead) {
					target = getRandomMinionWithHighestHealth(input.opponentBoard);
				}
				if (!!target) {
					input.gameState.spectator.registerPowerTarget(
						minion,
						target,
						input.opponentBoard,
						input.playerEntity,
						input.opponentEntity,
					);
					dealDamageToMinion(
						target,
						input.opponentBoard,
						input.opponentEntity,
						minion,
						cannonDamage,
						input.playerBoard,
						input.playerEntity,
						input.gameState,
					);
				}
			}
		}
		return true;
	},
	rebornSelfEffect: (minion: BoardEntity, input: RebornEffectInput) => {
		const ultraCapacitors = [...input.rebornEntity.enchantments]
			// .reverse()
			.filter((e) => e.cardId === CardIds.UltraCapacitor_UltraCapacitorEnchantment_BG31_HERO_801ptje);
		if (!ultraCapacitors?.length) {
			return;
		}

		minion.enchantments = input.rebornEntity.enchantments;
		minion.attack = input.rebornEntity.maxAttack;
		minion.maxAttack = input.rebornEntity.maxAttack;
		minion.health = input.rebornEntity.maxHealth;
		minion.maxHealth = input.rebornEntity.maxHealth;
		minion.divineShield = input.rebornEntity.hadDivineShield;
		minion.taunt = input.rebornEntity.taunt;
		minion.windfury = input.rebornEntity.windfury;
		minion.poisonous = input.rebornEntity.poisonous;
	},
	rally: (
		minion: BoardEntity,
		input: OnAttackInput,
	): {
		dmgDoneByAttacker: number;
		dmgDoneByDefender: number;
	} => {
		const advancedBallistics = [...minion.enchantments]
			// .reverse()
			.filter((e) => e.cardId === CardIds.AdvancedBallistics_AdvancedBallisticsEnchantment_BG31_HERO_801ptde);
		if (!advancedBallistics?.length) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const buff = advancedBallistics.map((e) => e.tagScriptDataNum1 ?? 0).reduce((a, b) => a + b, 0);
		const targets = input.attackingBoard.filter((entity) => entity !== minion);
		for (const target of targets) {
			modifyStats(target, minion, buff, 0, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const caduceusReactors = [...minion.enchantments]
			// .reverse()
			.filter((e) => e.cardId === CardIds.CaduceusReactor_CaduceusReactorEnchantment_BG31_HERO_801ptee);
		if (!caduceusReactors?.length) {
			return [];
		}

		const target = input.boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead)[0];
		if (!target) {
			return [];
		}

		const buff = caduceusReactors.map((e) => e.tagScriptDataNum1 ?? 0).reduce((a, b) => a + b, 0);
		modifyStats(
			target,
			minion,
			buff,
			buff,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			input.gameState,
		);
		return [];
	},
};
