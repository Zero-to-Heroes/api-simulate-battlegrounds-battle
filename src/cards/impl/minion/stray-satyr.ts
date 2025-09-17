import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterDealDamageInput } from '../../../simulation/damage-effects';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterDealDamageCard } from '../../card.interface';

export const StraySatyr: AfterDealDamageCard = {
	cardIds: [CardIds.StraySatyr_BG33_151, CardIds.StraySatyr_BG33_151_G],
	afterDealDamage: (minion: BoardEntity, input: AfterDealDamageInput) => {
		// Only friendly minions trigger this
		if (minion.friendly !== input.damageDealer.friendly) {
			return;
		}

		const mult = minion.cardId === CardIds.StraySatyr_BG33_151_G ? 2 : 1;
		if (
			'attack' in input.damageDealer &&
			'health' in input.damageDealer &&
			hasCorrectTribe(
				input.damageDealer,
				input.hero,
				Race.DEMON,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			modifyStats(minion, minion, 1 * mult, 0, input.board, input.hero, input.gameState);
			input.gameState.spectator.registerPowerTarget(minion, minion, input.board, input.hero, null);
		}
	},
};
