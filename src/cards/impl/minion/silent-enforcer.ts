import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const SilentEnforcer: DeathrattleSpawnCard = {
	cardIds: [CardIds.SilentEnforcer_BG33_156, CardIds.SilentEnforcer_BG33_156_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.SilentEnforcer_BG33_156_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const targets = [
				// Friendly non-demons
				...input.boardWithDeadEntity.filter(
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
				...input.otherBoard,
			];
			for (const target of targets) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
				);
				dealDamageToMinion(
					target,
					input.otherBoard,
					input.otherBoardHero,
					minion,
					4,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			}
		}
		return [];
	},
};
