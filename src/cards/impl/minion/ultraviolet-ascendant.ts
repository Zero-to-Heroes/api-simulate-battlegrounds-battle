import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const UltravioletAscendant: StartOfCombatCard = {
	cardIds: [CardIds.UltravioletAscendant_BG31_810, CardIds.UltravioletAscendant_BG31_810_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const base = minion.cardId === CardIds.UltravioletAscendant_BG31_810_G ? 2 : 1;
		const attackBuff = minion.scriptDataNum1 ?? base;
		const healthBuff = minion.scriptDataNum2 ?? base;
		const candidates = input.playerBoard
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.ELEMENTAL,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			)
			.filter((e) => e.entityId !== minion.entityId);
		for (const target of candidates) {
			modifyStats(target, minion, attackBuff, healthBuff, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
};
