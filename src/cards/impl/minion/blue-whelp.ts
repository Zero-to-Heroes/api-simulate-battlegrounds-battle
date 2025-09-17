import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const BlueWhelp: RallyCard = {
	cardIds: [CardIds.BlueWhelp_BG33_924, CardIds.BlueWhelp_BG33_924_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.BlueWhelp_BG33_924_G ? 2 : 1;
		input.attackingHero.globalInfo.TavernSpellHealthBuff += 1 * mult;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
