import { CardIds, Race } from '@firestone-hs/reference-data';
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
		for (const target of input.playerBoard.filter((e) =>
			hasCorrectTribe(e, input.playerEntity, Race.ELEMENTAL, input.gameState.allCards),
		)) {
			modifyStats(target, attackBuff, healthBuff, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
};
