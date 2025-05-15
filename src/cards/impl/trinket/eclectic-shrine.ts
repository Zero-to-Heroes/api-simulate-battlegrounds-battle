import { ALL_BG_RACES, CardIds, Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { getEffectiveTribesForEntity } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';
import { selectMinions } from '../hero-power/wax-warband';

export const EclecticShrine: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	cardIds: [CardIds.EclecticShrine_BG32_MagicItem_280],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const boardWithTribes = input.playerBoard.filter(
				(e) =>
					!!getEffectiveTribesForEntity(
						e,
						input.playerEntity,
						input.gameState.anomalies,
						input.gameState.allCards,
					).length,
			);
			const boardWithoutAll = boardWithTribes.filter(
				(e) =>
					!getEffectiveTribesForEntity(
						e,
						input.playerEntity,
						input.gameState.anomalies,
						input.gameState.allCards,
					)?.includes(Race.ALL),
			);
			const selectedMinions = selectMinions(boardWithoutAll, ALL_BG_RACES, input.gameState.allCards);
			const allMinions = [
				...selectedMinions,
				...boardWithTribes.filter((e) =>
					getEffectiveTribesForEntity(
						e,
						input.playerEntity,
						input.gameState.anomalies,
						input.gameState.allCards,
					)?.includes(Race.ALL),
				),
			];
			const atk = trinket.scriptDataNum1 ?? 3;
			const health = trinket.scriptDataNum2 ?? 2;
			allMinions.forEach((e) => {
				modifyStats(e, trinket, atk, health, input.playerBoard, input.playerEntity, input.gameState);
			});
			trinket.scriptDataNum1++;
			trinket.scriptDataNum2++;
			return true;
		}
	},
};
