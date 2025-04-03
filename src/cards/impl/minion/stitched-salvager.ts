import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
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

		minion.memory = targets
			.filter(
				(t) =>
					t.cardId !== CardIds.StitchedSalvager_BG31_999_G && t.cardId !== CardIds.StitchedSalvager_BG31_999,
			)
			.map((t) => {
				const copy = copyEntity(t);
				removeAurasFromSelf(copy, input.playerBoard, input.playerEntity, input.gameState);
				return copy;
			}) as readonly BoardEntity[];
		for (const target of targets) {
			target.definitelyDead = true;
			input.gameState.spectator.registerPowerTarget(
				minion,
				target,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const spawns: BoardEntity[] = (minion.memory ?? []).map((e) => {
			return copyEntity({
				...e,
				entityId: input.gameState.sharedState.currentEntityId++,
			});
		});
		return spawns;
	},
};
