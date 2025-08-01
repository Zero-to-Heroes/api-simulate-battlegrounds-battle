import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { simulateAttack } from '../../../simulation/attack';
import { AvengeInput } from '../../../simulation/avenge';
import { AvengeCard } from '../../card.interface';

export const Poultron: AvengeCard = {
	cardIds: [CardIds.P0ulTr0n_BG33_371, CardIds.P0ulTr0n_BG33_371_G],
	baseAvengeValue: (cardId) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.P0ulTr0n_BG33_371_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			updateDivineShield(minion, input.board, input.hero, input.otherHero, true, input.gameState);
			minion.attackImmediately = true;
			simulateAttack(input.board, input.hero, input.otherBoard, input.otherHero, input.gameState);
			minion.hasAttacked = 0;
			minion.attackImmediately = false;
		}
	},
};
