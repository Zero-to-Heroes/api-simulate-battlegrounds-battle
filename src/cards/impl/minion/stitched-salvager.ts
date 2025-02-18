import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { copyEntity } from '../../../utils';
import { DeathrattleSpawnCard, StartOfCombatCard } from '../../card.interface';

export const StitchedSalvager: StartOfCombatCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.StitchedSalvager_BG31_999, CardIds.StitchedSalvager_BG31_999_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const minionIndex = input.playerBoard.indexOf(minion);
		const targets = [];
		if (minionIndex > 0) {
			targets.push(input.playerBoard[minionIndex - 1]);
		}
		if (minion.cardId === CardIds.StitchedSalvager_BG31_999_G && minionIndex < input.playerBoard.length - 1) {
			targets.push(input.playerBoard[minionIndex + 1]);
		}
		if (!targets.length) {
			return;
		}

		minion.memory = targets.map((t) => copyEntity(t)) as readonly BoardEntity[];
		for (const target of targets) {
			target.definitelyDead = true;
			input.gameState.spectator.registerPowerTarget(
				input.playerEntity,
				target,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		return (minion.memory ?? []) as BoardEntity[];
	},
};
