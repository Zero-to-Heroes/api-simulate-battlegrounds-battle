import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleEffectCard, DeathrattleSpawnCard } from '../../card.interface';

const atkBuff = 1;
const hpBuff = 2;

export const TurquoiseSkitterer: DeathrattleSpawnCard & DeathrattleEffectCard = {
	cardIds: [CardIds.TurquoiseSkitterer_BG31_809, CardIds.TurquoiseSkitterer_BG31_809_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === CardIds.TurquoiseSkitterer_BG31_809_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, numberOfSpawns, input);
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
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
					atkBuff * mult,
					hpBuff * mult,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			});
	},
};
