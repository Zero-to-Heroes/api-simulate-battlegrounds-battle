import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const FireForgedEvoker: StartOfCombatCard = {
	cardIds: [CardIds.FireForgedEvoker_BG32_822, CardIds.FireForgedEvoker_BG32_822_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.FireForgedEvoker_BG32_822_G ? 2 : 1;
		const atk = minion.scriptDataNum1 ?? 2 * mult * (1 + input.playerEntity.globalInfo.SpellsCastThisGame);
		const health = minion.scriptDataNum2 ?? 1 * mult * (1 + input.playerEntity.globalInfo.SpellsCastThisGame);
		addStatsToBoard(minion, input.playerBoard, input.playerEntity, atk, health, input.gameState, Race[Race.DRAGON]);
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
