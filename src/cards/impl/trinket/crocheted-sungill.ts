import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { OnAfterDeathInput } from '../../../simulation/attack';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DefaultScriptDataNumCard, OnAfterDeathCard } from '../../card.interface';

export const CrochetedSungill: OnAfterDeathCard & DefaultScriptDataNumCard = {
	cardIds: [TempCardIds.CrochetedSungill],
	defaultScriptDataNum: (cardId: string) => 1,
	onAfterDeath: (trinket: BoardTrinket, input: OnAfterDeathInput) => {
		if (input.board.length > 0 || trinket.scriptDataNum1 <= 0) {
			return;
		}
		const hand =
			input.hero.hand?.filter((e) => !!e?.cardId) ??
			// .filter((e) => !e.locked) // Not sure about this
			[];
		const highestHealth = Math.max(...hand.filter((c) => c.health).map((c) => c.health));
		const highestHealthMinions = highestHealth ? hand.filter((c) => c.health === highestHealth) : null;
		const candidate = !!highestHealthMinions?.length
			? pickRandom(highestHealthMinions)
			: hand.filter((c) => c.cardId).length
			? pickRandom(hand.filter((c) => c.cardId))
			: null;
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
			false,
			true,
			{ ...candidate } as BoardEntity,
		);
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
		trinket.scriptDataNum1--;
	},
};
