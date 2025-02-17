import { BoardEntity } from '../../../board-entity';
import { OnMinionKilledInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnMinionKilledCard } from '../../card.interface';

export const Mutalisk: OnMinionKilledCard = {
	cardIds: [TempCardIds.Mutalisk, TempCardIds.Mutalisk_G],
	onMinionKilled: (
		minion: BoardEntity,
		input: OnMinionKilledInput,
	): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		modifyStats(minion, 4, 4, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
