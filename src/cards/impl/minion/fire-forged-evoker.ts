import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const FireForgedEvoker: StartOfCombatCard = {
	cardIds: [CardIds.FireForgedEvoker_BG32_822, CardIds.FireForgedEvoker_BG32_822_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.FireForgedEvoker_BG32_822_G ? 2 : 1;
		const buff = mult + minion.scriptDataNum2;
		addStatsToBoard(minion, input.playerBoard, input.playerEntity, buff, buff, input.gameState, Race[Race.DRAGON]);
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
