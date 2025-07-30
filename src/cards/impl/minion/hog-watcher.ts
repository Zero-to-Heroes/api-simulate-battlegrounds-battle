import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const HogWatcher: BattlecryCard = {
	cardIds: [TempCardIds.HogWatcher, TempCardIds.HogWatcher_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === TempCardIds.HogWatcher_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const candidates = [...input.board, ...input.otherBoard].filter((e) => !e.divineShield);
			const target = pickRandom(candidates);
			if (!!target) {
				updateDivineShield(target, input.board, input.hero, input.otherHero, true, input.gameState);
			}
		}
		return true;
	},
};
