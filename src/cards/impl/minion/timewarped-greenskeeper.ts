import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { hasMinionBattlecry, triggerBattlecry } from '../../../simulation/battlecries';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { hasValidDeathrattle } from '../../../simulation/deathrattle-utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { isDead } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const TimewarpedGreenskeeper: RallyCard = {
	cardIds: [TempCardIds.TimewarpedGreenskeeper, TempCardIds.TimewarpedGreenskeeper_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const loops = minion.cardId === CardIds.Greenskeeper_BG30_008 ? 1 : 2;
		for (let i = 0; i < loops; i++) {
			const battlecries = input.attackingBoard.filter(
				(e) => !isDead(e) && hasMinionBattlecry(e, input.gameState),
			);
			const battlecryCandidate = battlecries[battlecries.length - 1];
			if (!!battlecryCandidate) {
				input.gameState.spectator.registerPowerTarget(
					input.attacker,
					battlecryCandidate,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
				);
				triggerBattlecry(
					input.attackingBoard,
					input.attackingHero,
					battlecryCandidate,
					input.defendingBoard,
					input.defendingHero,
					input.gameState,
				);
			}

			const deathrattles = input.attackingBoard.filter(
				(e) => !isDead(e) && hasValidDeathrattle(e, input.attackingHero, input.gameState),
			);
			const deathrattleCandidate = deathrattles[deathrattles.length - 1];
			if (!!deathrattleCandidate) {
				input.gameState.spectator.registerPowerTarget(
					input.attacker,
					deathrattleCandidate,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
				);
				processDeathrattleForMinion(
					deathrattleCandidate,
					input.attackingBoard.length - (input.attackingBoard.indexOf(deathrattleCandidate) + 1),
					[deathrattleCandidate],
					input.attackingHero.friendly
						? input.gameState.gameState.player
						: input.gameState.gameState.opponent,
					input.attackingHero.friendly
						? input.gameState.gameState.opponent
						: input.gameState.gameState.player,
					input.gameState,
					false,
				);
			}
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
