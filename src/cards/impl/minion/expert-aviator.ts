import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { OnAttackInput } from '../../../simulation/on-attack';
import { performEntitySpawns } from '../../../simulation/spawns';
import { modifyStats } from '../../../simulation/stats';
import { copyEntity } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const ExpertAviator: RallyCard = {
	cardIds: [CardIds.ExpertAviator_BG34_140, CardIds.ExpertAviator_BG34_140_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const mult = minion.cardId === CardIds.ExpertAviator_BG34_140_G ? 2 : 1;
		const target = input.attackingHero.hand.filter((e) => !!e.maxHealth && e.cardId)[0];
		if (!target) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		modifyStats(target, minion, 1 * mult, 1 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		if (target.locked) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		target.locked = true;
		const clone = copyEntity(target);
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.attackingBoard,
			boardWithDeadEntityHero: input.attackingHero,
			gameState: input.gameState,
			deadEntity: minion,
			otherBoard: input.defendingBoard,
			otherBoardHero: input.defendingHero,
		};
		const spawns = simplifiedSpawnEntities(clone.cardId, 1, spawnInput, clone);
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
