import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { OnAttackInput } from '../../../simulation/on-attack';
import { performEntitySpawns } from '../../../simulation/spawns';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { RallyCard } from '../../card.interface';

export const ExpertAviator: RallyCard = {
	cardIds: [TempCardIds.ExpertAviator, TempCardIds.ExpertAviator_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const mult = minion.cardId === TempCardIds.ExpertAviator_G ? 2 : 1;
		const target = input.attackingHero.hand.filter((e) => !!e.maxHealth && e.cardId)[0];
		if (!target || target.locked) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		modifyStats(target, minion, 1 * mult, 1 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		target.locked = true;
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.attackingBoard,
			boardWithDeadEntityHero: input.attackingHero,
			gameState: input.gameState,
			deadEntity: minion,
			otherBoard: input.defendingBoard,
			otherBoardHero: input.defendingHero,
		};
		const spawns = simplifiedSpawnEntities(target.cardId, 1, spawnInput);
		for (const s of spawns) {
			s.onCanceledSummon = () => (s.locked = false);
		}
		performEntitySpawns(
			spawns,
			spawnInput.boardWithDeadEntity,
			spawnInput.boardWithDeadEntityHero,
			minion,
			input.attackingBoard.length - input.attackingBoard.indexOf(minion) - 1,
			spawnInput.otherBoard,
			spawnInput.otherBoardHero,
			input.gameState,
		);
		return {
			dmgDoneByAttacker: 0,
			dmgDoneByDefender: 0,
		};
	},
};
