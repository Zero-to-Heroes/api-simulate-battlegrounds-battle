import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';
import { isWhelp } from '../../cards-data';

export const BurgeoningWhelp: DeathrattleSpawnCard & BattlecryCard = {
	cardIds: [CardIds.BurgeoningWhelp_BG34_402, CardIds.BurgeoningWhelp_BG34_402_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.BurgeoningWhelp_BG34_402_G ? 2 : 1;
		const whelpBuff = 3 * mult;
		const targets = input.boardWithDeadEntity.filter((entity) => isWhelp(entity.cardId, input.gameState.allCards));
		targets.forEach((target) => {
			modifyStats(
				target,
				target,
				whelpBuff,
				whelpBuff,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
				false,
			);
		});
		input.boardWithDeadEntityHero.globalInfo.WhelpAttackBuff += whelpBuff;
		input.boardWithDeadEntityHero.globalInfo.WhelpHealthBuff += whelpBuff;
		return [];
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.BurgeoningWhelp_BG34_402_G ? 2 : 1;
		const whelpBuff = 3 * mult;
		const targets = input.board.filter((entity) => isWhelp(entity.cardId, input.gameState.allCards));
		targets.forEach((target) => {
			modifyStats(target, target, whelpBuff, whelpBuff, input.board, input.hero, input.gameState, false);
		});
		return true;
	},
};
