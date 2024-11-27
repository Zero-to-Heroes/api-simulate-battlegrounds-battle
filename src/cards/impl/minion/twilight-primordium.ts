import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const TwilightPrimordium: BattlecryCard = {
	cardIds: [TempCardIds.TwilightPrimordium, TempCardIds.TwilightPrimordium_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const currentBuffValue = minion.scriptDataNum1;
		const mult = minion.cardId === TempCardIds.TwilightPrimordium_G ? 2 : 1;
		const candidates = [
			...input.board.filter((e) => hasCorrectTribe(e, input.hero, Race.ELEMENTAL, input.gameState.allCards)),
			...input.otherBoard.filter((e) => hasCorrectTribe(e, input.hero, Race.ELEMENTAL, input.gameState.allCards)),
		];
		const target = pickRandom(candidates);
		if (!!target) {
			modifyStats(
				target,
				2 * mult * currentBuffValue,
				2 * mult * currentBuffValue,
				input.board,
				input.hero,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
		}
	},
};
