import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { addStatsToBoard } from '../../../utils';
import { AfterHeroDamagedCard } from '../../card.interface';

export const TimewarpedRewinder: AfterHeroDamagedCard = {
	cardIds: [CardIds.TimewarpedRewinder_BG34_Giant_300, CardIds.TimewarpedRewinder_BG34_Giant_300_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		input.hero.hpLeft = input.hero.hpLeft + input.damage;
		const mult = minion.cardId === CardIds.TimewarpedRewinder_BG34_Giant_300_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 0, 1 * mult, input.gameState, Race[Race.DEMON]);
	},
};
