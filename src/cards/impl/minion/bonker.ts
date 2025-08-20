import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const Bonker: RallyCard = {
	cardIds: [CardIds.Bonker_BG20_104, CardIds.Bonker_BG20_104_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.Bonker_BG20_104_G ? 2 : 1;
		for (const target of input.attackingBoard.filter((e) => e.entityId !== minion.entityId)) {
			playBloodGemsOn(minion, target, 1 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
