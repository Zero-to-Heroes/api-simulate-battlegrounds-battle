import { CardIds, CardType } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnMinionKilled } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { pickRandom } from '../services/utils';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const onMinionKill = (
	killer: BoardEntity,
	victim: BoardEntity,
	killerBoard: BoardEntity[],
	killerHero: BgsPlayerEntity,
	victimBoard: BoardEntity[],
	victimHero: BgsPlayerEntity,
	defenderNeighbours: readonly BoardEntity[],
	gameState: FullGameState,
): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
	// Can be null if killed by a hero power for instance
	if (!killer?.cardId) {
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	}

	let damageDoneByAttacker = 0;
	let damageDoneByDefender = 0;
	const onMinionKilledImpl = cardMappings[killer.cardId];
	if (hasOnMinionKilled(onMinionKilledImpl)) {
		const { dmgDoneByAttacker, dmgDoneByDefender } = onMinionKilledImpl.onMinionKilled(killer, {
			minionKilled: victim,
			attackingHero: killerHero,
			attackingBoard: killerBoard,
			defendingHero: victimHero,
			defendingBoard: victimBoard,
			defenderNeighbours: defenderNeighbours,
			gameState,
			playerIsFriendly: killerHero.friendly,
		});
		damageDoneByAttacker += dmgDoneByAttacker;
		damageDoneByDefender += dmgDoneByDefender;
	}

	switch (killer.cardId) {
		case CardIds.Murcules_BG27_023:
		case CardIds.Murcules_BG27_023_G:
			const murculesTarget = pickRandom(
				killerHero.hand
					.filter((e) => !!e?.cardId)
					.filter(
						(e) => gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
					),
			);
			if (murculesTarget) {
				const murculesStats = killer.cardId === CardIds.Murcules_BG27_023 ? 2 : 4;
				modifyStats(murculesTarget, killer, murculesStats, murculesStats, killerBoard, killerHero, gameState);
				gameState.spectator.registerPowerTarget(killer, murculesTarget, killerBoard, killerHero, victimHero);
			}
			break;
		case CardIds.Mannoroth_BG27_507:
		case CardIds.Mannoroth_BG27_507_G:
			if (killer.health > 0 && !killer.definitelyDead && killer.abiityChargesLeft > 0) {
				modifyStats(killer, killer, victim.attack, victim.maxHealth, killerBoard, killerHero, gameState);
				gameState.spectator.registerPowerTarget(killer, killer, killerBoard, killerHero, victimHero);
				killer.abiityChargesLeft--;
			}
			break;
		case CardIds.TideOracleMorgl_BG27_513:
		case CardIds.TideOracleMorgl_BG27_513_G:
			if (
				gameState.sharedState.currentAttackerEntityId != null &&
				gameState.sharedState.currentAttackerEntityId === killer.entityId
			) {
				const tideOracleMorgleTarget = pickRandom(
					killerHero.hand
						.filter((e) => !!e?.cardId)
						.filter(
							(e) =>
								gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
						),
				);
				if (tideOracleMorgleTarget) {
					const tideOracleMorgleMultiplier = killer.cardId === CardIds.TideOracleMorgl_BG27_513 ? 1 : 2;
					modifyStats(
						tideOracleMorgleTarget,
						killer,
						tideOracleMorgleMultiplier * victim.attack,
						tideOracleMorgleMultiplier * victim.maxHealth,
						killerBoard,
						killerHero,
						gameState,
					);
					gameState.spectator.registerPowerTarget(
						killer,
						tideOracleMorgleTarget,
						killerBoard,
						killerHero,
						victimHero,
					);
				}
			}
	}

	return { dmgDoneByAttacker: damageDoneByAttacker, dmgDoneByDefender: damageDoneByDefender };
};
