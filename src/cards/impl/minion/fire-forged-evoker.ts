import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const FireForgedEvoker: StartOfCombatCard = {
	cardIds: [TempCardIds.FireForgedEvoker, TempCardIds.FireForgedEvoker],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const buff = minion.scriptDataNum1;
		addStatsToBoard(minion, input.playerBoard, input.playerEntity, buff, buff, input.gameState, Race[Race.DRAGON]);
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
