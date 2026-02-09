import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard, DeathrattleSpawnCard, RallyCard } from '../../card.interface';

export const TimewarpedNestSwarmer: DeathrattleSpawnCard & BattlecryCard & RallyCard = {
	cardIds: [CardIds.TimewarpedNestSwarmer_BG34_Giant_687, CardIds.TimewarpedNestSwarmer_BG34_Giant_687_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = deadEntity.cardId === CardIds.TimewarpedNestSwarmer_BG34_Giant_687_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.BeetleAttackBuff += 2 * mult;
		input.boardWithDeadEntityHero.globalInfo.BeetleHealthBuff += 2 * mult;
		input.boardWithDeadEntity
			.filter((e) =>
				[CardIds.BoonOfBeetles_BeetleToken_BG28_603t, CardIds.Beetle_BG28_603t_G].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				modifyStats(
					e,
					deadEntity,
					2 * mult,
					2 * mult,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			});
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, mult, input);
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.TimewarpedNestSwarmer_BG34_Giant_687_G ? 2 : 1;
		input.hero.globalInfo.BeetleAttackBuff += 2 * mult;
		input.hero.globalInfo.BeetleHealthBuff += 2 * mult;
		input.board
			.filter((e) =>
				[CardIds.BoonOfBeetles_BeetleToken_BG28_603t, CardIds.Beetle_BG28_603t_G].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				modifyStats(e, minion, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
			});
		return true;
	},
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const mult = minion.cardId === CardIds.TimewarpedNestSwarmer_BG34_Giant_687_G ? 2 : 1;
		input.attackingHero.globalInfo.BeetleAttackBuff += 2 * mult;
		input.attackingHero.globalInfo.BeetleHealthBuff += 2 * mult;
		input.attackingBoard
			.filter((e) =>
				[CardIds.BoonOfBeetles_BeetleToken_BG28_603t, CardIds.Beetle_BG28_603t_G].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				modifyStats(e, minion, 2 * mult, 2 * mult, input.attackingBoard, input.attackingHero, input.gameState);
			});
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
