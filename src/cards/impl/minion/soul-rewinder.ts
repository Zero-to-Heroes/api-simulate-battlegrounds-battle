import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { modifyStats } from '../../../simulation/stats';
import { AfterHeroDamagedCard } from '../../card.interface';

export const SoulRewinder: AfterHeroDamagedCard = {
	cardIds: [CardIds.SoulRewinder_BG26_174, CardIds.SoulRewinder_BG26_174_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		input.hero.hpLeft = input.hero.hpLeft + input.damage;
		const mult = minion.cardId === CardIds.SoulRewinder_BG26_174_G ? 2 : 1;
		modifyStats(minion, 0, 1 * mult, input.board, input.hero, input.gameState);
		if (input.hero.trinkets?.some((t) => t.cardId === CardIds.RewinderPortrait_BG30_MagicItem_868)) {
			modifyStats(minion, 1 * mult, 0, input.board, input.hero, input.gameState);
		}
	},
};
