import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAfterAttackInput } from '../../../simulation/after-attack';
import { hasMinionBattlecry, triggerBattlecry } from '../../../simulation/battlecries';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { getValidDeathrattles } from '../../../simulation/deathrattle-utils';
import { OnAfterAttackCard } from '../../card.interface';

export const MonstrousMacaw: OnAfterAttackCard = {
	cardIds: [CardIds.MonstrousMacaw_BGS_078, CardIds.MonstrousMacaw_TB_BaconUps_135],
	onAnyMinionAfterAttack: (minion: BoardEntity, input: OnAfterAttackInput) => {
		if (input.attacker !== minion) {
			return;
		}

		const loops = minion.cardId === CardIds.MonstrousMacaw_TB_BaconUps_135 ? 2 : 1;
		const targetBoard = input.attackingBoard.filter((e) => e.entityId !== minion.entityId);

		const validDeathrattles = getValidDeathrattles(targetBoard, input.attackingHero, input.gameState);
		const leftMostDeathrattle = validDeathrattles[0];
		if (!!leftMostDeathrattle) {
			for (let i = 0; i < loops; i++) {
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
	},
};
