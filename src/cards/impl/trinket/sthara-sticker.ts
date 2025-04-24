import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { OnAfterDeathInput } from '../../../simulation/attack';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnAfterDeathCard } from '../../card.interface';

export const StharaSticker: OnAfterDeathCard = {
	cardIds: [TempCardIds.StharaSticker],
	onAfterDeath: (minion: BoardEntity | BoardTrinket, input: OnAfterDeathInput) => {
		if (input.board.length > 0) {
			return;
		}

		const candidate = input.gameState.sharedState.deaths
			.filter((entity) => entity.friendly === input.hero.friendly)
			.filter((entity) =>
				hasCorrectTribe(entity, input.hero, Race.DEMON, input.gameState.anomalies, input.gameState.allCards),
			)[0];
		if (!candidate) {
			return;
		}
		const spawns = spawnEntities(
			candidate.cardId,
			1,
			input.board,
			input.hero,
			input.otherBoard,
			input.otherHero,
			input.gameState,
			input.hero.friendly,
			false,
		).map((e) => ({
			...e,
			attack: candidate.maxAttack,
			health: candidate.maxHealth,
			maxHealth: candidate.maxHealth,
			maxAttack: candidate.maxAttack,
		}));
		performEntitySpawns(
			spawns,
			input.board,
			input.hero,
			input.hero,
			0,
			input.otherBoard,
			input.otherHero,
			input.gameState,
		);
	},
};
