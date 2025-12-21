import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateVenomous } from '../../../keywords/venomous';
import { updateWindfury } from '../../../keywords/windfury';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { CastSpellInput, DeathrattleSpawnCard, OnStatsChangedCard, OnTavernSpellCastCard } from '../../card.interface';

export const DaggerspineThrasher: OnTavernSpellCastCard = {
	cardIds: [CardIds.DaggerspineThrasher_BG27_024, CardIds.DaggerspineThrasher_BG27_024_G],
	onTavernSpellCast: (minion: BoardEntity, input: CastSpellInput) => {
		// const mult = minion.cardId === CardIds.DaggerspineThrasher_BG27_024_G ? 2 : 1;
		const options = [];
		if (!minion.windfury) {
			options.push('windfury');
		}
		if (!minion.venomous) {
			options.push('venomous');
		}
		if (!minion.divineShield) {
			options.push('divineShield');
		}
		const option = pickRandom(options);
		if (option) {
			switch (option) {
				case 'windfury':
					updateWindfury(minion, true, input.board, input.hero, input.otherHero, input.gameState);
					break;
				case 'venomous':
					updateVenomous(minion, true, input.board, input.hero, input.otherHero, input.gameState);
					break;
				case 'divineShield':
					updateDivineShield(minion, input.board, input.hero, input.otherHero, true, input.gameState);
					break;
			}
		}
		return [];
	},
};
