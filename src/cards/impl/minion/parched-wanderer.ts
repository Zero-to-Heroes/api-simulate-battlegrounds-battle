import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const ParchedWanderer: BattlecryCard = {
	cardIds: [CardIds.ParchedWanderer_BG30_756, CardIds.ParchedWanderer_BG30_756_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const wandererTarget = pickRandom(
			input.board.filter((e) => hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.allCards)),
		);
		if (!!wandererTarget) {
			const wandererMultiplier = minion.cardId === CardIds.ParchedWanderer_BG30_756 ? 1 : 2;
			updateTaunt(wandererTarget, true, input.board, input.hero, input.otherHero, input.gameState);
			modifyStats(
				wandererTarget,
				wandererMultiplier * 3,
				wandererMultiplier * 3,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
