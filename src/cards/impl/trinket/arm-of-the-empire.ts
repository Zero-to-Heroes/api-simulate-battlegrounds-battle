import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { OnMinionAttackedInput } from '../../../simulation/on-being-attacked';
import { modifyStats } from '../../../simulation/stats';
import { OnMinionAttackedCard } from '../../card.interface';

export const ArmOfTheEmpire: OnMinionAttackedCard = {
	cardIds: [CardIds.ArmOfTheEmpire_BGS_110, CardIds.ArmOfTheEmpire_TB_BaconUps_302],
	onAttacked: (minion: BoardEntity, input: OnMinionAttackedInput) => {
		if (input.defendingEntity.taunt) {
			const mult = minion.cardId === CardIds.ArmOfTheEmpire_TB_BaconUps_302 ? 2 : 1;
			modifyStats(
				input.defendingEntity,
				minion,
				3 * mult,
				0,
				input.defendingBoard,
				input.defendingHero,
				input.gameState,
			);
		}
	},
};
