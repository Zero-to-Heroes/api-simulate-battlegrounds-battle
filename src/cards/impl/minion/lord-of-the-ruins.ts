import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterDealDamageInput } from '../../../simulation/damage-effects';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterDealDamageCard } from '../../card.interface';

export const LordOfTheRuins: AfterDealDamageCard = {
	cardIds: [CardIds.LordOfTheRuins_BG33_154, CardIds.LordOfTheRuins_BG33_154_G],
	afterDealDamage: (minion: BoardEntity, input: AfterDealDamageInput) => {
		// Only friendly minions trigger this
		if (minion.friendly !== input.damageDealer.friendly) {
			return;
		}
		const mult = minion.cardId === CardIds.LordOfTheRuins_BG33_154_G ? 2 : 1;
		if (
			hasCorrectTribe(
				input.damageDealer,
				input.hero,
				Race.DEMON,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			const targets = input.board.filter((e) => e !== input.damageDealer);
			for (const target of targets) {
				modifyStats(minion, target, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
			}
		}
	},
};
