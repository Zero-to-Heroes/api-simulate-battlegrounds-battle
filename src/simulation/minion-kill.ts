import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom } from '../services/utils';
import { afterStatsUpdate, modifyAttack, modifyHealth } from '../utils';
import { Spectator } from './spectator/spectator';

export const onMinionKill = (
	killer: BoardEntity,
	victim: BoardEntity,
	killerBoard: BoardEntity[],
	killerHero: BgsPlayerEntity,
	victimBoard: BoardEntity[],
	victimHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	// Can be null if killed by a hero power for instance
	switch (killer?.cardId) {
		case CardIds.Murcules_BG27_023:
		case CardIds.Murcules_BG27_023_G:
			const murculesTarget = pickRandom(killerHero.hand.filter((e) => !!e?.cardId));
			if (murculesTarget) {
				const murculesStats = killer.cardId === CardIds.Murcules_BG27_023 ? 2 : 4;
				modifyAttack(murculesTarget, murculesStats, killerBoard, allCards);
				modifyHealth(murculesTarget, murculesStats, killerBoard, allCards);
				afterStatsUpdate(murculesTarget, killerBoard, allCards);
				spectator.registerPowerTarget(killer, murculesTarget, killerBoard);
			}
			break;
		case CardIds.Mannoroth_BG27_507:
		case CardIds.Mannoroth_BG27_507_G:
			if (killer.health > 0 && !killer.definitelyDead && killer.abiityChargesLeft > 0) {
				modifyAttack(killer, victim.attack, killerBoard, allCards);
				modifyHealth(killer, victim.maxHealth, killerBoard, allCards);
				afterStatsUpdate(killer, killerBoard, allCards);
				spectator.registerPowerTarget(killer, killer, killerBoard);
				killer.abiityChargesLeft--;
			}
			break;
		case CardIds.TideOracleMorgl_BG27_513:
		case CardIds.TideOracleMorgl_BG27_513_G:
			if (killer.attacking) {
				const tideOracleMorgleTarget = pickRandom(killerHero.hand.filter((e) => !!e?.cardId));
				if (tideOracleMorgleTarget) {
					const tideOracleMorgleMultiplier = killer.cardId === CardIds.TideOracleMorgl_BG27_513 ? 1 : 2;
					modifyAttack(
						tideOracleMorgleTarget,
						tideOracleMorgleMultiplier * victim.attack,
						killerBoard,
						allCards,
					);
					modifyHealth(
						tideOracleMorgleTarget,
						tideOracleMorgleMultiplier * victim.maxHealth,
						killerBoard,
						allCards,
					);
					afterStatsUpdate(tideOracleMorgleTarget, killerBoard, allCards);
					spectator.registerPowerTarget(killer, tideOracleMorgleTarget, killerBoard);
				}
			}
	}
};
