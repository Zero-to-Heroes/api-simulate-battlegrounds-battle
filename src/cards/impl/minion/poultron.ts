import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { simulateAttack } from '../../../simulation/attack';
import { AvengeInput } from '../../../simulation/avenge';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const Poultron: AvengeCard = {
	cardIds: [TempCardIds.Poultron, TempCardIds.Poultron_G],
	baseAvengeValue: (cardId) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.Poultron_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			updateDivineShield(minion, input.board, input.hero, input.otherHero, true, input.gameState);
			minion.attackImmediately = true;
			simulateAttack(input.board, input.hero, input.otherBoard, input.otherHero, input.gameState);
			minion.hasAttacked = 0;
			minion.attackImmediately = false;
		}
	},
};
