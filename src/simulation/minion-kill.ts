import { CardIds, CardType } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
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
	gameState: FullGameState,
): void => {
	// Can be null if killed by a hero power for instance
	switch (killer?.cardId) {
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
				// When it's the opponent, the game state already contains all the buffs
				if (murculesTarget?.friendly) {
					const murculesStats = killer.cardId === CardIds.Murcules_BG27_023 ? 2 : 4;
					modifyStats(murculesTarget, murculesStats, murculesStats, killerBoard, killerHero, gameState);
				}
				gameState.spectator.registerPowerTarget(killer, murculesTarget, killerBoard, killerHero, victimHero);
			}
			break;
		case CardIds.Mannoroth_BG27_507:
		case CardIds.Mannoroth_BG27_507_G:
			if (killer.health > 0 && !killer.definitelyDead && killer.abiityChargesLeft > 0) {
				modifyStats(killer, victim.attack, victim.maxHealth, killerBoard, killerHero, gameState);
				gameState.spectator.registerPowerTarget(killer, killer, killerBoard, killerHero, victimHero);
				killer.abiityChargesLeft--;
			}
			break;
		case CardIds.TideOracleMorgl_BG27_513:
		case CardIds.TideOracleMorgl_BG27_513_G:
			if (killer.attacking) {
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
};
