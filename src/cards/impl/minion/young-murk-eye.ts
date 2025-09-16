import { CardIds, GameTag, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { hasCorrectTribe, hasEntityMechanic } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const YoungMurkEye: EndOfTurnCard = {
	cardIds: [CardIds.YoungMurkEye_BG22_403, CardIds.YoungMurkEye_BG22_403_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const allNeighbours = getNeighbours(input.board, minion, input.board.indexOf(minion)).filter((e) =>
			hasEntityMechanic(e, GameTag.BATTLECRY, input.gameState.allCards),
		);
		const validNeighbors = allNeighbours.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		);
		// const neighbours =
		// 	minion.cardId === CardIds.YoungMurkEye_BG22_403_G
		// 		? validNeighbors
		// 		: [pickRandom(validNeighbors)].filter((e) => !!e);
		const mult = minion.cardId === CardIds.YoungMurkEye_BG22_403_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			for (const neighbour of validNeighbors) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					neighbour,
					input.board,
					input.hero,
					input.otherHero,
				);
				triggerBattlecry(
					input.board,
					input.hero,
					neighbour,
					input.otherBoard,
					input.otherHero,
					input.gameState,
				);
			}
		}
	},
};
