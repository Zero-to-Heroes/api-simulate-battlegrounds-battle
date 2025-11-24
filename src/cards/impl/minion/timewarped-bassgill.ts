import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedBassgill: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedBassgill, TempCardIds.TimewarpedBassgill_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedBassgill_G ? 2 : 1;
		const spawnedEntities: BoardEntity[] = [];
		for (let i = 0; i < mult; i++) {
			const hand = input.boardWithDeadEntityHero.hand.filter((e) => !!e?.cardId).filter((e) => !e.locked) ?? [];
			const highestHealth = Math.max(...hand.filter((c) => c.health).map((c) => c.health));
			const highestHealthMinions = highestHealth ? hand.filter((c) => c.health === highestHealth) : null;
			const spawn = !!highestHealthMinions?.length
				? pickRandom(highestHealthMinions)
				: hand.filter((c) => c.cardId).length
				? pickRandom(hand.filter((c) => c.cardId))
				: null;
			if (spawn) {
				spawn.locked = true;
				// Technically it should not be removed from hand, but rather flagged
				// Probably very low impact doing it like this
				// spawn.locked = true;
				// removeCardFromHand(boardWithDeadEntityHero, spawn);
				const bassgillSpawns = spawnEntities(
					spawn.cardId,
					1,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoard,
					input.otherBoardHero,
					input.gameState,
					input.deadEntity.friendly,
					false,
					false,
					true,
					{ ...spawn } as BoardEntity,
				);
				for (const s of bassgillSpawns) {
					s.onCanceledSummon = () => (s.locked = false);
					updateDivineShield(
						s,
						input.boardWithDeadEntity,
						input.boardWithDeadEntityHero,
						input.otherBoardHero,
						true,
						input.gameState,
					);
				}
				spawnedEntities.push(...bassgillSpawns);
			}
		}
		return spawnedEntities;
	},
};
