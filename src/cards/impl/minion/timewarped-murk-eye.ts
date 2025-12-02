import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { hasEntityMechanic } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedMurkEye: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedMurkEye_BG34_Giant_318, CardIds.TimewarpedMurkEye_BG34_Giant_318_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const targets = input.board.filter((e) => hasEntityMechanic(e, GameTag.BATTLECRY, input.gameState.allCards));
		const mult = minion.cardId === CardIds.TimewarpedMurkEye_BG34_Giant_318_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			for (const target of targets) {
				input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
				triggerBattlecry(input.board, input.hero, target, input.otherBoard, input.otherHero, input.gameState);
			}
		}
	},
};
