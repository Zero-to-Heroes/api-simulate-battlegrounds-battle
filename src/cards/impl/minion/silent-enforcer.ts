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
				...input.otherBoard.filter(
					(e) =>
						!hasCorrectTribe(
							e,
							input.otherBoardHero,
							Race.DEMON,
							input.gameState.anomalies,
							input.gameState.allCards,
						),
				),
			];
			for (const target of targets) {
				dealDamageToMinion(
					target,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					minion,
					4,
					input.otherBoard,
					input.otherBoardHero,
					input.gameState,
				);
			}
		}
		return [];
	},
};
