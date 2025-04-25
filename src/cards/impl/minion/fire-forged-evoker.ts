import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const FireForgedEvoker: StartOfCombatCard = {
	cardIds: [CardIds.FireForgedEvoker_BG32_822, CardIds.FireForgedEvoker_BG32_822_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const buff = minion.scriptDataNum1;
		addStatsToBoard(minion, input.playerBoard, input.playerEntity, buff, buff, input.gameState, Race[Race.DRAGON]);
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
