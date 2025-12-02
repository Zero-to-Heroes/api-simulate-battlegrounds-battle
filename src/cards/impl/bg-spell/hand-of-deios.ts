import { GameTag } from '@firestone-hs/reference-data';
import { BoardSecret } from '../../../board-secret';
import { triggerRally } from '../../../mechanics/rally';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasEntityMechanic } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const HandOfDeios: StartOfCombatCard = {
	cardIds: [CardIds.HandOfDeios_BG34_991],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (secret: BoardSecret, input: SoCInput) => {
		// Battlecry
		const battlecryCandidates = input.playerBoard.filter((e) =>
			hasEntityMechanic(e, GameTag.BATTLECRY, input.gameState.allCards),
		);
		const battlecryTarget = pickRandom(battlecryCandidates);
		if (!!battlecryTarget) {
			triggerBattlecry(
				input.playerBoard,
				input.playerEntity,
				battlecryTarget,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				secret,
				battlecryTarget,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}

		// Deathrattle
		const deathrattleCandidates = input.playerBoard.filter((e) =>
			hasEntityMechanic(e, GameTag.DEATHRATTLE, input.gameState.allCards),
		);
		const deathrattleTarget = pickRandom(deathrattleCandidates);
		if (!!deathrattleTarget) {
			const indexFromRight = input.playerBoard.length - (input.playerBoard.indexOf(deathrattleTarget) + 1);
			processDeathrattleForMinion(
				deathrattleTarget,
				indexFromRight,
				[deathrattleTarget],
				deathrattleTarget.friendly ? input.gameState.gameState.player : input.gameState.gameState.opponent,
				deathrattleTarget.friendly ? input.gameState.gameState.opponent : input.gameState.gameState.player,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				secret,
				deathrattleTarget,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}

		// Rally
		const rallyCandidates = input.playerBoard.filter((e) =>
			hasEntityMechanic(e, GameTag.BACON_RALLY, input.gameState.allCards),
		);
		const rallyTarget = pickRandom(rallyCandidates);
		if (!!rallyTarget) {
			triggerRally(
				input.playerBoard,
				input.playerEntity,
				rallyTarget,
				input.opponentBoard,
				input.opponentEntity,
				null,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				secret,
				rallyTarget,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}
		return true;
	},
};
