import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnDeathInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { getTeamInitialStates } from '../../../utils';
import { OnDeathCard, OnSpawnedCard } from '../../card.interface';

export const SanlaynScribe: OnSpawnedCard & OnDeathCard = {
	cardIds: [CardIds.SanlaynScribe_BGDUO31_208, CardIds.SanlaynScribe_BGDUO31_208_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.SanlaynScribe_BGDUO31_208 ? 1 : 2;
		const statsBonus = mult * input.hero.globalInfo.SanlaynScribesDeadThisGame;
		modifyStats(minion, minion, 4 * statsBonus, 4 * statsBonus, input.board, input.hero, input.gameState);
	},
	onDeath: (minion: BoardEntity, input: OnDeathInput) => {
		input.hero.globalInfo.SanlaynScribesDeadThisGame = input.hero.globalInfo.SanlaynScribesDeadThisGame + 1;
		input.board
			.filter(
				(entity) =>
					entity.cardId === CardIds.SanlaynScribe_BGDUO31_208 ||
					entity.cardId === CardIds.SanlaynScribe_BGDUO31_208_G,
			)
			.forEach((entity) => {
				const mult = entity.cardId === CardIds.SanlaynScribe_BGDUO31_208 ? 1 : 2;
				modifyStats(entity, minion, 4 * mult, 4 * mult, input.board, input.hero, input.gameState);
			});
		// Update the initial states to work with sandy
		getTeamInitialStates(input.gameState.gameState, input.hero).forEach((team) => {
			team.board
				.filter(
					(entity) =>
						entity.cardId === CardIds.SanlaynScribe_BGDUO31_208 ||
						entity.cardId === CardIds.SanlaynScribe_BGDUO31_208_G,
				)
				.forEach((entity) => {
					const mult = entity.cardId === CardIds.SanlaynScribe_BGDUO31_208 ? 1 : 2;
					entity.attack += 4 * mult;
					entity.health += 4 * mult;
					entity.maxHealth += 4 * mult;
					entity.maxAttack += 4 * mult;
				});
		});
	},
};
