import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const RazorfenVineweaver: RallyCard = {
	cardIds: [CardIds.RazorfenVineweaver_BG33_883, CardIds.RazorfenVineweaver_BG33_883_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.RazorfenVineweaver_BG33_883_G ? 2 : 1;
		playBloodGemsOn(minion, minion, 2 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
