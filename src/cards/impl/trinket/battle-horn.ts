import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { pickRandom } from '../../../services/utils';
import { AvengeInput } from '../../../simulation/avenge';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { hasMechanic } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const BattleHorn: AvengeCard = {
	cardIds: [CardIds.BattleHorn_BG32_MagicItem_415],
	baseAvengeValue: (cardId: string) => 2,
	avenge: (trinket: BoardTrinket, input: AvengeInput) => {
		const battlecries = input.board.filter((e) =>
			hasMechanic(input.gameState.allCards.getCard(e.cardId), GameTag[GameTag.BATTLECRY]),
		);
		const candidate = pickRandom(battlecries);
		if (!!candidate) {
			triggerBattlecry(input.board, input.hero, candidate, input.otherBoard, input.otherHero, input.gameState);
			input.gameState.spectator.registerPowerTarget(trinket, candidate, input.board, input.hero, input.otherHero);
		}
	},
};
