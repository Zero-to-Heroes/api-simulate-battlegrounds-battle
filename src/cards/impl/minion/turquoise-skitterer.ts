import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleSpawnCard } from '../../card.interface';

const atkBuff = 4;
const hpBuff = 4;

export const TurquoiseSkitterer: DeathrattleSpawnCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.TurquoiseSkitterer_BG31_809, CardIds.TurquoiseSkitterer_BG31_809_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TurquoiseSkitterer_BG31_809_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.BeetleAttackBuff =
			input.boardWithDeadEntityHero.globalInfo.BeetleAttackBuff + atkBuff * mult;
		input.boardWithDeadEntityHero.globalInfo.BeetleHealthBuff =
			input.boardWithDeadEntityHero.globalInfo.BeetleHealthBuff + hpBuff * mult;
		input.boardWithDeadEntity
			.filter((e) =>
				[CardIds.BoonOfBeetles_BeetleToken_BG28_603t, CardIds.Beetle_BG28_603t_G].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				modifyStats(
					e,
					minion,
					atkBuff * mult,
					hpBuff * mult,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			});
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, mult, input);
	},
};
