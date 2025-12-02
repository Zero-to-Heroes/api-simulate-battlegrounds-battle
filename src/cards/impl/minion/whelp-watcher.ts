import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { OnAttackInput } from '../../../simulation/on-attack';
import { performEntitySpawns } from '../../../simulation/spawns';
import { RallyCard } from '../../card.interface';

export const WhelpWatcher: RallyCard = {
	cardIds: [CardIds.WhelpWatcher_BG34_631, CardIds.WhelpWatcher_BG34_631_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (!input.defendingEntity) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.attackingBoard,
			boardWithDeadEntityHero: input.attackingHero,
			gameState: input.gameState,
			deadEntity: input.attacker,
			otherBoard: input.defendingBoard,
			otherBoardHero: input.defendingHero,
		};
		const spawnCardId =
			minion.cardId === CardIds.WhelpWatcher_BG34_631_G
				? CardIds.TwilightHatchling_TwilightWhelpToken_BG34_630_Gt
				: CardIds.TwilightHatchling_TwilightWhelpToken_BG34_630t;
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
