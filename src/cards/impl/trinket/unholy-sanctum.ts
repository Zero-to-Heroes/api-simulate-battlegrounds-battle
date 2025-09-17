import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleTriggeredCard } from '../../card.interface';

export const UnholySanctum: DeathrattleTriggeredCard = {
	cardIds: [CardIds.UnholySanctum_BG32_MagicItem_862, CardIds.UnholySanctum_UnholySanctumToken_BG32_MagicItem_862t],
	onDeathrattleTriggered: (trinket: BoardTrinket, input: DeathrattleTriggeredInput) => {
		const target = input.boardWithDeadEntity[input.boardWithDeadEntity.length - 1];
		if (!!target) {
			modifyStats(
				target,
				trinket,
				trinket.cardId === CardIds.UnholySanctum_BG32_MagicItem_862 ? 3 : 6,
				trinket.cardId === CardIds.UnholySanctum_BG32_MagicItem_862 ? 2 : 6,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
			const afterMod = target.attack;
			if (afterMod > 10) {
				// Nothing
			}
		}
	},
};
