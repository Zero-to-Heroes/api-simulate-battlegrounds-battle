import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { OnAttackInput } from '../../../simulation/on-attack';
import { performEntitySpawns } from '../../../simulation/spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { RallyCard } from '../../card.interface';

export const WhelpWatcher: RallyCard = {
	cardIds: [TempCardIds.WhelpWatcher, TempCardIds.WhelpWatcher_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.attackingBoard,
			boardWithDeadEntityHero: input.attackingHero,
			gameState: input.gameState,
			deadEntity: input.attacker,
			otherBoard: input.defendingBoard,
			otherBoardHero: input.defendingHero,
		};
		const spawnCardId =
			minion.cardId === TempCardIds.WhelpWatcher_G ? TempCardIds.TwilightWhelp_G : TempCardIds.TwilightWhelp;
		const spawns = simplifiedSpawnEntities(spawnCardId, 1, spawnInput);
		spawns.forEach((e) => {
			e.attackImmediately = true;
		});
		performEntitySpawns(
			spawns,
			spawnInput.boardWithDeadEntity,
			spawnInput.boardWithDeadEntityHero,
			minion,
			input.attackingBoard.length - input.attackingBoard.indexOf(input.attacker) - 1,
			spawnInput.otherBoard,
			spawnInput.otherBoardHero,
			spawnInput.gameState,
			true,
			input.defendingEntity,
		);
		return {
			dmgDoneByAttacker: 0,
			dmgDoneByDefender: 0,
		};
	},
};
