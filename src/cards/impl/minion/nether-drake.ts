import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addStatsToBoard } from '../../../utils';
import { EndOfTurnCard } from '../../card.interface';

export const NetherDrake: EndOfTurnCard = {
	endOfTurn: (minion: BoardEntity, input: BattlecryInput) => {
		const steps = minion.cardId === CardIds.NetherDrake_BG24_003_G ? 2 : 1;
		const buff = minion.scriptDataNum1 || steps;
		addStatsToBoard(minion, input.board, input.hero, buff, 0, input.gameState, Race[Race.DRAGON]);
		minion.scriptDataNum1 = minion.scriptDataNum1 + steps;
	},
};
