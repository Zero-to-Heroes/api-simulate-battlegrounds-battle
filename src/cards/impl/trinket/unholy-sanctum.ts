import { BoardTrinket } from '../../../bgs-player-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleTriggeredCard } from '../../card.interface';

export const UnholySanctum: DeathrattleTriggeredCard = {
	cardIds: [TempCardIds.UnholySanctum, TempCardIds.UnholySanctum_Greater],
	onDeathrattleTriggered: (trinket: BoardTrinket, input: DeathrattleTriggeredInput) => {
		const mult = trinket.cardId === TempCardIds.UnholySanctum ? 1 : 2;
		const target = input.boardWithDeadEntity[input.boardWithDeadEntity.length - 1];
		if (!!target) {
			modifyStats(
				target,
				trinket,
				3 * mult,
				3 * mult,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
	},
};
