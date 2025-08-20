import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { hasMinionBattlecry, triggerBattlecry } from '../../../simulation/battlecries';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { getValidDeathrattles } from '../../../simulation/deathrattle-utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const MonstrousMacaw: RallyCard = {
	cardIds: [CardIds.MonstrousMacaw_BGS_078, CardIds.MonstrousMacaw_TB_BaconUps_135],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const loops = minion.cardId === CardIds.MonstrousMacaw_TB_BaconUps_135 ? 2 : 1;
		const targetBoard = input.attackingBoard.filter((e) => e.entityId !== minion.entityId);

		const validDeathrattles = getValidDeathrattles(targetBoard, input.attackingHero, input.gameState);
		const leftMostDeathrattle = validDeathrattles[0];
		for (let i = 0; i < loops; i++) {
			if (!!leftMostDeathrattle) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					leftMostDeathrattle,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
				);
				const indexFromRight =
					input.attackingBoard.length - (input.attackingBoard.indexOf(leftMostDeathrattle) + 1);
				processDeathrattleForMinion(
					leftMostDeathrattle,
					indexFromRight,
					[leftMostDeathrattle],
					leftMostDeathrattle.friendly
						? input.gameState.gameState.player
						: input.gameState.gameState.opponent,
					leftMostDeathrattle.friendly
						? input.gameState.gameState.opponent
						: input.gameState.gameState.player,
					input.gameState,
					false,
				);
			}

			if (input.attackingHero.trinkets?.some((t) => t.cardId === CardIds.MacawPortrait_BG32_MagicItem_803)) {
				const validBattlecries = targetBoard.filter((e) => hasMinionBattlecry(e, input.gameState));
				const leftMostBattlecry = validBattlecries[0];
				if (!!leftMostBattlecry) {
					input.gameState.spectator.registerPowerTarget(
						minion,
						leftMostBattlecry,
						input.attackingBoard,
						input.attackingHero,
						input.defendingHero,
					);
					triggerBattlecry(
						input.attackingBoard,
						input.attackingHero,
						leftMostBattlecry,
						input.defendingBoard,
						input.defendingHero,
						input.gameState,
					);
				}
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
