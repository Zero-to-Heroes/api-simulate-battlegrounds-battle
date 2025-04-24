import { ALL_BG_RACES, Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { getEffectiveTribesForEntity } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';
import { selectMinions } from '../hero-power/wax-warband';

export const EclecticShrine: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	cardIds: [TempCardIds.EclecticShrine],
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
			const stats = 2 * (trinket.scriptDataNum1 ?? 1);
			allMinions.forEach((e) => {
				modifyStats(e, trinket, stats, stats, input.playerBoard, input.playerEntity, input.gameState);
			});
			trinket.scriptDataNum1++;
			return true;
		}
	},
};
