import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasEntityMechanic } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const StoneshellGuardian: StartOfCombatCard = {
	cardIds: [CardIds.StoneshellGuardian_BG33_HERO_000_Buddy, CardIds.StoneshellGuardian_BG33_HERO_000_Buddy_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// let totalSpawned = 0;
		const numberOfCopies = minion.cardId === CardIds.StoneshellGuardian_BG33_HERO_000_Buddy_G ? 2 : 1;
		for (let i = 0; i < numberOfCopies; i++) {
			for (let j = 0; j < 2; j++) {
				if (!!input.playerBoard.length && input.playerBoard.length < 7) {
					const rallyMinions = input.playerBoard.filter(
						(e) =>
							!StoneshellGuardian.cardIds.includes(e.cardId) &&
							hasEntityMechanic(e, GameTag.BACON_RALLY, input.gameState.allCards),
					);
					const target = rallyMinions[j];
					if (!target) {
						continue;
					}
					const copy: BoardEntity = {
						...target,
						lastAffectedByEntity: null,
					};
					const newMinions = spawnEntities(
						copy.cardId,
						1,
						input.playerBoard,
						input.playerEntity,
						input.opponentBoard,
						input.opponentEntity,
						input.gameState,
						target.friendly,
						true,
						false,
						false,
						copy,
					);
					const indexFromRight = input.playerBoard.length - (input.playerBoard.indexOf(target) + 1);
					const actualSpawns = performEntitySpawns(
						newMinions,
						input.playerBoard,
						input.playerEntity,
						target,
						indexFromRight,
						input.opponentBoard,
						input.opponentEntity,
						input.gameState,
					);
					// totalSpawned += actualSpawns.length;
					input.gameState.spectator.registerPowerTarget(
						minion,
						copy,
						input.playerBoard,
						input.playerEntity,
						input.opponentEntity,
					);
				}
			}
		}
		return true;
	},
};
