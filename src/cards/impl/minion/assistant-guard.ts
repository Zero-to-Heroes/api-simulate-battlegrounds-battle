import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard } from '../../card.interface';

export const AssistantGuard: BattlecryCard = {
	cardIds: [CardIds.AssistantGuard_BG29_845, CardIds.AssistantGuard_BG29_845_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const allMinions = [...input.board, ...input.otherBoard];
		const assistantGuardMultiplier = minion.cardId === CardIds.AssistantGuard_BG29_845 ? 1 : 2;
		const assistantGuardTarget = pickRandom(allMinions);
		if (assistantGuardTarget) {
			updateTaunt(assistantGuardTarget, true, input.board, input.hero, input.otherHero, input.gameState);
			input.gameState.spectator.registerPowerTarget(
				minion,
				assistantGuardTarget,
				input.board,
				input.hero,
				input.otherHero,
			);
		}
		for (const entity of input.board.filter((e) => !!e.taunt)) {
			modifyStats(
				entity,
				minion,
				assistantGuardMultiplier * 2,
				assistantGuardMultiplier * 3,
				input.board,
				input.hero,
				input.gameState,
			);
		}
		return true;
	},
};
