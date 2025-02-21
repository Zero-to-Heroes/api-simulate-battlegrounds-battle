import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const AutomatonPortrait: StartOfCombatCard = {
	cardIds: [CardIds.AutomatonPortrait_BG30_MagicItem_303],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length < 7) {
			const newMinions = spawnEntities(
				CardIds.AstralAutomaton_BG_TTN_401,
				1,
				input.playerBoard,
				input.playerEntity,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
				input.playerEntity.friendly,
				false,
			);
			performEntitySpawns(
				newMinions,
				input.playerBoard,
				input.playerEntity,
				input.playerEntity,
				0,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
		}
	},
};
