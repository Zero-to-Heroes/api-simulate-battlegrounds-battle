import { BoardEntity } from '../../../board-entity';
import { pickRandomAlive } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const SharpEyedSabretooth: BattlecryCard = {
	cardIds: [TempCardIds.SharpEyedSabretooth, TempCardIds.SharpEyedSabretooth_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const target = pickRandomAlive(input.board);
		if (!!target) {
			const mult = minion.cardId === TempCardIds.SharpEyedSabretooth_G ? 2 : 1;
			const baseValue = 1 + (input.hero.globalInfo.FriendlyMinionsDeadLastCombat ?? 0);
			const buff = 2 * mult * baseValue;
			modifyStats(target, minion, buff, buff, input.board, input.hero, input.gameState);
		}
		return true;
	},
};
