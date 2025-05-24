import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const FireForgedEvoker: StartOfCombatCard = {
	cardIds: [CardIds.FireForgedEvoker_BG32_822, CardIds.FireForgedEvoker_BG32_822_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.FireForgedEvoker_BG32_822_G ? 2 : 1;
		const atk = minion.scriptDataNum1 ?? 2 * mult * (1 + input.playerEntity.globalInfo.SpellsCastThisGame);
		const health = minion.scriptDataNum2 ?? 1 * mult * (1 + input.playerEntity.globalInfo.SpellsCastThisGame);
		const targetBoard = input.playerBoard.filter(
			(e) =>
				e.entityId !== minion.entityId &&
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.DRAENEI,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		);
		for (const target of targetBoard) {
			modifyStats(target, minion, atk, health, input.playerBoard, input.playerEntity, input.gameState);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
