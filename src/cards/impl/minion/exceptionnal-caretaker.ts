import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard, DeathrattleSpawnCard, OnAttackCard } from '../../card.interface';

const attackBuff = 2;
const healthBuff = 2;

export const ExceptionnalCaretaker: OnAttackCard & DeathrattleSpawnCard & BattlecryCard = {
	cardIds: [TempCardIds.ExceptionnalCaretaker, TempCardIds.ExceptionnalCaretaker_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.ExceptionnalCaretaker_G ? 2 : 1;
		const targets = input.attackingBoard.filter((e) => e !== minion);
		for (const target of targets) {
			modifyStats(
				target,
				minion,
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
		const mult = minion.cardId === TempCardIds.ExceptionnalCaretaker_G ? 2 : 1;
		const targets = input.board.filter((e) => e !== minion);
		for (const target of targets) {
			modifyStats(target, minion, attackBuff * mult, healthBuff * mult, input.board, input.hero, input.gameState);
		}
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.ExceptionnalCaretaker_G ? 2 : 1;
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
