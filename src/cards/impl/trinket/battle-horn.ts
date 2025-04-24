import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { AvengeInput } from '../../../simulation/avenge';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { TempCardIds } from '../../../temp-card-ids';
import { hasMechanic } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const BattleHorn: AvengeCard = {
	cardIds: [TempCardIds.BattleHorn],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const battlecries = input.board.filter((e) =>
			hasMechanic(input.gameState.allCards.getCard(e.cardId), GameTag[GameTag.BATTLECRY]),
		);
		const candidate = pickRandom(battlecries);
		if (!!candidate) {
			triggerBattlecry(input.board, input.hero, candidate, input.otherBoard, input.otherHero, input.gameState);
			input.gameState.spectator.registerPowerTarget(minion, candidate, input.board, input.hero, input.otherHero);
		}
	},
};
