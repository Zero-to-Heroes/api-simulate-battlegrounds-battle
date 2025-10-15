import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard, DeathrattleSpawnCard, RallyCard } from '../../card.interface';

const attackBuff = 2;
const healthBuff = 2;

export const ExceptionalCaretaker: RallyCard & DeathrattleSpawnCard & BattlecryCard = {
	cardIds: [CardIds.ExceptionalCaretaker_BG33_701, CardIds.ExceptionalCaretaker_BG33_701_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.ExceptionalCaretaker_BG33_701_G ? 2 : 1;
		const targets = input.attackingBoard.filter((e) => e !== input.attacker);
		for (const target of targets) {
			modifyStats(
				target,
				input.attacker,
				attackBuff * mult,
				healthBuff * mult,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.ExceptionalCaretaker_BG33_701_G ? 2 : 1;
		const targets = input.board.filter((e) => e !== minion);
		for (const target of targets) {
			modifyStats(target, minion, attackBuff * mult, healthBuff * mult, input.board, input.hero, input.gameState);
		}
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.ExceptionalCaretaker_BG33_701_G ? 2 : 1;
		const targets = input.boardWithDeadEntity.filter((e) => e !== minion);
		for (const target of targets) {
			modifyStats(
				target,
				minion,
				attackBuff * mult,
				healthBuff * mult,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
		return [];
	},
};
