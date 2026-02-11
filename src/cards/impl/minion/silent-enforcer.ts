import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToMinions } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const SilentEnforcer: DeathrattleSpawnCard = {
	cardIds: [CardIds.SilentEnforcer_BG33_156, CardIds.SilentEnforcer_BG33_156_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.SilentEnforcer_BG33_156_G ? 2 : 1;
		const friendlyMinionsAliveAtStart = input.boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead);
		const opponentMinionsAliveAtStart = input.otherBoard.filter((e) => e.health > 0 && !e.definitelyDead);
		for (let i = 0; i < mult; i++) {
			const targets = [
				// Friendly non-demons
				...friendlyMinionsAliveAtStart.filter(
					(e) =>
						!hasCorrectTribe(
							e,
							input.boardWithDeadEntityHero,
							Race.DEMON,
							input.gameState.anomalies,
							input.gameState.allCards,
						),
				),
				// All opponent minions
				...opponentMinionsAliveAtStart,
			];
			input.gameState.spectator.registerPowerTargets(
				minion,
				targets,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoardHero,
			);
			dealDamageToMinions(
				targets,
				input.otherBoard,
				input.otherBoardHero,
				minion,
				2,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
		return [];
	},
};
