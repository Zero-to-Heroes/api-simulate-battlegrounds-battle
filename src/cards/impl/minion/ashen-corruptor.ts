import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { AfterHeroDamagedCard } from '../../card.interface';

export const AshenCorruptor: AfterHeroDamagedCard = {
	cardIds: [CardIds.AshenCorruptor_BG32_873, CardIds.AshenCorruptor_BG32_873_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		input.hero.hpLeft = input.hero.hpLeft + input.damage;
	},
};
